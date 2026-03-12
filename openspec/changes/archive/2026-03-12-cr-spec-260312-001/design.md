## Context

相簿首頁目前使用 `Math.random()` 隨機選取 `/bg/1.png`–`/bg/10.png` 作為背景圖，標題顯示「不間斷讀經接力相簿」，副標題顯示「從白天到黑夜不停的運行」。本次改為固定背景圖並更新標題文字以符合 2026 活動主題。

## Goals / Non-Goals

**Goals:**
- `GalleryBackground` 背景圖固定使用 `/bg/1.png`
- 相簿各層級頁面 `<h1>` 改為「2026 不間斷讀經接力」
- 首頁副標題改為「讀經側拍相簿」

**Non-Goals:**
- 不更動背景圖動畫效果（日夜漸層覆蓋層維持不變）
- 不修改子頁面的動態副標題邏輯（日期、時段等上下文資訊）
- 不新增或移除背景圖檔案

## Decisions

### 決策：直接 hardcode `1.png`，移除 `useState` / `useEffect`

移除 `bgIndex` state 與 `useEffect` 隨機邏輯，直接在 `backgroundImage` 樣式中寫入 `/bg/1.png`。原先使用 state 是為了解決 SSR hydration mismatch，改用固定值後 SSR 端同樣可以確定地渲染同一張圖，因此不再需要 null guard。

替代方案考慮：保留 state 但固定初始值為 1 → 不必要，增加複雜度。

### 決策：三個頁面統一修改 `<h1>` 文字

`app/page.tsx`、`app/gallery/[date]/[slot]/page.tsx`、`app/gallery/[date]/[slot]/[album]/page.tsx` 三處 `<h1>` 均改為「2026 不間斷讀經接力」，副標題各自邏輯不變（首頁改為「讀經側拍相簿」，子頁面保持動態日期/時段）。

## Risks / Trade-offs

- [風險] 未來需切換回隨機背景時需重新加回邏輯 → 可接受，需求明確為固定
- [風險] 若 `/bg/1.png` 圖檔遺失，頁面背景空白 → 現有圖檔已確認存在，風險極低
