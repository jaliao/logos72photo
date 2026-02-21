## Context

監控儀表板（`app/admin/monitoring/page.tsx`）目前為 Server Component，每次開啟頁面才從 Firestore 取得一次裝置資料，工作人員必須手動重整才能看到最新狀態。心跳間隔 30 秒過長，且儀表板沒有離線警告與「下次心跳時間」資訊。

現有架構：
- 裝置資料存於 Firestore `devices` 集合（`DeviceDoc`）
- 心跳由 `CameraClient.tsx` 每 30 秒 POST 至 `/api/heartbeat`
- Admin SDK 從 server-side 讀取 Firestore（REST API）
- Firebase client SDK 已初始化（`lib/firebase-app.ts`），並用於 RTDB 監聽

## Goals / Non-Goals

**Goals:**
- 儀表板資料自動即時更新（連線狀態、電量、縮圖）
- 顯示「下次心跳預計時間」倒數
- 裝置離線時顯示醒目警告 Badge
- 心跳間隔縮短至 15 秒
- `/admin` 路由加入密碼保護（防止未授權存取）

**Non-Goals:**
- 不實作 Firebase Auth（email/password 登入為過度設計）
- 不變更 Firestore 資料模型（`DeviceDoc` 結構不動）
- 不實作 push notification 或 email 告警

## Decisions

### 決策 1：儀表板使用 client SDK `onSnapshot` 而非 polling

**選項 A（選用）**：監控頁改為 Client Component，使用 Firebase client SDK `onSnapshot` 監聽 `devices` 集合。裝置資料有變動時立即推送到瀏覽器。

**選項 B**：新增 `/api/devices` Route Handler，前端每 N 秒 polling。

選用 A，理由：
- 系統已有 Firebase client SDK，RTDB `onValue` 已驗證此模式可行
- `onSnapshot` 為 push-based，延遲 < 1 秒，polling 至少有間隔延遲
- 不需要新增 API route

**代價**：需要設定 Firestore Security Rules 允許 client 讀取 `devices` 集合（目前由 Admin SDK server-side 讀取，不受 rules 限制）。暫以 `allow read: if true` 開放（與目前 /admin 頁面無認證一致），待 auth feature 完成後收緊。

---

### 決策 2：`now` 由 client-side `setInterval` 驅動

HeartbeatStatus、離線警告、下次心跳倒數都依賴「當前時間」與 `last_heartbeat` 的差值。Client Component 中以 `useState<number>` 儲存 `now`，每 1 秒更新，確保倒數顯示流暢。

---

### 決策 3：離線閾值 = 心跳間隔 × 3

若閾值設 = 間隔 × 1，任何一次心跳遺漏（網路抖動）即觸發警告，誤報率高。設 × 3（= 45 秒）可容忍 2 次心跳失敗，實際斷線才警告。

---

### 決策 4：心跳間隔常數集中管理

在 `lib/constants.ts`（新增）定義 `HEARTBEAT_INTERVAL_MS = 15_000`，供 `CameraClient.tsx`（發送心跳）與監控頁（計算下次時間、離線閾值）共用，避免散落各處的魔術數字。

---

### 決策 6：`/admin` 路由保護機制

**背景**：`/admin` 路由目前完全開放，本次改版後儀表板需要 Firestore client-side 連線，若無任何保護，任何知道 URL 的人都能查看裝置狀態與照片。

**選項比較：**

| 方案 | 複雜度 | 安全性 | 適合性 |
|------|--------|--------|--------|
| Firebase Auth（email/password） | 高 | 高 | ❌ 過度設計，需額外 Firebase 設定 |
| HTTP Basic Auth（Next.js middleware） | 低 | 中 | ⚠️ 無 UI、不易登出 |
| **Cookie + 密碼登入頁（選用）** | 中 | 中 | ✅ 簡單、有 UI、可登出 |
| Query param secret | 極低 | 低 | ❌ 易洩漏於 log/history |

**選用：Next.js Middleware + Cookie 密碼驗證**

- 環境變數 `ADMIN_PASSWORD`（server-side only，非 `NEXT_PUBLIC_`）
- 新增 `/admin/login` 頁面：輸入密碼 → 呼叫 Server Action 驗證 → 設定 HttpOnly cookie（`admin_session`）
- `middleware.ts`：攔截所有 `/admin/**` 路由，無有效 cookie 時重導向 `/admin/login`
- Firestore Rules：`devices` 集合可維持 `allow read: if true`（app 層已有密碼保護，且裝置資料敏感度低）

---

### 決策 5：移除 Edge Runtime 限制

`monitoring/page.tsx` 目前有 `export const runtime = 'edge'`。Firebase client SDK（`@firebase/firestore`）不相容 Edge Runtime，改為 Client Component 後此設定無意義，直接移除。

---

## Risks / Trade-offs

| 風險 | 緩解方式 |
|------|---------|
| Firestore Security Rules 開放 `devices` 讀取，資料暴露 | /admin 路由本身也無認證保護；待 auth feature 收緊 rules |
| 多個管理員同時開啟儀表板，增加 Firestore 讀取量 | 每次心跳讀取 = 裝置數 × 管理員數；3 台裝置 + 3 位管理員 = 9 reads/15s，每日 51,840，仍在 50K 讀取免費額度邊緣（需留意）|
| `onSnapshot` 連線斷線重連 | Firebase SDK 自動重連，無需額外處理 |
| 縮圖 URL 更新後 Next.js Image 快取舊圖 | `last_photo_url` 帶有唯一 timestamp 或 key，快取自動 bust；若無，可在 URL 加 `?t=<ts>` |

## Migration Plan

1. 新增 `lib/constants.ts`，定義 `HEARTBEAT_INTERVAL_MS`
2. 修改 `app/camera/CameraClient.tsx`：引用常數，間隔從 30s 改 15s
3. 修改 `app/admin/monitoring/page.tsx`：改為 Client Component，加 `onSnapshot` 監聽
4. 新增 `app/admin/login/page.tsx`：密碼登入頁
5. 新增或修改 `middleware.ts`：保護 `/admin/**` 路由
6. 設定環境變數 `ADMIN_PASSWORD`（Vercel Dashboard）
7. 設定 Firestore Security Rules（Firebase Console）：允許 `devices` 集合讀取
8. 部署後驗證：開兩個視窗，一個觸發心跳，另一個儀表板應在 1 秒內更新

回滾：還原 `page.tsx` 與 `CameraClient.tsx`，Firestore Rules 恢復原狀。

## Open Questions

- Firestore `devices` 集合現有 Security Rules 為何？需確認目前 Firebase Console 的規則再決定最小必要開放範圍。
- 是否要同時顯示「下次心跳倒數」與「最後心跳絕對時間」，或二擇一？（目前設計為都顯示）
