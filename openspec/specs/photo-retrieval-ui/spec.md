### Requirement: 時段導覽入口
首頁 SHALL 自動從 Firestore `photo_index` 集合查詢所有有照片的日期與對應時段（透過 `queryPhotoIndex()`），以日期卡片列表方式呈現，不需要訪客手動輸入日期。頁面 SHALL 以行動裝置優先（Mobile-First）設計，預設樣式適配手機，桌面版為漸進增強。

#### Scenario: 首頁顯示有照片的日期列表
- **WHEN** 訪客進入首頁
- **THEN** 系統 SHALL 顯示所有至少有一張照片的日期，每個日期一張卡片，依日期由新到舊排列

#### Scenario: 無照片資料時顯示空狀態
- **WHEN** `photo_index` 集合尚無任何文件
- **THEN** 首頁 SHALL 顯示「尚無拍攝紀錄」提示，而非空白或錯誤畫面

#### Scenario: 日期卡片顯示三個時段格
- **WHEN** 訪客看到某日期卡片
- **THEN** 卡片 SHALL 包含三個時段格：早（00:00–08:00）、中（08:00–16:00）、晚（16:00–24:00）

#### Scenario: 有照片的時段格視覺區分
- **WHEN** 某日期的某時段（slot_8h）在 `photo_index` 中有記錄
- **THEN** 對應時段格 SHALL 以深色背景顯示，代表有照片可瀏覽

#### Scenario: 無照片的時段格仍可點擊
- **WHEN** 某日期的某時段在 `photo_index` 中無記錄
- **THEN** 對應時段格 SHALL 以淺色背景顯示，點擊後仍可進入該時段的 1 小時子相簿列表

#### Scenario: 點擊時段格進入子相簿列表
- **WHEN** 訪客點擊任意時段格
- **THEN** 系統 SHALL 導航至 `/gallery/{date}/{slot}`，行為與現有路由一致

#### Scenario: 手機版單欄排列
- **WHEN** 訪客在手機（viewport 寬度 < 640px）瀏覽首頁
- **THEN** 日期卡片列表 SHALL 以單欄方式垂直排列，時段格以三欄水平排列於卡片內

### Requirement: 相簿日期範圍環境變數設定
系統 SHALL 支援以環境變數 `NEXT_PUBLIC_GALLERY_START_DATE`（格式 `YYYY-MM-DD`）與 `NEXT_PUBLIC_GALLERY_END_DATE`（格式 `YYYY-MM-DD`，選填）控制首頁相簿顯示的日期範圍，方便不同活動場次獨立部署時限定可瀏覽的日期。

#### Scenario: 起始日環境變數過濾早於起始日的日期
- **WHEN** `NEXT_PUBLIC_GALLERY_START_DATE` 設定為 `2026-03-08`，且 Firestore 有 `2026-03-07` 的照片
- **THEN** 首頁 SHALL 不顯示 `2026-03-07` 的日期卡片

#### Scenario: 結束日環境變數過濾晚於結束日的日期
- **WHEN** `NEXT_PUBLIC_GALLERY_END_DATE` 設定為 `2026-03-08`，且 Firestore 有 `2026-03-09` 的照片
- **THEN** 首頁 SHALL 不顯示 `2026-03-09` 的日期卡片

### Requirement: 相簿首頁標題
所有相簿頁面（首頁、時段列表頁、照片預覽頁）的 `<h1>` SHALL 統一顯示「2026 不間斷讀經接力」作為品牌標題，讓訪客在任何層級的頁面都能識別網站品牌。日期、時段、小時範圍等上下文資訊 SHALL 改以副標題（`<p>`）方式呈現於 h1 下方。

#### Scenario: 首頁顯示品牌標題
- **WHEN** 訪客進入首頁（`/`）
- **THEN** 頁面頂部 SHALL 顯示「2026 不間斷讀經接力」大標題，副標題顯示「讀經側拍相簿」

#### Scenario: 時段列表頁顯示品牌標題
- **WHEN** 訪客進入時段列表頁（`/gallery/[date]/[slot]`）
- **THEN** `<h1>` SHALL 顯示「2026 不間斷讀經接力」，副標題 SHALL 顯示日期與時段範圍（例：`2026-03-08 · 08:00 – 16:00`）

#### Scenario: 照片預覽頁顯示品牌標題
- **WHEN** 訪客進入照片預覽頁（`/gallery/[date]/[slot]/[album]`）
- **THEN** `<h1>` SHALL 顯示「2026 不間斷讀經接力」，副標題 SHALL 顯示日期與小時範圍（例：`2026-03-08 · 08:00 – 09:00`）

### Requirement: 時段列表頁 Glassmorphism 卡片容器
時段列表頁（`/gallery/[date]/[slot]`）的小時格 grid SHALL 外包一層 glassmorphism 卡片容器（`rounded-2xl bg-white/50 p-5`、`boxShadow: '0 4px 20px rgba(0,0,0,0.7)'`），視覺風格與首頁日期卡片一致。

