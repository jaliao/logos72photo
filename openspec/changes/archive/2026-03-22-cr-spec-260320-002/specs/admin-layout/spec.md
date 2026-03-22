## ADDED Requirements

### Requirement: 後台共用 Shell
`app/admin/layout.tsx` SHALL 讀取 `admin_session` cookie：有效 session 時渲染含選單的 Shell，無 session 時直接渲染 `{children}`（登入頁原樣，不顯示任何選單）。

#### Scenario: 已登入管理員看到選單
- **WHEN** 持有有效 `admin_session` cookie 的管理員進入任意 `/admin/**`（登入頁除外）
- **THEN** 頁面 SHALL 顯示後台 Shell，包含側邊欄選單與登出按鈕

#### Scenario: 未登入訪客登入頁不顯示選單
- **WHEN** 無 `admin_session` cookie 的訪客進入 `/admin/login`
- **THEN** 頁面 SHALL 直接渲染登入頁內容，不顯示任何選單或 Shell

### Requirement: 後台側邊欄選單
選單 SHALL 以固定側邊欄（`w-56`）形式呈現，包含以下項目（依序）：

| 項目名稱 | 路由 |
|---|---|
| 相簿 | `/admin` |
| 監控 | `/admin/monitoring` |
| 帳密管理 | `/admin/slot-passwords` |
| 資料清除 | `/admin/data-cleanup` |
| 封面索引 | `/admin/rebuild-first-photos` |
| 錯誤日誌 | `/admin/errors` |

登出按鈕 SHALL 固定於側邊欄底部，呼叫 `logoutAction`。

#### Scenario: 選單項目 active 高亮
- **WHEN** 管理員進入 `/admin/slot-passwords`（或其任意子路由，如 `/admin/slot-passwords/postcard`）
- **THEN** 「帳密管理」選單項目 SHALL 以高亮樣式顯示，其他項目維持預設樣式

#### Scenario: 首頁 active 精確匹配
- **WHEN** 管理員進入 `/admin`（路徑完全等於 `/admin`）
- **THEN** 「相簿」選單項目 SHALL 高亮；當管理員進入 `/admin/monitoring` 時「相簿」項目不高亮

#### Scenario: 登出按鈕運作
- **WHEN** 管理員點擊側邊欄底部的「登出」按鈕
- **THEN** 系統 SHALL 清除 `admin_session` cookie 並重導向至 `/admin/login`

### Requirement: 手機版頂部導覽列
在手機（viewport < 768px）時，側邊欄 SHALL 收合隱藏，改以頂部 bar 顯示品牌名稱與 hamburger 按鈕；點擊 hamburger SHALL 展開側邊欄選單覆蓋層。

#### Scenario: 手機版預設隱藏側邊欄
- **WHEN** 管理員在手機（viewport < 768px）進入任意後台頁面
- **THEN** 側邊欄 SHALL 預設收合，頂部顯示 bar 與 hamburger 圖示

#### Scenario: 點擊 hamburger 展開選單
- **WHEN** 管理員點擊 hamburger 按鈕
- **THEN** 側邊欄 SHALL 以覆蓋層形式滑入，可點擊背景或再次點擊 hamburger 關閉
