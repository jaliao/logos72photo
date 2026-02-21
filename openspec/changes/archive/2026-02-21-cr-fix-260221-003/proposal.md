## Why

相簿瀏覽頁（`/gallery/[date]/[slot]` 與 `/gallery/[date]/[slot]/[album]`）在正式環境發生 Worker exception，原因與監控頁面相同：頁面設定 `runtime = 'edge'`，卻使用 Firebase Client SDK（`firebase/firestore`），而該 SDK 在 Cloudflare Workers Edge Runtime 中不相容。同時，首頁日期選擇器文字色不夠清晰，以及相片目前以 15 分鐘為單位顯示，使用者希望改為以 1 小時為單位分組，更方便瀏覽。

## What Changes

- 將 `app/gallery/[date]/[slot]/page.tsx` 的 Firestore 查詢改為 REST API（`lib/firebase-rest.ts`），修復 Edge Runtime 錯誤
- 將 `app/gallery/[date]/[slot]/[album]/page.tsx` 的 Firestore 查詢改為 REST API，修復 Edge Runtime 錯誤
- 在 `lib/firebase-rest.ts` 新增 `queryPhotos()` 輔助函式，支援多條件 WHERE 的 Firestore structured query
- `app/page.tsx` 日期 `<input>` 新增 `text-zinc-900`，確保文字為黑色
- 相簿列表頁（SlotPage）從顯示 32 個 15 分鐘格子改為顯示 8 個 1 小時格子
- 相簿頁（AlbumPage）從查單一 slot_15m 改為查詢該小時內所有 4 個 15 分鐘的照片

## Non-goals

- 不修改照片上傳流程或 Firestore 資料結構（不新增 `slot_1h` 欄位）
- 不調整監控儀表板
- 不實作照片分頁（pagination）

## Capabilities

### New Capabilities
<!-- 無 -->

### Modified Capabilities
- `photo-retrieval-ui`：子相簿單位由 15 分鐘改為 1 小時；Firestore 查詢改為 REST API（Edge Runtime 相容）；日期選擇器文字色確保為黑色

## Impact

- `lib/firebase-rest.ts`：新增 `queryPhotos()` 函式（Firestore runQuery REST endpoint）
- `app/gallery/[date]/[slot]/page.tsx`：移除 Firebase Client SDK，改用 `queryPhotos`；groupBy 邏輯改為 1 小時
- `app/gallery/[date]/[slot]/[album]/page.tsx`：移除 Firebase Client SDK，改用 `queryPhotos`；查詢條件改為 1 小時範圍
- `app/page.tsx`：date input 新增 `text-zinc-900`
