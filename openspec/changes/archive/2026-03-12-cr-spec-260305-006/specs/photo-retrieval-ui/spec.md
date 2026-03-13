## MODIFIED Requirements

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

## MODIFIED Requirements

### Requirement: 時段列表頁小時子相簿索引來源
`/gallery/[date]/[slot]` 頁面判斷哪些小時有照片 SHALL 改為讀取 `photo_index/{date}` 單一文件（透過 `getPhotoIndexByDate()`），而非查詢 `photos` 集合。

#### Scenario: 有照片的小時卡片以深色顯示
- **WHEN** 某小時（hourMin）在 `photo_index/{date}.hours[slot]` 中有記錄
- **THEN** 對應小時卡片 SHALL 以 `bg-zinc-800/50` 深色顯示

#### Scenario: photo_index 不存在時所有小時格顯示為無照片
- **WHEN** `photo_index/{date}` 文件不存在（歷史資料或索引尚未建立）
- **THEN** 所有小時格 SHALL 顯示為淺色（無照片樣式），不拋出錯誤
