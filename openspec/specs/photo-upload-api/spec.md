### Requirement: 上傳 API 伺服器端錯誤回報
`/api/upload` Route Handler SHALL 在 catch 區塊捕捉 `err` 參數，並透過 Admin SDK 直接寫入 Firestore `error_logs`（不透過 `/api/log-error`），`source` 固定為 `upload-api`，`device_id` 取自請求中可識別的裝置資訊（如有），`message` 為 `err.message` 或描述性字串。

#### Scenario: 上傳處理拋出例外時寫入日誌
- **WHEN** `/api/upload` 處理過程拋出任何例外
- **THEN** handler SHALL 捕捉 `err`，呼叫 Admin SDK 寫入 `error_logs`，`source` 為 `upload-api`，`message` 為 `err.message`，並回傳 `500` 給 client

#### Scenario: 日誌寫入失敗不影響錯誤回應
- **WHEN** Admin SDK 寫入 Firestore 時發生例外
- **THEN** handler SHALL 靜默忽略寫入錯誤，仍正常回傳 `500` 給 client
