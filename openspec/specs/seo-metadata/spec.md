## ADDED Requirements

### Requirement: 全站 HTML 標題與描述
系統 SHALL 在所有頁面的 `<title>` 顯示「72 小時不間斷讀經接力自動拍照系統」，`<html lang>` 屬性 SHALL 設為 `zh-TW`，`<meta name="description">` SHALL 提供對應的繁體中文說明。

#### Scenario: 瀏覽器分頁顯示正確名稱
- **WHEN** 使用者開啟網站任意頁面
- **THEN** 瀏覽器分頁標題 SHALL 顯示「72 小時不間斷讀經接力自動拍照系統」

#### Scenario: HTML lang 為繁體中文
- **WHEN** 頁面 HTML 被解析
- **THEN** `<html lang>` 屬性值 SHALL 為 `zh-TW`

### Requirement: Favicon
系統 SHALL 使用 `app/favicon.png` 作為網站圖示，顯示於瀏覽器分頁、書籤與行動裝置主畫面。

#### Scenario: 瀏覽器顯示網站圖示
- **WHEN** 使用者開啟網站
- **THEN** 瀏覽器分頁 SHALL 顯示 `favicon.png` 圖示，而非瀏覽器預設空白圖示
