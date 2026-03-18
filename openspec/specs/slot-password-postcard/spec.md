# slot-password-postcard Specification

## Purpose
TBD - created by archiving change cr-spec-260319-001. Update Purpose after archive.
## Requirements
### Requirement: 明信片列印頁
系統 SHALL 提供 `/admin/slot-passwords/postcard` 頁面，以 `public/postcard/2.png`（1748×1240 px）為底圖，使用 CSS Grid 疊層將每個時段的日期、時間、帳號/密碼疊印於底圖上，資料範圍 2026/03/25 18:30 – 03/28 23:59，每頁一張明信片，支援瀏覽器列印轉存 PDF。

#### Scenario: 開啟明信片列印頁
- **WHEN** 管理員開啟 `/admin/slot-passwords/postcard`
- **THEN** 頁面 SHALL 顯示工具列（含「列印 / 儲存為 PDF」按鈕）及所有時段的明信片清單

#### Scenario: 每張明信片顯示正確資訊
- **WHEN** 頁面載入完成
- **THEN** 每張明信片 SHALL 疊印：
  - Date 欄：`M/D/2026` 格式（如 `3/25/2026`），位置 left=12.59%, top=27.50%
  - Time 欄：`HH:MM` 格式（如 `18:30`），位置 left=12.59%, top=36.00%
  - Username/Password 欄：`slotGroup/password`（各 8 碼），位置 left=20%, top=48.00%
  - To 欄位保持空白
  - 字型：Geist Mono；列印字級 38px

#### Scenario: 列印時工具列隱藏
- **WHEN** 管理員執行列印（`window.print()` 或 Ctrl+P）
- **THEN** 工具列 SHALL 隱藏，每頁 SHALL 輸出一張明信片（`break-after: page`）

#### Scenario: 儲存為 PDF
- **WHEN** 管理員點擊「列印 / 儲存為 PDF」並選擇「另存為 PDF」
- **THEN** 瀏覽器 SHALL 產生 PDF，頁面尺寸 1748×1240px（`@page { size: 1748px 1240px; margin: 0 }`），每頁一張明信片包含底圖與疊印文字

#### Scenario: 版面結構
- **WHEN** 頁面渲染明信片
- **THEN** 每張明信片 SHALL 使用 CSS Grid 疊層（`grid-area: 1/1`），`<img>` 自然撐開容器高度，overlay 疊在同一格，確保螢幕與列印的文字 Y 位置一致

