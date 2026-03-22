## ADDED Requirements

### Requirement: 後台相簿時段列表頁
系統 SHALL 在 `/admin/gallery/[date]/[slot]` 提供 1 小時子相簿列表頁，功能與原 `/gallery/[date]/[slot]` 完全相同，需持有有效 `admin_session` cookie 方可存取；未登入管理員 SHALL 被 middleware 重導向至 `/admin/login`。

#### Scenario: 已登入管理員可正常瀏覽
- **WHEN** 持有有效 `admin_session` cookie 的管理員進入 `/admin/gallery/20260310/8`
- **THEN** 系統 SHALL 顯示該日期 08:00–16:00 時段內所有 1 小時子相簿列表

#### Scenario: 未登入者被重導向
- **WHEN** 未持有有效 `admin_session` cookie 的訪客進入任意 `/admin/gallery/**`
- **THEN** middleware SHALL 重導向至 `/admin/login`，不渲染任何相簿內容

### Requirement: 後台相簿照片頁
系統 SHALL 在 `/admin/gallery/[date]/[slot]/[album]` 提供 1 小時相簿照片瀏覽頁，功能與原 `/gallery/[date]/[slot]/[album]` 完全相同，支援 Lightbox 全螢幕瀏覽與照片下載。

#### Scenario: 照片列表正常顯示
- **WHEN** 已登入管理員進入 `/admin/gallery/20260310/8/480`
- **THEN** 系統 SHALL 顯示該時段區間（480–539 分鐘）的所有照片縮圖

#### Scenario: 無照片時顯示空狀態
- **WHEN** 已登入管理員進入有效的 `/admin/gallery/[date]/[slot]/[album]`，但無對應照片
- **THEN** 頁面 SHALL 顯示「此時段尚無照片」提示

### Requirement: 舊 `/gallery/**` 路徑 redirect
`/gallery/**` 舊路徑 SHALL 以 catch-all 路由統一 redirect 至 `/admin/login`，確保書籤連結安全降落。

#### Scenario: 舊路徑 redirect 至後台登入頁
- **WHEN** 任何人（含已登入管理員）存取任意 `/gallery/**` 路徑
- **THEN** 系統 SHALL redirect 至 `/admin/login`
