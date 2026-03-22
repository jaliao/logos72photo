## Context

`GalleryBackground` 目前使用單一 `backgroundImage: url(/bg/1.png)`，對所有裝置一視同仁。手機螢幕為直式（portrait），桌機為橫式（landscape），同一張圖在兩種比例下構圖效果不佳。現已備妥 `bg-mb-1.png`（手機版）與 `bg-pc-1.png`（桌機版），需依裝置寬度載入對應圖片。

`GalleryBackground` 為 Server Component（無 `'use client'`），不能使用 `window.innerWidth` 或 React state。

## Goals / Non-Goals

**Goals:**
- 手機（viewport < 640px）顯示 `/bg/bg-mb-1.png`
- 桌機（viewport ≥ 640px）顯示 `/bg/bg-pc-1.png`
- 維持 Server Component，不引入 `'use client'`

**Non-Goals:**
- 不支援多張背景圖輪播或隨機切換
- 不修改漸層動畫覆蓋層邏輯

## Decisions

### 決策 1：使用兩層 `<div>` + CSS media query，而非 JS 偵測

**選擇：** 背景圖層分拆為兩個 `<div>`，各自以 inline `<style>` 或 Tailwind 的 `sm:` 媒體查詢控制 `display`。

**替代方案：** 在 CSS 中用同一層 `<div>` 透過 `@media` 切換 `background-image`。

**理由：** 兩方案效果相同；單層 `<div>` + CSS `@media` 更簡潔，只需在 `<style>` 區塊加入兩條媒體查詢規則，不需要多一個 DOM 節點。採用此方案。

**實作方式：**
```css
/* 預設（手機）*/
.gallery-bg { background-image: url(/bg/bg-mb-1.png); }
/* 桌機（sm: ≥ 640px）*/
@media (min-width: 640px) {
  .gallery-bg { background-image: url(/bg/bg-pc-1.png); }
}
```
或直接在既有 `<style>` 區塊加入 `@media` 規則並搭配 className。

## Risks / Trade-offs

- **圖檔未部署**：若 `public/bg/bg-mb-1.png` 或 `public/bg/bg-pc-1.png` 不存在，背景將顯示空白。→ 部署前確認兩檔案已存在於 `public/bg/`。
- **640px 斷點**：採用 Tailwind `sm:` 標準斷點，與其他 UI 一致。