#### Scenario: 時段列表頁顯示 glassmorphism 卡片
- **WHEN** 訪客進入時段列表頁（`/gallery/[date]/[slot]`）
- **THEN** 頁面 SHALL 在小時格 grid 外顯示半透明白色卡片容器（`bg-white/50`），帶有深色 box-shadow

#### Scenario: 卡片容器有進場動畫
- **WHEN** 時段列表頁載入完成
- **THEN** 卡片容器 SHALL 以 `fadeIn 300ms ease-out forwards` 進場，初始 opacity 為 0

### Requirement: 照片預覽頁 Glassmorphism 卡片容器
照片預覽頁（`/gallery/[date]/[slot]/[album]`）的照片 grid SHALL 外包一層 glassmorphism 卡片容器（`rounded-2xl bg-white/50 p-5`、`boxShadow: '0 4px 20px rgba(0,0,0,0.7)'`），視覺風格與首頁日期卡片一致。

#### Scenario: 照片預覽頁顯示 glassmorphism 卡片
- **WHEN** 訪客進入照片預覽頁（`/gallery/[date]/[slot]/[album]`）
- **THEN** 頁面 SHALL 在照片 grid 外顯示半透明白色卡片容器（`bg-white/50`），帶有深色 box-shadow

#### Scenario: 照片頁卡片容器有進場動畫
- **WHEN** 照片預覽頁載入完成
- **THEN** 卡片容器 SHALL 以 `fadeIn 300ms ease-out forwards` 進場，初始 opacity 為 0

### Requirement: 子頁面標題排版對齊首頁
時段列表頁與照片預覽頁的 `<h1>` 排版 SHALL 與首頁一致：字級 `text-2xl`、顏色 `text-zinc-900`、`textShadow: '0 1px 8px rgba(0,0,0,0.4)'`。副標題（日期 + 時段資訊）顏色 SHALL 使用 `text-zinc-700`，字級 `text-sm`。

#### Scenario: 子頁 h1 字級與顏色一致
- **WHEN** 訪客進入任意子相簿頁面（時段列表或照片預覽）
- **THEN** `<h1>` SHALL 以 `text-2xl font-bold text-zinc-900` 搭配 `textShadow` 顯示「不間斷讀經接力相簿」

#### Scenario: 子頁副標題顯示上下文資訊
- **WHEN** 訪客進入任意子相簿頁面
- **THEN** 副標題 SHALL 以 `text-sm text-zinc-700` 顯示日期與時段上下文，取代原先的 h1 日期文字

### Requirement: 首頁日期卡片陰影加深
首頁日期卡片的 box-shadow SHALL 使用更深的陰影值（`0 8px 40px rgba(0,0,0,0.85)`），增強卡片在動態背景上的視覺層次感。

#### Scenario: 首頁日期卡片顯示深色陰影
- **WHEN** 訪客進入首頁，日期卡片載入完成
- **THEN** 每張日期卡片 SHALL 顯示 `0 8px 40px rgba(0,0,0,0.85)` box-shadow，視覺上明顯浮於背景之上

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

### Requirement: 照片預覽頁縮圖直式比例與行動裝置排版
照片預覽頁（`/gallery/[date]/[slot]/[album]`）的縮圖 grid SHALL 以直式比例（`aspect-[3/4]`）顯示，對應 iPhone 直式拍攝照片（4:3 portrait），不以固定高度截裁。手機版（viewport < 640px）SHALL 採單欄排列，確保照片有足夠寬度；桌面版（viewport ≥ 640px）SHALL 採雙欄排列。

#### Scenario: 手機版單欄顯示
- **WHEN** 訪客在手機（viewport 寬度 < 640px）進入照片預覽頁
- **THEN** 縮圖 grid SHALL 以單欄垂直排列，每張縮圖佔滿欄寬

#### Scenario: 桌面版雙欄顯示
- **WHEN** 訪客在桌面或平板（viewport 寬度 ≥ 640px）進入照片預覽頁
- **THEN** 縮圖 grid SHALL 以雙欄並排，每張縮圖佔半欄寬

#### Scenario: 縮圖保持直式比例
- **WHEN** 訪客查看縮圖 grid
- **THEN** 每張縮圖 SHALL 以 3:4 寬高比（直式）顯示，不因容器尺寸變化而截為橫式

#### Scenario: Lightbox 直式照片完整顯示
- **WHEN** 訪客點擊縮圖開啟全螢幕 Lightbox，且照片為直式
- **THEN** 照片 SHALL 在手機 viewport 內完整顯示（`max-h-[85vh] max-w-[95vw]`），不超出螢幕邊緣

### Requirement: 相簿子頁面返回連結文字陰影
時段列表頁與照片預覽頁的「← 返回」連結 SHALL 套用文字陰影（`textShadow: '0 1px 8px rgba(0,0,0,0.4)'`），確保在動態漸層背景的亮色區段仍保有足夠可讀性，視覺規格與 `<h1>` 對齊。

#### Scenario: 時段列表頁返回連結有陰影
- **WHEN** 訪客進入時段列表頁（`/gallery/[date]/[slot]`）
- **THEN** 「← 返回」連結 SHALL 顯示 `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`

