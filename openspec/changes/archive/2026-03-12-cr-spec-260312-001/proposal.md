## Why

相簿首頁的標題與副標題需更新以反映本次活動主題「2026 不間斷讀經接力」，並統一使用固定背景圖 `1.png`，不再每次重新整理隨機切換，確保視覺呈現一致。

## What Changes

- 相簿首頁（及子頁面）`<h1>` 標題改為「2026 不間斷讀經接力」
- 相簿首頁副標題改為「讀經側拍相簿」
- `GalleryBackground` 元件背景圖固定使用 `/bg/1.png`，移除隨機選圖邏輯

## Capabilities

### New Capabilities
<!-- 無新 capability -->

### Modified Capabilities
- `gallery-animated-bg`：背景圖選取邏輯由隨機改為固定使用 `1.png`
- `photo-retrieval-ui`：首頁 `<h1>` 改為「2026 不間斷讀經接力」，副標題改為「讀經側拍相簿」

## Impact

- `app/components/GalleryBackground.tsx`：移除 `Math.random()` 邏輯，直接使用 `/bg/1.png`
- `app/page.tsx`：更新 `<h1>` 與副標題文字
- `app/gallery/[date]/[slot]/page.tsx`：更新 `<h1>` 文字
- `app/gallery/[date]/[slot]/[album]/page.tsx`：更新 `<h1>` 文字
