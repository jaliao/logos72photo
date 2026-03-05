## Why

PWA manifest 與 favicon 設定路徑錯誤，導致瀏覽器找不到圖示（404），影響 PWA 安裝體驗與書籤顯示。

## What Changes

- 修正 `app/layout.tsx` 的 `metadata.icons`，改用正確的 `/favicon/` 路徑並涵蓋所有 favicon 格式（ico、svg、png、apple-touch-icon）
- 新增 `metadata.manifest` 指向 `/favicon/site.webmanifest`
- 修正 `public/favicon/site.webmanifest` 的圖示路徑加上 `/favicon/` 前綴
- 修正 `site.webmanifest` 的 `name`／`short_name` 為正確的繁體中文名稱

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `favicon-pwa`：favicon 與 PWA manifest 路徑修正

## Impact

- `app/layout.tsx`：metadata 設定
- `public/favicon/site.webmanifest`：圖示路徑與應用名稱
