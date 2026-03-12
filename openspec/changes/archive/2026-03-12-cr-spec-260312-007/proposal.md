## Why

`toThumbUrl()` 函式重複定義於 `app/gallery/[date]/[slot]/[album]/page.tsx` 與 `app/admin/monitoring/page.tsx`，且縮圖尺寸（640、1280）硬編碼於各元件內。缺乏統一的圖片 URL 規範導致不同情境使用尺寸不一致，且維護困難。

## What Changes

- 新增 `lib/image.ts`：集中定義 `toThumbUrl()`、`toThumb640()`、`toThumb1280()` 函式
- 移除各元件內的 `toThumbUrl` 重複定義，改 import 自 `lib/image`
- 每小時相簿縮圖 grid：改用 640 縮圖（原為 1280）
- `PhotoSlideshow` 幻燈片主畫面：使用 1280 縮圖（新增 `slideUrl` 欄位）
- 下載：保持使用 raw R2 URL（`r2Url`，不變）
- iOS Web Share API 分享：改用 1280 縮圖（原為 raw R2 URL）

## Capabilities

### New Capabilities
- `image-url-helpers`：集中管理縮圖 URL 產生函式的 lib 模組

### Modified Capabilities
- `image-service`：更新 `toThumbUrl` 使用方式規範（集中至 lib）
- `photo-lightbox`：`SlideshowPhoto` 新增 `slideUrl` 欄位，幻燈片顯示與分享改用 1280

## Impact

- 新增 `lib/image.ts`
- 修改 `app/gallery/[date]/[slot]/[album]/page.tsx`：移除 `toThumbUrl`，`thumbUrl` 改 640，新增 `slideUrl` 1280
- 修改 `app/components/PhotoSlideshow.tsx`：`SlideshowPhoto` 新增 `slideUrl`，幻燈片顯示與分享改用 `slideUrl`
- 修改 `app/admin/monitoring/page.tsx`：移除 `toThumbUrl`，改 import `toThumb640`
