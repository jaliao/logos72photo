## ADDED Requirements

### Requirement: 時段列表頁小時格統一視覺與照片張數
時段列表頁（`/gallery/[date]/[slot]`）的每個小時格 SHALL 統一顯示深色（黑色）方塊，不區分有無照片，並在方塊下方顯示該小時的照片張數（格式：「N 張」）。照片張數 SHALL 從 `photo_index/{date}.hourCounts` 讀取，無需額外 Firestore 查詢。

#### Scenario: 所有小時格顯示深色方塊
- **WHEN** 訪客進入時段列表頁（`/gallery/[date]/[slot]`）
- **THEN** 頁面內的所有 8 個小時格 SHALL 統一以深色背景（`bg-zinc-800/50`）顯示，不因照片有無而切換為淺色

#### Scenario: 小時格下方顯示照片張數
- **WHEN** 訪客查看某小時格，且該小時有 N 張照片
- **THEN** 小時格下方 SHALL 顯示「N 張」（`text-xs text-zinc-300`）

#### Scenario: 張數為零時仍顯示
- **WHEN** 訪客查看某小時格，且 `photo_index` 中無該小時的計數資料
- **THEN** 小時格下方 SHALL 顯示「0 張」

#### Scenario: 小時格點擊行為不變
- **WHEN** 訪客點擊任意小時格
- **THEN** 系統 SHALL 導航至 `/gallery/{date}/{slot}/{albumMin}`，行為與現有路由一致

## ADDED Requirements

### Requirement: photo_index 儲存每小時照片張數
`photo_index/{date}` 文件 SHALL 新增 `hourCounts` 欄位（型別：`Record<string, Record<string, number>>`），記錄各小時格的累積照片張數。鍵值結構為 `hourCounts[slot8h_str][hourMin_str] = count`。每次上傳照片時，`updatePhotoIndex()` SHALL 將對應的 `hourCounts[slotKey][hourMin_str]` 遞增 1。

#### Scenario: 上傳照片後張數遞增
- **WHEN** 一張照片上傳成功，`slot8h = 8`、`hourMin = 480`
- **THEN** `photo_index/{date}.hourCounts["8"]["480"]` SHALL 遞增 1

#### Scenario: 文件不存在時從零開始計數
- **WHEN** 某日期首次上傳照片，`photo_index/{date}` 文件尚不存在
- **THEN** 系統 SHALL 建立文件並設定 `hourCounts[slotKey][hourMin_str] = 1`

#### Scenario: 舊文件無 hourCounts 欄位時向下相容
- **WHEN** `photo_index/{date}` 文件存在但無 `hourCounts` 欄位
- **THEN** 讀取端 SHALL 將張數視為 0，不拋出例外
