### Requirement: 時段導覽入口
首頁 SHALL 自動從 Firestore 查詢有照片的日期與對應時段，以日期卡片列表方式呈現，不需要訪客手動輸入日期。頁面 SHALL 以行動裝置優先（Mobile-First）設計，預設樣式適配手機，桌面版為漸進增強。顯示範圍 SHALL 限制於環境變數 `NEXT_PUBLIC_GALLERY_START_DATE`（起始日）至 `NEXT_PUBLIC_GALLERY_END_DATE`（結束日，未設定則為台灣今日）之間的日期。

#### Scenario: 首頁顯示有照片的日期列表（含日期範圍限制）
- **WHEN** 訪客進入首頁，且已設定 `NEXT_PUBLIC_GALLERY_START_DATE`
- **THEN** 系統 SHALL 只顯示起始日至結束日範圍內、至少有一張照片的日期，每個日期一張卡片，依日期由新到舊排列

#### Scenario: 無照片資料時顯示空狀態
- **WHEN** Firestore 中尚無任何照片資料（或範圍內無照片）
- **THEN** 首頁 SHALL 顯示「尚無拍攝紀錄」提示，而非空白或錯誤畫面

#### Scenario: 日期卡片顯示三個時段格
- **WHEN** 訪客看到某日期卡片
- **THEN** 卡片 SHALL 包含三個時段格：早（00:00–08:00）、中（08:00–16:00）、晚（16:00–24:00）

#### Scenario: 有照片的時段格視覺區分
- **WHEN** 某日期的某時段（slot_8h）至少有一張照片
- **THEN** 對應時段格 SHALL 以深色背景顯示，代表有照片可瀏覽

#### Scenario: 無照片的時段格仍可點擊
- **WHEN** 某日期的某時段無照片
- **THEN** 對應時段格 SHALL 以淺色背景顯示，點擊後仍可進入該時段的 1 小時子相簿列表

#### Scenario: 點擊時段格進入子相簿列表
- **WHEN** 訪客點擊任意時段格
- **THEN** 系統 SHALL 導航至 `/gallery/{date}/{slot}`，行為與現有路由一致

#### Scenario: 手機版單欄排列
- **WHEN** 訪客在手機（viewport 寬度 < 640px）瀏覽首頁
- **THEN** 日期卡片列表 SHALL 以單欄方式垂直排列，時段格以三欄水平排列於卡片內

#### Scenario: 未設定起始日時顯示所有日期
- **WHEN** `NEXT_PUBLIC_GALLERY_START_DATE` 未設定
- **THEN** 系統 SHALL 顯示所有有照片的日期（向下相容，維持現有行為）

#### Scenario: 未設定結束日時以今日為上限
- **WHEN** `NEXT_PUBLIC_GALLERY_END_DATE` 未設定
- **THEN** 系統 SHALL 以台灣今日（UTC+8）作為結束日上限

### Requirement: 相簿日期範圍環境變數設定
系統 SHALL 支援以環境變數 `NEXT_PUBLIC_GALLERY_START_DATE`（格式 `YYYY-MM-DD`）與 `NEXT_PUBLIC_GALLERY_END_DATE`（格式 `YYYY-MM-DD`，選填）控制首頁相簿顯示的日期範圍，方便不同活動場次獨立部署時限定可瀏覽的日期。

#### Scenario: 起始日環境變數過濾早於起始日的日期
- **WHEN** `NEXT_PUBLIC_GALLERY_START_DATE` 設定為 `2026-03-08`，且 Firestore 有 `2026-03-07` 的照片
- **THEN** 首頁 SHALL 不顯示 `2026-03-07` 的日期卡片

#### Scenario: 結束日環境變數過濾晚於結束日的日期
- **WHEN** `NEXT_PUBLIC_GALLERY_END_DATE` 設定為 `2026-03-08`，且 Firestore 有 `2026-03-09` 的照片
- **THEN** 首頁 SHALL 不顯示 `2026-03-09` 的日期卡片

### Requirement: 相簿首頁標題
所有相簿頁面（首頁、時段列表頁、照片預覽頁）的 `<h1>` SHALL 統一顯示「不間斷讀經接力相簿」作為品牌標題，讓訪客在任何層級的頁面都能識別網站品牌。日期、時段、小時範圍等上下文資訊 SHALL 改以副標題（`<p>`）方式呈現於 h1 下方。

#### Scenario: 首頁顯示品牌標題
- **WHEN** 訪客進入首頁（`/`）
- **THEN** 頁面頂部 SHALL 顯示「不間斷讀經接力相簿」大標題，副標題顯示「從白天到黑夜不停的運行」

#### Scenario: 時段列表頁顯示品牌標題
- **WHEN** 訪客進入時段列表頁（`/gallery/[date]/[slot]`）
- **THEN** `<h1>` SHALL 顯示「不間斷讀經接力相簿」，副標題 SHALL 顯示日期與時段範圍（例：`2026-03-08 · 08:00 – 16:00`）

#### Scenario: 照片預覽頁顯示品牌標題
- **WHEN** 訪客進入照片預覽頁（`/gallery/[date]/[slot]/[album]`）
- **THEN** `<h1>` SHALL 顯示「不間斷讀經接力相簿」，副標題 SHALL 顯示日期與小時範圍（例：`2026-03-08 · 08:00 – 09:00`）

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
