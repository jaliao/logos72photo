## ADDED Requirements

### Requirement: 後台帳密 Excel 匯出 API
系統 SHALL 提供 `GET /api/admin/slot-passwords/export` 端點，批次計算指定範圍內所有 slotGroup 的密碼並回傳 `.xlsx` 二進位檔案。

#### Scenario: 已驗證管理員下載 Excel
- **WHEN** 具有有效 `admin_session` cookie 的管理員請求 `GET /api/admin/slot-passwords/export`
- **THEN** 系統 SHALL 回傳 Content-Type 為 `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` 的 `.xlsx` 檔案，檔名為 `slot-passwords-YYYYMMDD.xlsx`

#### Scenario: 未驗證請求回傳 401
- **WHEN** 無 `admin_session` cookie 或 cookie 值不符的請求呼叫 `GET /api/admin/slot-passwords/export`
- **THEN** 系統 SHALL 回傳 HTTP 401，不回傳任何密碼資料

### Requirement: 匯出資料範圍
API SHALL 固定匯出從 slotGroup `03251803`（2026/03/25 18:30）至 `03303004`（2026/03/30 23:45）的所有帳密，共約 480 筆。

#### Scenario: Excel 欄位結構正確
- **WHEN** 管理員下載 Excel 並開啟
- **THEN** 工作表 SHALL 包含三欄，欄位順序為：「時段」（如 `03/25 18:30`）、「帳號」（8 碼數字）、「密碼」（8 碼數字）

#### Scenario: 資料從指定時段開始
- **WHEN** 管理員開啟下載的 Excel
- **THEN** 第一筆資料 SHALL 為 slotGroup `03251803`，最後一筆 SHALL 為 `03303004`

### Requirement: 時段標籤格式
`formatSlotGroupLabel()` SHALL 回傳「MM/DD HH:mm」格式（僅顯示起始時間），不含結束時間範圍。

#### Scenario: 時段標籤格式正確
- **WHEN** `formatSlotGroupLabel('03251803')` 被呼叫
- **THEN** 回傳值 SHALL 為 `03/25 18:30`，不含 `–18:44` 範圍尾端

### Requirement: 後台帳密頁面版面
`/admin/slot-passwords` 頁面 SHALL 包含三個獨立區塊：日期查詢、單筆查詢、匯出與列印。不顯示全部帳密列表。

#### Scenario: 頁面包含三個區塊
- **WHEN** 管理員進入 `/admin/slot-passwords`
- **THEN** 頁面 SHALL 顯示「日期查詢」、「單筆查詢」、「匯出與列印」三個區塊，不顯示分頁帳密列表

#### Scenario: 匯出與列印區塊
- **WHEN** 管理員查看「匯出與列印」區塊
- **THEN** 區塊 SHALL 顯示「匯出 Excel」與「列印全部帳密」兩個按鈕，並標示資料範圍（2026/03/25 18:30 – 2026/03/30 23:45）

### Requirement: 日期查詢下拉選單
日期查詢 SHALL 使用下拉選單（`<select>`）列出所有可用日期（2026/03/15–03/30），格式為 `MM/DD (週幾)`，選擇後送出查詢。

#### Scenario: 選擇日期顯示全日帳密
- **WHEN** 管理員從下拉選單選擇 `03/25 (三)` 並按下查詢
- **THEN** 頁面 SHALL 顯示當日全部 96 筆帳密，欄位順序為：時段、帳號、密碼

### Requirement: 帳號欄位命名
所有介面（網頁查詢結果、PDF 列印、Excel 匯出）中，slotGroup 欄位標題 SHALL 統一顯示為「帳號」。

#### Scenario: 欄位標題統一為帳號
- **WHEN** 管理員查看查詢結果、PDF 或 Excel
- **THEN** 原「分組號碼」欄位 SHALL 顯示為「帳號」

### Requirement: 後台帳密頁面匯出按鈕
`/admin/slot-passwords` 頁面 SHALL 在「匯出與列印」區塊顯示「匯出 Excel」按鈕，點擊後直接觸發 `.xlsx` 檔案下載，不需額外彈窗。

#### Scenario: 點擊匯出按鈕觸發下載
- **WHEN** 管理員點擊「匯出 Excel」按鈕
- **THEN** 瀏覽器 SHALL 直接下載 `.xlsx` 檔案，不跳轉頁面

#### Scenario: 下載中顯示載入狀態
- **WHEN** 匯出請求送出後尚未完成
- **THEN** 按鈕 SHALL 顯示載入中狀態（文字變更或 disabled），防止重複點擊
