## Why

監控儀表板頁面（`/admin/monitoring`）在正式環境（Cloudflare Pages）觸發 Error 1101（Worker threw exception）。根本原因是該頁面設定 `runtime = 'edge'`，卻使用 Firebase Client SDK（`firebase/firestore`），而該 SDK 依賴 Node.js/瀏覽器原生 API，在 Cloudflare Workers Edge Runtime 中無法執行。

## What Changes

- 在 `lib/firebase-rest.ts` 新增 `listDocs<T>()` 函式，以 Firestore REST API 讀取集合所有文件（完全相容 Edge Runtime）
- 新增內部輔助函式 `parseFirestoreFields` / `parseFirestoreValue`，將 Firestore REST 回應格式解析為 TypeScript 物件
- `app/admin/monitoring/page.tsx` 移除 `firebase/firestore` 與 `lib/firebase` 的 import，改用 `listDocs` 取得裝置資料

## Non-goals

- 不改動監控儀表板的 UI 介面
- 不新增即時更新（Firestore onSnapshot）功能
- 不調整其他使用 Firebase Client SDK 的頁面或 API 路由

## Capabilities

### New Capabilities

無（此次為修復，不新增對外能力）

### Modified Capabilities

- `cloudflare-pages-deploy`：監控頁面的 Firestore 資料來源由 Client SDK 改為 REST API，確保 Edge Runtime 相容性

## Impact

- `lib/firebase-rest.ts`：新增 `listDocs`、`parseFirestoreFields`、`parseFirestoreValue`
- `app/admin/monitoring/page.tsx`：移除 Firebase Client SDK 依賴
- 無 API 路由、資料庫 schema、或環境變數異動
