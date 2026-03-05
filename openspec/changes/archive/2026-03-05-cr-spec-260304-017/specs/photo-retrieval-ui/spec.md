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

### Requirement: 相簿首頁標題
首頁 `<h1>` SHALL 顯示「不間斷讀經接力相簿」作為網站標題，讓訪客明確知道此網站的用途。

#### Scenario: 首頁顯示正確標題
- **WHEN** 訪客進入首頁
- **THEN** 頁面頂部 SHALL 顯示「不間斷讀經接力相簿」大標題
