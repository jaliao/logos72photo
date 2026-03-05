## ADDED Requirements

### Requirement: OpenGraph Meta Tags
系統 SHALL 在所有頁面的 `<head>` 中輸出標準 OpenGraph meta tags，確保在社群平台（LINE、Facebook 等）分享連結時顯示正確的標題與描述。

#### Scenario: 分享連結顯示正確 og:title
- **WHEN** 使用者將網站連結分享至 LINE 或 Facebook
- **THEN** 預覽卡片 SHALL 顯示「不間斷讀經接力相簿」作為標題（`og:title`）

#### Scenario: og:description 有繁體中文說明
- **WHEN** 網頁被社群平台爬蟲解析
- **THEN** `og:description` SHALL 包含繁體中文說明文字，描述網站用途

#### Scenario: og:type 設為 website
- **WHEN** 網頁被社群平台爬蟲解析
- **THEN** `og:type` SHALL 為 `website`
