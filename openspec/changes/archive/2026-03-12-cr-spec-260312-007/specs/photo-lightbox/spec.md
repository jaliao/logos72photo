## MODIFIED Requirements

### Requirement: 照片 Lightbox 全螢幕預覽
照片預覽頁（`/gallery/[date]/[slot]/[album]`）的每張縮圖 SHALL 可點擊，開啟全螢幕幻燈片（Google Photos 風格），顯示該照片的高解析縮圖（1280px WebP）。幻燈片背景 SHALL 顯示同一張照片的模糊版本（`blur + brightness-50`）填滿視窗，消除黑底。幻燈片 SHALL 接收整個相簿的照片陣列，並記錄當前顯示的 index，讓使用者可在相同幻燈片介面內切換照片。

`SlideshowPhoto` 介面 SHALL 包含以下欄位：
- `r2Url: string` — R2 原始 URL，用於下載
- `thumbUrl: string` — 640px 縮圖 URL，用於 grid 縮圖顯示
- `slideUrl: string` — 1280px 縮圖 URL，用於幻燈片主畫面顯示與 iOS 分享
- `alt: string`
- `filename: string`

前景照片呈現規則依裝置而異：
- **手機（viewport < 640px）**：照片以 `object-cover` 填滿整個手機畫面（全螢幕滿版）
- **桌機（viewport ≥ 640px）**：前景照片容器高度 SHALL 不超過瀏覽器視窗高度（`max-h-screen`），維持 `3/4` 寬高比，照片以 `object-cover` 填滿容器，容器水平置中；兩側剩餘空間由模糊背景填補

#### Scenario: 點擊縮圖開啟幻燈片
- **WHEN** 訪客在照片預覽頁點擊任意縮圖
- **THEN** 系統 SHALL 開啟全螢幕幻燈片，顯示被點擊照片的 `slideUrl`（1280px 縮圖），並記錄該張在陣列中的 index

#### Scenario: 手機版照片滿版顯示
- **WHEN** 訪客在手機（viewport < 640px）開啟幻燈片
- **THEN** 前景照片 SHALL 以 `object-cover` 填滿整個手機畫面，不留黑邊或模糊空間

#### Scenario: 桌機版照片容器不超過視窗高度
- **WHEN** 訪客在桌機（viewport ≥ 640px）開啟幻燈片
- **THEN** 前景照片容器高度 SHALL 不超過視窗高度（`max-h-screen`），維持 `3/4` 比例，容器水平置中

#### Scenario: 縮圖 grid 使用 640px 縮圖
- **WHEN** 訪客進入照片預覽頁，查看縮圖 grid
- **THEN** 每張縮圖 SHALL 使用 `thumbUrl`（640px）顯示，不使用 `slideUrl` 或 `r2Url`

### Requirement: 幻燈片下載按鈕
幻燈片右上角 SHALL 提供「下載」圖示按鈕。點擊後系統依平台觸發對應流程：

- **桌機 / Android（不支援 `navigator.canShare({ files })`）**：`fetch(r2Url)` 取得原圖 Blob，動態建立 `<a download="IMG_XXXX.jpg">` 觸發存檔對話窗
- **iOS（支援 `navigator.canShare({ files })`）**：`fetch(slideUrl)` 取得 1280px 縮圖 Blob，呼叫 `navigator.share({ files: [File] })` 開啟 iOS 系統分享選單（可存至相簿）

預設檔名格式為 `IMG_{4位補零相簿順序號}.jpg`（例如 `IMG_0001.jpg`）。下載過程中按鈕 SHALL 顯示 loading 狀態。

#### Scenario: 桌面 / Android 點擊下載觸發存檔對話窗
- **WHEN** 訪客在不支援 `navigator.canShare({ files })` 的瀏覽器點擊下載按鈕
- **THEN** 系統 SHALL fetch `r2Url`（原圖），觸發瀏覽器存檔對話窗，預設檔名為 `IMG_XXXX.jpg`

#### Scenario: iOS 點擊下載觸發系統分享選單（1280 縮圖）
- **WHEN** 訪客在支援 `navigator.canShare({ files })` 的 iOS Safari 點擊下載按鈕
- **THEN** 系統 SHALL fetch `slideUrl`（1280px 縮圖），呼叫 `navigator.share({ files: [File] })`，開啟 iOS 系統分享選單

#### Scenario: 下載中顯示 loading 狀態
- **WHEN** 訪客點擊下載按鈕，系統正在 fetch 圖片
- **THEN** 下載按鈕 SHALL 顯示 loading 指示器，且不可重複點擊，直到 fetch 完成
