## ADDED Requirements

### Requirement: 上傳照片檔案大小最小值守衛
`/api/upload` Route Handler SHALL 在讀取完 `photo.arrayBuffer()` 後、呼叫 `uploadToR2()` 之前，檢查 `body.byteLength`。若 `body.byteLength < MIN_PHOTO_BYTES`（300,000），SHALL 拒絕本次上傳，不寫入 R2，不寫入 Firestore `photos`，並回傳 HTTP 400。`MIN_PHOTO_BYTES` SHALL 定義為檔案頂部的具名常數。

#### Scenario: 過小的照片被拒絕
- **WHEN** 裝置上傳的 JPEG 檔案 byteLength 為 150,000（< 300,000）
- **THEN** handler SHALL 不呼叫 `uploadToR2()`，不寫入 Firestore，並回傳 `{ error: '照片檔案過小，已拒絕' }` 與 HTTP 400

#### Scenario: 正常大小的照片通過守衛
- **WHEN** 裝置上傳的 JPEG 檔案 byteLength 為 600,000（>= 300,000）
- **THEN** handler SHALL 繼續正常上傳流程，存入 R2 並寫入 Firestore

#### Scenario: 剛好等於閾值的照片通過守衛
- **WHEN** 裝置上傳的 JPEG 檔案 byteLength 為 300,000（= MIN_PHOTO_BYTES）
- **THEN** handler SHALL 視為正常，繼續上傳流程

### Requirement: 拒絕壞圖時寫入 error_logs
當照片因大小不足被拒絕時，`/api/upload` SHALL 呼叫 `writeErrorLog()` 寫入 Firestore `error_logs`，`source` 固定為 `"upload-size-guard"`，`message` 包含實際 `byteLength` 數值。

#### Scenario: 拒絕時寫入可查詢的錯誤紀錄
- **WHEN** 上傳照片 byteLength 為 80,000，被大小守衛拒絕
- **THEN** handler SHALL 呼叫 `writeErrorLog(deviceId, '照片過小，byteLength: 80000')`，寫入 `error_logs`，`source` 為 `"upload-size-guard"`

#### Scenario: error_logs 寫入失敗不影響 400 回應
- **WHEN** `writeErrorLog()` 在寫入 Firestore 時拋出例外
- **THEN** handler SHALL 靜默忽略，仍正常回傳 HTTP 400 給 client
