## ADDED Requirements

### Requirement: 上傳前裝置啟用狀態驗證
`/api/upload` Route Handler SHALL 在處理上傳前，透過 Firestore REST API 讀取 `devices/{device_id}` 文件的 `enabled` 欄位。若 `enabled === false`，SHALL 回傳 `403 Forbidden`，body 為 `{ error: '裝置已停用' }`，且不執行任何 R2 上傳或 Firestore 寫入。若 Firestore 讀取失敗（網路錯誤、逾時），SHALL 視為啟用（fail open）繼續正常上傳流程。

#### Scenario: 停用裝置嘗試上傳
- **WHEN** `device_id = 'iphone-1'` 的上傳請求到達，Firestore `devices/iphone-1.enabled = false`
- **THEN** handler SHALL 回傳 `403`，body 含 `{ error: '裝置已停用' }`，不寫入 R2 或 Firestore

#### Scenario: 啟用裝置正常上傳
- **WHEN** `device_id = 'iphone-1'` 的上傳請求到達，Firestore `devices/iphone-1.enabled = true`
- **THEN** handler SHALL 繼續執行原有上傳流程，回傳 `200`

#### Scenario: 裝置文件不存在時 fail open
- **WHEN** `device_id = 'iphone-1'` 的上傳請求到達，Firestore `devices/iphone-1` 文件不存在
- **THEN** handler SHALL 視為啟用，繼續執行原有上傳流程

#### Scenario: Firestore 讀取失敗時 fail open
- **WHEN** 讀取 Firestore `devices/{device_id}` 時發生網路錯誤
- **THEN** handler SHALL 視為啟用，繼續執行原有上傳流程，不拋出錯誤
