## Context

`GalleryBackground` 目前：
- 背景圖層有 `opacity: 0.1`，底紋幾乎不可見
- 所有頁面共用相同的響應式背景（`bg-mb-1.png` / `bg-pc-1.png`）
- album 頁（`/album/login`、`/album/[slotGroup]`）與 admin 頁使用同一張背景

已備妥 `public/bg/album/1.jpg` 作為相簿專屬背景。

## Goals / Non-Goals

**Goals:**
- 移除 `opacity: 0.1`，背景圖恢復完整顯示
- album 頁使用 `/bg/album/1.jpg`，admin 頁維持響應式背景不變

**Non-Goals:**
- 不修改漸層動畫覆蓋層
- 不為 album 背景實作響應式切換（單一靜態圖即可）

## Decisions

### 決策 1：`bgSrc` prop 而非新元件

**選擇：** 為 `GalleryBackground` 加入可選 `bgSrc?: string` prop。傳入時直接使用該路徑作為背景，不套用 `@media` 響應式規則；未傳入時行為不變。

**替代方案：** 建立獨立的 `AlbumBackground` 元件。

**理由：** `bgSrc` prop 只需改動一個元件，呼叫端只加一個屬性，改動範圍最小。兩個元件的動畫覆蓋層邏輯完全相同，複製會造成日後維護分歧。

### 決策 2：`bgSrc` 模式下移除 `gallery-bg` className

**選擇：** 傳入 `bgSrc` 時，背景圖 `<div>` 不套用 `gallery-bg` className（避免 CSS media query 干擾），改用 inline `backgroundImage` style 直接指定路徑。

**理由：** `gallery-bg` 的 `@media` 規則會覆蓋 inline style 在某些情況下的行為，條件式 className 更明確。

## Risks / Trade-offs

- **prop 介面增加**：`bgSrc` 為可選，向下相容，既有呼叫端無需修改。
- **album 背景無響應式**：`/bg/album/1.jpg` 在手機與桌機使用同一張圖，若日後需要分版需另外處理。
