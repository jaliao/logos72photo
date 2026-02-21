## MODIFIED Requirements

### Requirement: 時段導覽入口
使用者無需登入，可直接透過日期與 8 小時大時段選單進入。日期選擇器的文字 SHALL 以黑色（`text-zinc-900`）顯示，確保在各瀏覽器（含 iOS Safari）均清晰可讀。

#### Scenario: 選擇日期與大時段
- **WHEN** 使用者進入首頁
- **THEN** 系統提供日期選擇器與三個時段按鈕（0-8, 8-16, 16-24）

#### Scenario: 日期選擇器文字為黑色
- **WHEN** 使用者在首頁看到日期輸入框
- **THEN** 輸入框內的文字 SHALL 顯示為黑色，不得顯示為系統預設的灰色或透明

### Requirement: 1 小時子相簿列表
系統 SHALL 展示選定 8 小時大時段內的 8 個 1 小時子相簿，供使用者快速選取。每個相簿格子顯示該小時是否有照片。Firestore 查詢 SHALL 透過 REST API 執行，不使用 Firebase Client SDK，以確保 Edge Runtime（Cloudflare Workers）相容性。

#### Scenario: 瀏覽 1 小時子相簿清單
- **GIVEN** 已選定日期與 8 小時大時段
- **WHEN** 系統進入相簿列表頁面
- **THEN** 系統 SHALL 展示 8 個 1 小時間隔的相簿格子（例如 08:00, 09:00, 10:00...）

#### Scenario: 有照片的相簿格子標示有照片
- **WHEN** 某 1 小時區間內存在至少一張照片
- **THEN** 對應格子 SHALL 以深色背景顯示，並標示「有照片」

#### Scenario: 無照片的相簿格子仍可點擊
- **WHEN** 某 1 小時區間內無任何照片
- **THEN** 對應格子 SHALL 以淺色背景顯示，點擊後進入空相簿頁面

### Requirement: 相簿照片瀏覽與下載
使用者在進入 1 小時相簿後，可預覽該小時內的所有照片並執行下載。Firestore 查詢 SHALL 透過 REST API 執行，不使用 Firebase Client SDK，以確保 Edge Runtime（Cloudflare Workers）相容性。

#### Scenario: 預覽與下載相簿照片
- **WHEN** 使用者點擊特定的 1 小時相簿
- **THEN** 系統 SHALL 顯示該小時內兩台裝置拍攝的所有照片，依拍攝時間由早到晚排列
- **AND** 使用者可單張預覽或選擇下載

#### Scenario: 空相簿顯示提示
- **WHEN** 使用者進入某 1 小時相簿，但該小時無任何照片
- **THEN** 頁面 SHALL 顯示「此時段尚無照片」提示，而非空白畫面

## REMOVED Requirements

### Requirement: 15 分鐘子相簿列表
**Reason**: 以 15 分鐘為單位顯示 32 個格子，視覺上過於細碎，改為 1 小時分組（8 格）更符合實際瀏覽需求。
**Migration**: 舊 15 分鐘 URL（`/gallery/{date}/{slot}/{slot15m}`）不需向下相容。
