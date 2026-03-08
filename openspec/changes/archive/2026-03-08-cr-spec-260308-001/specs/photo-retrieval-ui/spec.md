## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: 相簿日期範圍環境變數設定
系統 SHALL 支援以環境變數 `NEXT_PUBLIC_GALLERY_START_DATE`（格式 `YYYY-MM-DD`）與 `NEXT_PUBLIC_GALLERY_END_DATE`（格式 `YYYY-MM-DD`，選填）控制首頁相簿顯示的日期範圍，方便不同活動場次獨立部署時限定可瀏覽的日期。

#### Scenario: 起始日環境變數過濾早於起始日的日期
- **WHEN** `NEXT_PUBLIC_GALLERY_START_DATE` 設定為 `2026-03-08`，且 Firestore 有 `2026-03-07` 的照片
- **THEN** 首頁 SHALL 不顯示 `2026-03-07` 的日期卡片

#### Scenario: 結束日環境變數過濾晚於結束日的日期
- **WHEN** `NEXT_PUBLIC_GALLERY_END_DATE` 設定為 `2026-03-08`，且 Firestore 有 `2026-03-09` 的照片
- **THEN** 首頁 SHALL 不顯示 `2026-03-09` 的日期卡片
