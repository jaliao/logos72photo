## Why

「此時段尚無照片」空白狀態文字目前為細體灰字（`text-zinc-400`），在半透明背景頁面上視覺對比不足，不易閱讀。

## What Changes

- 「此時段尚無照片」文字樣式改為 `font-semibold text-black`（600 粗體黑）
- 加上 `bg-white/70` 半透明白底圓角容器包裝，提升可讀性
- 套用範圍：`AlbumPhotoViewer`（grid 空白狀態）、`app/album/[slotGroup]/page.tsx`（照片數為 0 時）

## Capabilities

### New Capabilities
無

### Modified Capabilities
- `album-photo-viewer`：空白狀態提示文字樣式更新

## Impact

- `app/components/AlbumPhotoViewer.tsx`：grid 模式空白狀態
- `app/album/[slotGroup]/page.tsx`：照片列表為空時的提示
