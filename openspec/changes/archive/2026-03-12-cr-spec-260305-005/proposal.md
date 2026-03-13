## Why

相簿首頁已完成動態漸層背景、卡片動畫與 Glassmorphism 半透明效果，但子頁面（時段列表頁、小時相簿頁）仍使用靜態白色背景與不透明卡片，造成進入子頁面時視覺風格驟變，體驗不連貫。本次將子頁面視覺統一為與首頁相同的設計語言。

## What Changes

- **`/gallery/[date]/[slot]`（時段列表頁）**：加入 `GalleryBackground` 動態背景；頁面容器移除 `bg-zinc-50`；小時子相簿卡片改為 `bg-white/50` + 深色陰影；有照片格 `bg-zinc-800/50`，無照片格維持 `bg-zinc-100`；標題加 `text-shadow`
- **`/gallery/[date]/[slot]/[album]`（照片預覽頁）**：加入 `GalleryBackground` 動態背景；頁面容器移除 `bg-zinc-50`；標題加 `text-shadow`；照片格容器保持現有設計（縮圖為主，不套卡片半透明）
- 返回連結樣式統一：改為與內容可讀性匹配的樣式（加 text-shadow 或調整顏色）

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `photo-retrieval-ui`：時段列表頁與小時相簿頁視覺更新，背景、卡片與標題樣式與首頁設計語言統一

## Non-goals

- 不修改照片縮圖格（`ThumbnailImage`）本身的樣式
- 不修改下載按鈕邏輯
- 不修改首頁（已完成）
- 不加 `backdrop-filter: blur`

## Impact

- 修改：`app/gallery/[date]/[slot]/page.tsx`
- 修改：`app/gallery/[date]/[slot]/[album]/page.tsx`
- 新增 import：`GalleryBackground`（已存在的 Client Component）
