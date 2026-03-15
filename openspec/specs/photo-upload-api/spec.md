### Requirement: 上傳 API 伺服器端錯誤回報
`/api/upload` Route Handler SHALL 在 catch 區塊捕捉 `err` 參數，並透過 Admin SDK 直接寫入 Firestore `error_logs`（不透過 `/api/log-error`），`source` 固定為 `upload-api`，`device_id` 取自請求中可識別的裝置資訊（如有），`message` 為 `err.message` 或描述性字串。

#### Scenario: 上傳處理拋出例外時寫入日誌
- **WHEN** `/api/upload` 處理過程拋出任何例外
- **THEN** handler SHALL 捕捉 `err`，呼叫 Admin SDK 寫入 `error_logs`，`source` 為 `upload-api`，`message` 為 `err.message`，並回傳 `500` 給 client

#### Scenario: 日誌寫入失敗不影響錯誤回應
- **WHEN** Admin SDK 寫入 Firestore 時發生例外
- **THEN** handler SHALL 靜默忽略寫入錯誤，仍正常回傳 `500` 給 client

### Requirement: 自動拍照上傳時計算並寫入 slotGroup
`/api/upload` Route Handler SHALL 在處理自動拍照上傳時，依伺服器接收的台灣時間（`taiwanNow`）計算 8 碼分組編號 `slotGroup`，並將其寫入 Firestore `photos/{id}` 文件。`slotGroup` SHALL 由現有的 `dateStr` 與 `slot_15m` 推導，不需額外解析 EXIF。

計算規則（台灣時間）：
- `MM` = `dateStr.slice(5, 7)`（月份，零填補 2 碼）
- `DD` = `dateStr.slice(8, 10)`（日期，零填補 2 碼）
- `HH` = `Math.floor(slot_15m / 60)`（小時，零填補 2 碼）
- `SS` = `Math.floor((slot_15m % 60) / 15) + 1`（子時段 01–04，零填補 2 碼）
- `slotGroup` = `MM + DD + HH + SS`

#### Scenario: 自動拍照上傳時寫入正確 slotGroup
- **WHEN** 相機在台灣時間 `2026-03-13 01:37` 自動拍照並上傳
- **THEN** handler SHALL 計算 `slot_15m = 90`（01:30），`slotGroup = "03130103"`，並寫入 Firestore `photos/{id}.slotGroup`

#### Scenario: slotGroup 正確對應每小時 4 個邊界
- **WHEN** 照片拍攝時間分別對應 `slot_15m` 值 `0`、`15`、`30`、`45`（即 00:00–、00:15–、00:30–、00:45–）
- **THEN** handler SHALL 分別計算 `SS=01`、`SS=02`、`SS=03`、`SS=04`

#### Scenario: 跨小時邊界計算正確
- **WHEN** 照片拍攝台灣時間為 `02:00`（`slot_15m = 120`）
- **THEN** handler SHALL 計算 `HH=02`、`SS=01`，`slotGroup` 結尾為 `"0201"`
