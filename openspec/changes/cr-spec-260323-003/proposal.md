## Why

目前使用 `/bg/album/1.jpg` 作為靜態背景圖的頁面（相簿瀏覽、後台管理等），載入時需下載大張圖片，且視覺風格固定無法調整。改用 CSS 漸層背景可消除圖片載入成本，同時保留與原圖相近的藍→橙→褐色調。

## What Changes

- `GalleryBackground` 新增 `gradient` prop，傳入時以 CSS `linear-gradient` 取代 `backgroundImage`
- 移除各頁 `bgSrc="/bg/album/1.jpg"`，改傳 `gradient` prop（顏色取自 `public/bg/album/1.png` 色票）
- 漸層方向：由上至下，`#1a2d3d`（深藍天空）→ `#c47a3a`（暖琥珀地平線）→ `#6b3318`（深褐山底）

**受影響頁面：**
- `app/album/[slotGroup]/page.tsx`
- `app/admin/page.tsx`
- `app/admin/gallery/[date]/[slot]/page.tsx`
- `app/admin/gallery/[date]/[slot]/[album]/page.tsx`

## Capabilities

### New Capabilities
- 無新增 capability（僅修改現有組件 prop）

### Modified Capabilities
- `gallery-animated-bg`：`GalleryBackground` 新增 `gradient` prop；`bgSrc` 仍保留向下相容。原 spec 測試案例中 `bgSrc="/bg/album/1.jpg"` 改為 `gradient` 使用情境。

## Impact

- `app/components/GalleryBackground.tsx`：新增 `gradient?: string` prop 邏輯
- 上述 4 個頁面：改傳 `gradient` 取代 `bgSrc="/bg/album/1.jpg"`
- `public/bg/album/1.jpg` 可保留但不再被引用
- 無 API 或資料庫異動
