## 1. 背景圖固定化

- [x] 1.1 修改 `app/components/GalleryBackground.tsx`：移除 `bgIndex` state、`useEffect` 隨機邏輯，直接使用 `/bg/1.png`

## 2. 標題文字更新

- [x] 2.1 修改 `app/page.tsx`：`<h1>` 改為「2026 不間斷讀經接力」，副標題改為「讀經側拍相簿」
- [x] 2.2 修改 `app/gallery/[date]/[slot]/page.tsx`：`<h1>` 改為「2026 不間斷讀經接力」
- [x] 2.3 修改 `app/gallery/[date]/[slot]/[album]/page.tsx`：`<h1>` 改為「2026 不間斷讀經接力」

## 3. 版本與 README

- [x] 3.1 更新 `config/version.json` patch 版號 +1
- [x] 3.2 更新 `README-AI.md`
