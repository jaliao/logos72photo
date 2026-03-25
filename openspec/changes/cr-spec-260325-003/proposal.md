## Why

正式環境完全沒有任何封面照片。原因有三：
1. Cloud Function `generateCover` 的裝置過濾條件寫錯（`'iphone2'` vs 實際的 `'iphone-2'`），導致所有照片都被跳過，從未生成封面
2. `generate-covers.mjs` 批次腳本未依 `device_id` 過濾，會拿任何裝置的第一張照片，而非指定的 `iphone-2`
3. `setHasCoverFlag()` 使用帶 `updateMask` 的 Firestore REST PATCH，對不存在的文件回傳 404，導致 flag 寫入失敗

需求：封面照片 SHALL 使用每個 slotGroup 中 `device_id === 'iphone-2'` 的第一張照片（依 `timestamp` 升冪）。

## What Changes

- 修正 Cloud Function `generateCover` 的裝置 ID 過濾：`'iphone2'` → `'iphone-2'`
- 修正 `generate-covers.mjs` 的 Firestore 查詢：加入 `device_id` 欄位，僅使用 `iphone-2` 的照片選封面
- 修正 `setHasCoverFlag()` 的 Firestore PATCH：移除 `updateMask`，改為建立或取代語意，確保文件不存在時也能寫入

## Capabilities

### New Capabilities
- （無新 capability，純修正既有流程）

### Modified Capabilities
- `slot-cover-generator`：修正 Cloud Function 裝置過濾條件 + 修正批次腳本 device_id 篩選 + 修正 flag 寫入邏輯

## Impact

- `functions/src/generateCover.ts`：修正 `device_id !== 'iphone2'` → `device_id !== 'iphone-2'`
- `scripts/generate-covers.mjs`：查詢加入 `device_id` 欄位，過濾僅保留 `iphone-2` 的照片；移除 `setHasCoverFlag()` 的 `updateMask`
- Firestore `slotGroups` collection：資料結構不變，修正寫入可靠性

## Non-goals

- 不更動封面影像合成邏輯（裁切、浮水印、尺寸）
- 不更動 `lib/firebase-rest.ts` 的 `getSlotGroupDoc()` 讀取邏輯（確認正確）
- 不重構相簿頁面 UI
- 不更動上傳 API 的裝置 ID 儲存邏輯