#### Scenario: 照片預覽頁返回連結有陰影
- **WHEN** 訪客進入照片預覽頁（`/gallery/[date]/[slot]/[album]`）
- **THEN** 「← 返回」連結 SHALL 顯示 `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`

### Requirement: 時段列表頁小時子相簿索引來源
`/gallery/[date]/[slot]` 頁面判斷哪些小時有照片 SHALL 改為讀取 `photo_index/{date}` 單一文件（透過 `getPhotoIndexByDate()`），而非查詢 `photos` 集合。

#### Scenario: 有照片的小時卡片以深色顯示
- **WHEN** 某小時（hourMin）在 `photo_index/{date}.hours[slot]` 中有記錄
- **THEN** 對應小時卡片 SHALL 以 `bg-zinc-800/50` 深色顯示

#### Scenario: photo_index 不存在時所有小時格顯示為無照片
- **WHEN** `photo_index/{date}` 文件不存在（歷史資料或索引尚未建立）
- **THEN** 所有小時格 SHALL 顯示為淺色（無照片樣式），不拋出錯誤

### Requirement: 時段列表頁視覺風格與首頁統一
`/gallery/[date]/[slot]` 頁面 SHALL 使用與首頁相同的動態漸層背景（`GalleryBackground`），移除靜態 `bg-zinc-50` 背景色，並對標題與卡片套用 Glassmorphism 樣式。

#### Scenario: 時段列表頁顯示動態背景
- **WHEN** 訪客進入 `/gallery/{date}/{slot}`
- **THEN** 頁面 SHALL 顯示 `GalleryBackground` 動態漸層背景，覆蓋全頁

#### Scenario: 時段列表頁標題有 text-shadow
- **WHEN** 時段列表頁顯示日期與時段標題
- **THEN** `<h1>` SHALL 具有 `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`，確保在動態背景上清晰可讀

#### Scenario: 有照片小時卡片為半透明深色
- **WHEN** 某小時子相簿有照片
- **THEN** 對應卡片 SHALL 以 `bg-zinc-800/50` 半透明深色顯示

#### Scenario: 無照片小時卡片維持不透明淺色
- **WHEN** 某小時子相簿無照片
- **THEN** 對應卡片 SHALL 維持 `bg-zinc-100` 不透明淺灰色，確保「無照片」提示清晰可讀

#### Scenario: 時段列表頁返回連結在動態背景上可讀
- **WHEN** 時段列表頁顯示返回連結
- **THEN** 返回連結 SHALL 使用 `text-white/70 hover:text-white` 樣式，在各種背景色調下皆可讀

### Requirement: 照片預覽頁視覺風格與首頁統一
`/gallery/[date]/[slot]/[album]` 頁面 SHALL 使用與首頁相同的動態漸層背景（`GalleryBackground`），移除靜態 `bg-zinc-50` 背景色，標題加 `text-shadow`。

#### Scenario: 照片預覽頁顯示動態背景
- **WHEN** 訪客進入 `/gallery/{date}/{slot}/{album}`
- **THEN** 頁面 SHALL 顯示 `GalleryBackground` 動態漸層背景，覆蓋全頁

#### Scenario: 照片預覽頁標題有 text-shadow
- **WHEN** 照片預覽頁顯示日期與小時範圍標題
- **THEN** `<h1>` SHALL 具有 `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`

#### Scenario: 照片縮圖格樣式不受影響
- **WHEN** 照片預覽頁顯示縮圖格
- **THEN** 照片縮圖格（`rounded-xl bg-zinc-200`）SHALL 維持原有樣式，不套用半透明效果

#### Scenario: 照片預覽頁返回連結在動態背景上可讀
- **WHEN** 照片預覽頁顯示返回連結
- **THEN** 返回連結 SHALL 使用 `text-white/70 hover:text-white` 樣式

### Requirement: 依 slotGroup 查詢照片
系統 SHALL 提供依 `slotGroup` 欄位查詢 Firestore `photos` 集合的能力，回傳符合指定分組號碼的所有照片，依 `createdAt` 升冪排列。查詢前 SHALL 驗證 `slotGroup` 為 8 位數字格式，否則直接回傳空陣列。

#### Scenario: 有效 slotGroup 回傳對應照片
- **WHEN** 呼叫查詢函式，帶入 `slotGroup = "03130101"`，Firestore 有 3 筆符合記錄
- **THEN** 函式 SHALL 回傳 3 筆照片資料，依 `createdAt` 升冪排列

#### Scenario: 無符合記錄時回傳空陣列
- **WHEN** 呼叫查詢函式，帶入有效 `slotGroup`，Firestore 無符合記錄
- **THEN** 函式 SHALL 回傳空陣列，不拋出例外

#### Scenario: 無效格式 slotGroup 不執行查詢
- **WHEN** 呼叫查詢函式，帶入非 8 位數字的字串（如 `"abc"` 或 `"0313010"`）
- **THEN** 函式 SHALL 直接回傳空陣列，不執行 Firestore 查詢
