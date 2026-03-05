## Context

目前 CameraClient 與 `/api/upload` 的 `catch` 區塊沒有捕捉 `err` 參數，錯誤被靜默吞掉，現場無法診斷失敗原因。

需要一套輕量、低維護的錯誤日誌機制：
- Client 端錯誤透過 REST API 非同步送出，不阻塞主流程
- Server 端錯誤直接透過 Admin SDK 寫入
- 日誌 7 天後自動到期（Firestore TTL），無需額外清理工作
- 後台可依日期查閱錯誤，預設顯示今日（台灣時間）

## Goals / Non-Goals

**Goals:**
- 統一錯誤日誌格式並寫入 Firestore `error_logs` 集合
- Client 端新增 `logError()` helper，呼叫 `/api/log-error`（Edge Runtime）
- Server 端（`/api/upload`）直接使用 Admin SDK 寫入
- 後台頁面 `/admin/errors` 依日期列出錯誤記錄
- Firestore TTL 欄位 `expires_at` 設為 7 天自動刪除

**Non-Goals:**
- 即時告警（LINE Notify、Email）
- 錯誤統計圖表
- Client 端離線佇列重試機制

## Decisions

### 1. 使用 Firestore 而非 Firebase Realtime Database 儲存錯誤日誌

**選擇：** Firestore
**理由：** Firestore 原生支援 TTL policy（欄位層級自動過期），RTDB 不支援；查詢依日期篩選也較結構化。
**替代方案：** RTDB + Cloud Function 定期清除 → 需額外維護，排除。

### 2. Client 端透過 `/api/log-error` 送出，而非直接呼叫 Firestore REST

**選擇：** Next.js Route Handler（Edge Runtime）代理寫入
**理由：** Admin SDK 私鑰不能暴露在 client bundle；透過 API route 統一驗證與格式控制。
**替代方案：** Firestore REST API + Service Account token 在 client 端產生 → 安全風險，排除。

### 3. `logError()` 送出失敗時靜默忽略

**選擇：** fire-and-forget，不 await，catch 後靜默
**理由：** 錯誤日誌本身不能影響主流程（相機拍照）。若日誌 API 失敗，不應再遞迴觸發另一個錯誤。

### 4. 日期索引欄位 `date`（台灣時間 YYYY-MM-DD）

**選擇：** 在寫入時由 server 端計算 `date` 字串（`Asia/Taipei` 時區）
**理由：** Firestore 查詢不支援時區轉換，預先存 `date` 字串可直接 `where("date", "==", ...)` 篩選，後台不需做時區計算。

## Risks / Trade-offs

- **Firestore 費用**：每次錯誤一次寫入，低頻場景可接受；若未來錯誤量暴增需重新評估。→ TTL 7 天已限制資料量上限。
- **TTL 延遲刪除**：Firestore TTL 刪除非即時（可能延遲數小時）。→ 後台查詢只撈 7 天內，實際影響可接受。
- **Edge Runtime 限制**：`/api/log-error` 跑在 Edge，需確認 `firebase-rest.ts` 的 Admin SDK 實作相容（已有 WebCrypto 版本）。

## Migration Plan

1. 在 Firestore Console 於 `error_logs` 集合設定 TTL policy，欄位指向 `expires_at`（Timestamp 型別）
2. 部署新代碼（API route、CameraClient 修改、upload 修改）
3. 確認後台 `/admin/errors` 可正常查詢
4. **Rollback**：移除 `/api/log-error` route 並還原 catch 區塊即可，Firestore 資料不影響主功能

## Open Questions

- `error_logs` 是否需要 Firestore Security Rules 限制讀取（僅 admin）？→ 後台已透過 server-side rendering 呼叫 Admin SDK，client 不直接讀取，暫時可不設。
- 是否需要記錄 user agent 或 IP？→ 目前設計不收集，待觀察需求。
