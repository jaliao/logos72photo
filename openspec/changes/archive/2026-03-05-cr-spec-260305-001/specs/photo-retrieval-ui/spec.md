## MODIFIED Requirements

### Requirement: 相簿照片瀏覽與下載
使用者在進入 1 小時相簿後，可預覽該小時內的所有照片並執行下載。Firestore 查詢 SHALL 透過 REST API 執行，不使用 Firebase Client SDK，以確保 Edge Runtime（Cloudflare Workers）相容性。

#### Scenario: 預覽與下載相簿照片
- **WHEN** 使用者點擊特定的 1 小時相簿
- **THEN** 系統 SHALL 顯示該小時內兩台裝置拍攝的所有照片，依拍攝時間由早到晚排列
- **AND** 格狀檢視 SHALL 透過 image-service URL 載入縮圖（格式：`/resizing/640/80/{r2_key}`），而非原圖
- **AND** 使用者可單張預覽（載入原圖）或選擇下載

#### Scenario: 縮圖 fallback
- **WHEN** image-service 縮圖 URL 載入失敗
- **THEN** 系統 SHALL 改用原始 R2 URL 顯示，不得顯示破圖

#### Scenario: 空相簿顯示提示
- **WHEN** 使用者進入某 1 小時相簿，但該小時無任何照片
- **THEN** 頁面 SHALL 顯示「此時段尚無照片」提示，而非空白畫面
