## Why

相簿首頁背景已有動態漸層動畫，但日期卡片與標題的視覺設計尚未與背景整合。加入玻璃透明化（Glassmorphism）效果，讓卡片呈現半透明質感，使背景漸層可透過卡片隱約可見，整體視覺更有層次感。

## What Changes

- **標題文字**加上 `text-shadow`，讓文字在動態背景上保有清晰度
- **日期卡片（白色底）**：背景改為 `white / 0.5` 半透明，加上 `box-shadow`
- **時段格（黑色底，有照片）**：背景改為 `zinc-800 / 0.5` 半透明
- 時段格（淺色底，無照片）維持原有樣式，不做透明化（保留對比度提示「無照片」）

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `gallery-card-animation`：日期卡片與時段格視覺樣式更新（半透明 + 陰影）

## Non-goals

- 不套用 `backdrop-filter: blur`（glassmorphism 毛玻璃效果，可能影響效能）
- 不修改動畫邏輯（進退場動畫已由 cr-spec-260305-003 實作）
- 不修改相簿子頁面

## Impact

- 修改：`app/components/GalleryDateList.tsx`（卡片與時段格 className 調整）
- 修改：`app/page.tsx`（標題 `<h1>` 加上 text-shadow style）
