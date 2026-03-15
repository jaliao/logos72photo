## Why

活動攝影師依時段分組拍攝，需要一個能將照片依 8 碼分組編號歸類的相簿頁面，讓來賓可透過獨立網址查看自己時段的照片。目前系統缺乏「個人時段分組」概念，無法依時段篩選展示。

## What Changes

- 定義 8 碼分組編號格式：`MMDDHHSS`（月日 + 小時 + 子時段 01–04）
- 每小時切為 4 個子時段（每 15 分鐘一組）：`SS=01`（:00–:14）、`SS=02`（:15–:29）、`SS=03`（:30–:44）、`SS=04`（:45–:59）
- `HH` 為實際小時（`00`–`23`），`01:00–01:59` → `HH=01`
- 自動拍照上傳時依台灣伺服器時間**自動計算並寫入** slotGroup（由現有 `dateStr` + `slot_15m` 推導），無需 EXIF 或手動指定
- 新增個人時段相簿頁面，網址包含分組號碼，展示該組照片

## Capabilities

### New Capabilities
- `slot-group-album`: 個人時段分組相簿頁面，依 8 碼分組號碼（MMDDHHSS）呈現照片，提供獨立網址與分組編號顯示

### Modified Capabilities
- `photo-upload-api`: 自動拍照上傳時由 `dateStr` + `slot_15m` 推導並寫入 `slotGroup`（8 碼字串）
- `photo-retrieval-ui`: 支援依分組號碼篩選查詢照片

## Impact

- **資料模型**：照片記錄新增 `slotGroup` 欄位（8 碼，如 `03130101`）
- **路由**：新增 `/album/[slotGroup]` 頁面
- **API**：`photo-upload-api` 新增 slotGroup 參數；新增查詢 API `GET /api/photos?slotGroup=MMDDHHSS`
- **非目標（Non-goals）**：不實作分組號碼的自動指派；不修改現有相機拍照流程；不提供分組管理後台（本次只做前端展示）
