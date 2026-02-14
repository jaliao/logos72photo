## ADDED Requirements

### Requirement: 照片上傳與 R2 存儲
系統在拍攝照片後，必須將檔案上傳至 Cloudflare R2，並確保檔名包含裝置 ID 與精確時間戳記。

#### Scenario: 成功上傳至 R2
- **WHEN** iPhone 完成拍照並將 Blob 資料上傳
- **THEN** 檔案儲存於 R2 Bucket，路徑結構應包含日期資訊 (e.g., `YYYY-MM-DD/device_id_timestamp.jpg`)

### Requirement: Firestore 中繼資料索引
每張照片的元數據必須記錄於 Firestore，並建立索引以支援按時段快速查詢。

#### Scenario: 建立 Firestore 記錄與索引
- **WHEN** 照片成功儲存於 R2
- **THEN** 系統在 Firestore 的 `photos` 集合中建立文件
- **AND** 文件包含：`r2_url`, `timestamp`, `device_id`, `date`, `slot_8h` (0, 8, 16), `slot_15m`