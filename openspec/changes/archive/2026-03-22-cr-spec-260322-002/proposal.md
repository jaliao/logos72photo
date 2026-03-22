## Why

目前 `GalleryBackground` 在所有裝置上固定使用 `/bg/1.png`，手機與桌機顯示同一張圖，構圖無法針對不同螢幕比例最佳化。現已備妥手機版（直式）與桌機版（橫式）背景圖，需依螢幕寬度切換。

## What Changes

- `GalleryBackground` 元件改為依裝置寬度使用不同背景圖：
  - 手機（`< 640px`）：`/bg/bg-mb-1.png`
  - 桌機（`≥ 640px`）：`/bg/bg-pc-1.png`
- 使用 CSS media query（兩層 `<div>` 各自 `display`）實作，維持 Server Component

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `gallery-animated-bg`：背景圖從單一固定路徑改為依裝置寬度切換的響應式路徑

## Impact

- `app/components/GalleryBackground.tsx`：背景圖 `<div>` 分拆為手機版 + 桌機版兩層
- 無 API、資料庫異動
- 需確認 `public/bg/bg-mb-1.png` 與 `public/bg/bg-pc-1.png` 已部署至正確路徑
