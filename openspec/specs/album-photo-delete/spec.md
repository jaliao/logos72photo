## ADDED Requirements

### Requirement: 照片刪除 API
系統 SHALL 提供 `DELETE /api/album/photos` 端點，接受 `{ r2Url: string }` 請求體，驗證請求方的 `album_session` cookie 後刪除 Firestore 對應文件。

#### Scenario: 成功刪除照片
- **WHEN** 已驗證的訪客發送 `DELETE /api/album/photos` 並帶有有效 `r2Url`
- **THEN** 系統 SHALL 查詢 Firestore `photos` 集合中 `r2_url == r2Url` 的文件、刪除該文件，並回傳 `200 OK`

#### Scenario: r2_url 查無文件
- **WHEN** 請求的 `r2Url` 在 Firestore 中不存在對應文件
- **THEN** 系統 SHALL 回傳 `404 Not Found`

#### Scenario: 無有效 album_session
- **WHEN** 請求未帶有效 `album_session` cookie
- **THEN** 系統 SHALL 回傳 `401 Unauthorized`，不執行任何刪除

### Requirement: 刪除授權驗證
API SHALL 驗證欲刪除照片的 `slot_group` 與 `album_session` 解碼出的 `slotGroup` 一致，防止訪客跨時段越權刪除。

#### Scenario: slot_group 與 session 一致時允許刪除
- **WHEN** 照片的 `slot_group` 與 `album_session` 解碼值相符
- **THEN** 系統 SHALL 執行刪除並回傳 `200 OK`

#### Scenario: slot_group 與 session 不一致時拒絕
- **WHEN** 照片的 `slot_group` 與 `album_session` 解碼值不符
- **THEN** 系統 SHALL 回傳 `403 Forbidden`，不刪除任何資料

### Requirement: 刪除範圍限於 Firestore
刪除操作 SHALL 僅刪除 Firestore `photos/{docId}` 文件，不刪除 R2 原圖（R2 孤立檔案不再出現於任何查詢結果，影響可接受）。

#### Scenario: 刪除後 R2 原圖仍存在
- **WHEN** 照片文件從 Firestore 刪除後
- **THEN** R2 中對應的原圖檔案 SHALL 仍然存在，系統不嘗試刪除 R2 物件
