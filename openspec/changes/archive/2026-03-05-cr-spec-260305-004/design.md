## Context

相簿首頁卡片目前使用不透明白色背景（`bg-white`）與不透明黑色時段格（`bg-zinc-800`），動態漸層背景完全被遮蔽。本次改為半透明，讓漸層背景透出，形成 Glassmorphism 風格。

## Goals / Non-Goals

**Goals:**
- 標題 `<h1>` 加 `text-shadow` 提升在動態背景上的可讀性
- 日期卡片白色底改為 `rgba(255,255,255,0.5)`，加 `box-shadow`
- 有照片的時段格黑色底改為 `rgba(39,39,42,0.5)`（zinc-800 半透明）

**Non-Goals:**
- 不加 `backdrop-filter: blur`
- 不動畫邏輯

## Decisions

### 1. 使用 Tailwind 透明度修飾符（`bg-white/50`、`bg-zinc-800/50`）

**選擇：** Tailwind 原生 `bg-<color>/<opacity>` 語法
**理由：** 比 inline `rgba()` style 更簡潔，與現有 className 風格一致，不需額外 CSS。

### 2. 標題 text-shadow 以 inline style 實作

**選擇：** `style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}`
**理由：** Tailwind 4 尚未內建 `text-shadow` utility，inline style 最直接。

### 3. 無照片時段格維持不透明（`bg-zinc-100`）

**理由：** 半透明的淺灰與背景漸層對比不足，會使「無照片」的視覺提示變弱。保持不透明確保可讀性與功能明確性。
