## Why

相機裝置偶爾會上傳黑圖或損壞照片（通常檔案異常偏小），導致 R2 儲存被汙染、相簿出現無效圖片。需在寫入 R2 前過濾掉這類壞圖。

## What Changes

- `/api/upload` 在存入 R2 前，檢查上傳檔案的 byte 大小
- 若檔案大小 **< 300,000 bytes（300K）**，直接拋棄，不寫入 R2、不寫入 Firestore，回傳 `400` 給 client
- 拒絕時寫入一筆 `error_logs`，記錄裝置 ID、檔案大小與拒絕原因

## Capabilities

### New Capabilities
- `photo-upload-size-guard`：上傳尺寸守衛——在 `/api/upload` 中攔截過小的照片，防止壞圖進入儲存層

### Modified Capabilities
- `photo-upload-api`：新增「檔案大小最小值」requirement，小於閾值的上傳 SHALL 被拒絕並記錄

## Impact

- `app/api/upload/route.ts`：新增 size check 邏輯
- Firestore `error_logs`：新增 `source: "upload-size-guard"` 的拒絕紀錄
- R2：壞圖不再寫入，無向下相容問題
