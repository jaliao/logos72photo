## MODIFIED Requirements

### Requirement: 中央監控儀表板
系統必須提供一個管理員頁面，整合所有裝置的運作資訊。

#### Scenario: 檢視裝置清單
- **WHEN** 工作人員進入 /admin/monitoring 頁面
- **THEN** 看到所有已註冊 iPhone 的卡片，顯示：
  - 裝置名稱/ID
  - 目前電池電量
  - 最後上傳照片的縮圖（SHALL 透過 image-service URL 載入，格式為 `/resizing/640/80/{r2_key}`）
  - 最後一次心跳/拍照時間

#### Scenario: 縮圖 fallback
- **WHEN** image-service URL 載入失敗
- **THEN** 監控頁 SHALL 改用原始 R2 URL（`last_photo_url`）顯示，不得顯示破圖
