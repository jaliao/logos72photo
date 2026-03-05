## ADDED Requirements

### Requirement: iPhone 端狀態監控
拍照頁面必須即時顯示裝置狀態，以便工作人員現場確認。

#### Scenario: 顯示心跳狀態
- **GIVEN** iPhone 處於拍照頁面
- **THEN** 顯示「心跳燈」動畫，且每 **15 秒**更新一次「最後連線時間」
- **AND** 若超過 5 分鐘未收到拍照指令，介面背景應轉為紅色警告色

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

### Requirement: 拍照成功視覺回饋
iPhone 在執行拍照動作時，必須提供明顯的視覺訊號。

#### Scenario: 拍照成功回饋
- **WHEN** 拍照成功完成並開始上傳
- **THEN** 螢幕邊框閃爍綠色，或顯示「拍照成功」的浮動提示
