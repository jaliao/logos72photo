## ADDED Requirements

### Requirement: 縮圖不加浮水印
Image Service SHALL 輸出不含浮水印的縮圖。`WATERMARK_ENABLED` 環境變數 SHALL 設為 `"false"`，浮水印合成邏輯 SHALL 從程式碼中移除。

#### Scenario: 縮圖不含浮水印
- **WHEN** 任何客戶端請求 `/resizing/{width}/{quality}/{r2Key}`
- **THEN** Image Service SHALL 回傳不含浮水印的縮圖，不讀取 R2 `assets/watermark.png`

#### Scenario: L2 快取鍵不變
- **WHEN** Image Service 處理 cache miss 並寫入 L2 快取
- **THEN** 系統 SHALL 以原有路徑格式 `thumbnails/{width}w_{quality}q/{r2Key}` 寫入無浮水印縮圖
