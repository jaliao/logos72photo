## Why

背景圖層加上 `opacity: 0.1` 後底紋幾乎不可見，效果不如預期，需取消。同時個人相簿頁（`/album/*`）需要使用專屬背景圖 `/bg/album/1.jpg`，與後台管理頁的響應式背景區分開來。

## What Changes

- 移除 `GalleryBackground` 背景圖層的 `opacity: 0.1`（恢復全不透明）
- 為 `GalleryBackground` 加入 `bgSrc` 可選 prop，接受靜態背景圖路徑
  - 傳入 `bgSrc` 時：直接使用該路徑，不套用手機/桌機響應式切換
  - 未傳入時：維持現有行為（CSS media query 切換 `bg-mb-1.png` / `bg-pc-1.png`）
- `app/album/login/page.tsx` 與 `app/album/[slotGroup]/page.tsx` 傳入 `bgSrc="/bg/album/1.jpg"`

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `gallery-animated-bg`：移除背景圖層 opacity；新增 `bgSrc` prop 支援靜態背景圖覆蓋

## Impact

- `app/components/GalleryBackground.tsx`：加入 `bgSrc` prop，移除 `opacity`
- `app/album/login/page.tsx`：傳入 `bgSrc`
- `app/album/[slotGroup]/page.tsx`：傳入 `bgSrc`
- 無 API、資料庫異動
