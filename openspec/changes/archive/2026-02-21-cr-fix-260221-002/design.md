## Context

`app/admin/monitoring/page.tsx` 設定 `export const runtime = 'edge'`，部署至 Cloudflare Pages 時以 Cloudflare Workers 執行。原本使用 Firebase Client SDK（`firebase/firestore`）讀取 Firestore，但該 SDK 在 Workers Edge Runtime 中觸發 unhandled exception（Error 1101）。

專案已有 `lib/firebase-rest.ts`，以 Web Crypto API + fetch 實作 Firestore 寫入（`setDoc`、`addDoc`），完全相容 Edge Runtime，但缺少讀取集合的函式。

## Goals / Non-Goals

**Goals:**
- 在 `lib/firebase-rest.ts` 新增 `listDocs<T>()` 以 REST API 讀取 Firestore 集合
- 監控頁面改用 `listDocs` 取代 Firebase Client SDK，消除 Error 1101

**Non-Goals:**
- 不修改監控頁面 UI
- 不處理分頁（Firestore REST pageToken）
- 不新增即時更新功能

## Decisions

### 決策 1：擴充 `firebase-rest.ts` 而非建立新模組

**選擇**：在既有 `lib/firebase-rest.ts` 新增 `listDocs`

**理由**：
- Access token 快取邏輯已存在，避免重複
- 保持 Firebase REST 操作集中於單一模組
- 其他選項（Firebase Admin SDK）在 Edge Runtime 有 Node.js 依賴問題

### 決策 2：泛型 `listDocs<T>()`

**選擇**：函式使用泛型參數，回傳 `T[]`

**理由**：`DeviceDoc`、`PhotoDoc` 等型別都可複用，不需為每個集合建立獨立函式

### 決策 3：`timestampValue` 轉換為毫秒 Unix timestamp

**選擇**：`parseFirestoreValue` 將 Firestore `timestampValue`（ISO string）轉為 `number`（ms）

**理由**：與現有 `DeviceDoc.last_heartbeat`（`number`）型別一致，UI 端無需額外轉換

## Risks / Trade-offs

- **Firestore 文件數量**：`listDocs` 一次抓取整個集合，裝置數少（< 100）無影響；若未來裝置數大增需加分頁 → Mitigation：先觀察，必要時加 `pageToken` 支援
- **Access token 快取**：Module-level 快取在 Worker instance 重啟時失效，首次請求多一次 OAuth 交換 → 可接受，正常操作

## Migration Plan

1. 部署新版本（含修改的 `firebase-rest.ts` 與 `monitoring/page.tsx`）
2. Cloudflare Pages 自動部署後訪問 `/admin/monitoring` 驗證無 Error 1101
3. 無需 rollback plan（純加法修改，不影響其他路由）
