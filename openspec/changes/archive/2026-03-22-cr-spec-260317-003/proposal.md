## Why

全站相簿頁面的大標題與次標題顏色分散寫在各頁面，修改時需逐一改動；現行顏色（`text-zinc-900` / `text-zinc-700`）在動態背景上對比不足。統一提取為 `GalleryHeading` 元件，同時調整為設計稿配色。

## What Changes

- 新增 `app/components/GalleryHeading.tsx`，集中管理大標題與次標題樣式
  - 大標題顏色：`rgb(219, 175, 141)`（暖沙金）
  - 次標題顏色：`rgb(62, 208, 195)`（青綠）
- 將以下頁面的 h1 + 次標題 p 替換為 `<GalleryHeading>`：
  - `app/page.tsx`（首頁）
  - `app/gallery/[date]/[slot]/page.tsx`
  - `app/gallery/[date]/[slot]/[album]/page.tsx`
  - `app/album/[slotGroup]/page.tsx`（個人相簿）
- 登入頁（`app/album/login/page.tsx`）維持原樣，不套用

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `photo-retrieval-ui`：h1 與次標題顏色規格變更（`text-zinc-900` / `text-zinc-700` → 自訂 RGB 值）；新增 `GalleryHeading` 共用元件需求

## Impact

- **新增：** `app/components/GalleryHeading.tsx`
- **修改：** `app/page.tsx`、`app/gallery/[date]/[slot]/page.tsx`、`app/gallery/[date]/[slot]/[album]/page.tsx`、`app/album/[slotGroup]/page.tsx`
- **無資料庫異動、無新依賴**

## Non-goals

- 不改登入頁標題
- 不改後台（`/admin/**`）任何樣式
- 不更動字級、字重等其他排版屬性
