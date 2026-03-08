## Why

相片明細頁（`/gallery/[date]/[slot]/[album]`）縮圖 grid 使用固定高度 `h-40` + `object-cover`，將 iPhone 直式照片（約 4:3 或 9:16）強制裁成橫式；搭配 `grid-cols-2` 在手機上顯示時格子過窄，造成照片跑版、視覺失真，使用體驗差。需針對 iPhone 直式照片比例做排版最佳化。

## What Changes

- 縮圖格子改用 `aspect-[3/4]`（直式比例）取代固定 `h-40`，確保 iPhone 照片完整顯示不變形
- 手機版改為單欄（`grid-cols-1`），桌面版 `sm:grid-cols-2`，讓照片在小螢幕有足夠寬度
- Lightbox 全螢幕預覽的圖片高度限制調整，確保直式照片在手機不超出 viewport

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `photo-retrieval-ui`：照片預覽頁縮圖比例與 grid 排版規格變更

## Impact

- `app/components/PhotoLightbox.tsx`：縮圖 grid 欄數、圖片比例樣式更新
- `openspec/specs/photo-retrieval-ui/spec.md`：照片預覽頁相關 scenario 更新

## Non-goals

- 不修改 Lightbox 的開啟/關閉邏輯
- 不修改下載功能
- 不修改時段列表頁
