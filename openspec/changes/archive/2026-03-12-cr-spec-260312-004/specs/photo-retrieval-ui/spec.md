## MODIFIED Requirements

### Requirement: 時段列表頁小時格統一視覺與照片張數
時段列表頁（`/gallery/[date]/[slot]`）的小時格 SHALL 依照片有無呈現不同視覺狀態。有照片時，小時格 SHALL 以該小時第一張照片（`photo_index/{date}.firstPhotos[slot8h_str][hourMin_str]`）作為全版封面背景（`object-cover`），疊加 70% 黑色半透明遮罩（`bg-black/70`），並在遮罩上方顯示白色時間文字。無照片時，小時格 SHALL 以灰色背景（`bg-zinc-500`）顯示白色時間文字，且 **不可點擊**（渲染為 `<div>` 而非 `<Link>`）。小時格 SHALL **不顯示**照片張數資訊。

#### Scenario: 有照片的小時格顯示封面背景
- **WHEN** 訪客進入時段列表頁，且 `photo_index/{date}.firstPhotos[slot8h_str][hourMin_str]` 存在
- **THEN** 該小時格 SHALL 以對應 R2 URL 的照片作為封面（`object-cover`），疊加 `bg-black/70` 遮罩，白色時間文字顯示於遮罩之上

#### Scenario: 無照片的小時格顯示灰色且不可點擊
- **WHEN** 訪客進入時段列表頁，且對應小時無 `firstPhotos` 記錄
- **THEN** 該小時格 SHALL 以灰色背景（`bg-zinc-500`）顯示白色時間文字，渲染為 `<div>`（非 `<Link>`），不可點擊

#### Scenario: 小時格不顯示照片張數
- **WHEN** 訪客查看時段列表頁的任意小時格
- **THEN** 小時格 SHALL 不顯示任何照片張數資訊（移除「N 張」文字）

#### Scenario: 有照片小時格點擊行為
- **WHEN** 訪客點擊有照片的小時格
- **THEN** 系統 SHALL 導航至 `/gallery/{date}/{slot}/{albumMin}`，行為與現有路由一致

### Requirement: photo_index 儲存每小時照片張數
`photo_index/{date}` 文件 SHALL 維持 `hourCounts` 欄位（型別：`Record<string, Record<string, number>>`），並新增 `firstPhotos` 欄位（型別：`Record<string, Record<string, string>>`），記錄各小時格的第一張照片 R2 URL。鍵值結構為 `firstPhotos[slot8h_str][hourMin_str] = r2_url`。每次上傳照片時，`updatePhotoIndex()` SHALL 僅在 `firstPhotos[slotKey][hourKey]` 尚未設定的情況下寫入目前照片的 `r2_url`（first-write-wins）。

#### Scenario: 上傳照片後張數遞增
- **WHEN** 一張照片上傳成功，`slot8h = 8`、`hourMin = 480`
- **THEN** `photo_index/{date}.hourCounts["8"]["480"]` SHALL 遞增 1

#### Scenario: 文件不存在時從零開始計數
- **WHEN** 某日期首次上傳照片，`photo_index/{date}` 文件尚不存在
- **THEN** 系統 SHALL 建立文件並設定 `hourCounts[slotKey][hourMin_str] = 1`

#### Scenario: 舊文件無 hourCounts 欄位時向下相容
- **WHEN** `photo_index/{date}` 文件存在但無 `hourCounts` 欄位
- **THEN** 讀取端 SHALL 將張數視為 0，不拋出例外

#### Scenario: 首次上傳照片時記錄封面 URL
- **WHEN** 某小時格第一張照片上傳成功，`slot8h = 8`、`hourMin = 480`，且 `firstPhotos["8"]["480"]` 尚未設定
- **THEN** `photo_index/{date}.firstPhotos["8"]["480"]` SHALL 設定為該照片的 R2 URL

#### Scenario: 非首張照片不覆蓋封面 URL
- **WHEN** 某小時格的後續照片上傳成功，且 `firstPhotos[slotKey][hourKey]` 已存在
- **THEN** `firstPhotos[slotKey][hourKey]` SHALL 維持原值不變

#### Scenario: 舊文件無 firstPhotos 欄位時向下相容
- **WHEN** `photo_index/{date}` 文件存在但無 `firstPhotos` 欄位
- **THEN** 讀取端 SHALL 將該小時封面視為不存在，降級渲染為灰色不可點擊格子，不拋出例外
