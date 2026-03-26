## MODIFIED Requirements

### Requirement: 後台相簿照片頁
系統 SHALL 在 `/admin/gallery/[date]/[slot]/[album]` 提供 1 小時相簿照片瀏覽頁，支援 Lightbox 全螢幕瀏覽與照片下載。下載 SHALL 在所有平台直接下載原圖（R2 原始 URL），不觸發系統分享對話視窗。Lightbox 工具列 SHALL 不提供分享連結功能。

#### Scenario: 照片列表正常顯示
- **WHEN** 已登入管理員進入 `/admin/gallery/20260310/8/480`
- **THEN** 系統 SHALL 顯示該時段區間（480–539 分鐘）的所有照片縮圖

#### Scenario: 無照片時顯示空狀態
- **WHEN** 已登入管理員進入有效的 `/admin/gallery/[date]/[slot]/[album]`，但無對應照片
- **THEN** 頁面 SHALL 顯示「此時段尚無照片」提示

#### Scenario: 下載按鈕直接下載原圖
- **WHEN** 管理員在 Lightbox 中按下下載按鈕（任何平台）
- **THEN** 系統 SHALL 以 `<a download>` 方式下載 R2 原圖，不呼叫 `navigator.share()`，不彈出系統分享對話視窗

#### Scenario: 工具列不顯示分享連結按鈕
- **WHEN** 管理員開啟任意照片的 Lightbox 全螢幕檢視
- **THEN** 工具列 SHALL 僅顯示返回與下載按鈕，不顯示「複製分享連結」按鈕
