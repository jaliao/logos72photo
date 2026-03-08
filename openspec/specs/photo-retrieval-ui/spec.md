## MODIFIED Requirements

### Requirement: 時段導覽入口
首頁 SHALL 自動從 Firestore 查詢所有有照片的日期與對應時段，以日期卡片列表方式呈現，不需要訪客手動輸入日期。頁面 SHALL 以行動裝置優先（Mobile-First）設計，預設樣式適配手機，桌面版為漸進增強。

#### Scenario: 首頁顯示有照片的日期列表
- **WHEN** 訪客進入首頁
- **THEN** 系統 SHALL 顯示所有至少有一張照片的日期，每個日期一張卡片，依日期由新到舊排列

#### Scenario: 無照片資料時顯示空狀態
- **WHEN** Firestore 中尚無任何照片資料
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

## ADDED Requirements

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
時段列表頁與照片預覽頁的 `<h1>` 排版 SHALL 與首頁一致：字級 `text-2xl`、顏色 `text-zinc-900`、`textShadow: '0 1px 8px rgba(0,0,0,0.4)'`。subtitle（時段範圍、照片數量）顏色 SHALL 使用 `text-zinc-700`。

#### Scenario: 子頁 h1 字級與顏色一致
- **WHEN** 訪客進入任意子相簿頁面（時段列表或照片預覽）
- **THEN** `<h1>` SHALL 以 `text-2xl font-bold text-zinc-900` 搭配 `textShadow` 顯示

#### Scenario: 子頁 subtitle 顏色一致
- **WHEN** 訪客進入任意子相簿頁面
- **THEN** subtitle 文字（時段範圍、照片數量等）SHALL 以 `text-zinc-700` 顯示

### Requirement: 相簿首頁標題
首頁 `<h1>` SHALL 顯示「不間斷讀經接力相簿」作為網站標題，讓訪客明確知道此網站的用途。

#### Scenario: 首頁顯示正確標題
- **WHEN** 訪客進入首頁
- **THEN** 頁面頂部 SHALL 顯示「不間斷讀經接力相簿」大標題
