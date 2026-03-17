## 1. 建立共用元件

- [x] 1.1 新增 `app/components/GalleryHeading.tsx`，props：`subtitle`、`headingClassName?`（預設 `''`）、`subtitleClassName?`（預設 `'mb-6 text-sm'`）
- [x] 1.2 大標題：`rgb(219, 175, 141)`，`textShadow: '0 1px 8px rgba(0,0,0,0.4)'`
- [x] 1.3 次標題：`rgb(62, 208, 195)`

## 2. 套用各頁面

- [x] 2.1 `app/page.tsx`：替換 h1 + p，subtitle="讀經側拍相簿"，subtitleClassName="mb-8 text-sm font-bold"
- [x] 2.2 `app/gallery/[date]/[slot]/page.tsx`：替換 h1 + p，headingClassName="mt-4"
- [x] 2.3 `app/gallery/[date]/[slot]/[album]/page.tsx`：替換 h1 + p，headingClassName="mt-4"
- [x] 2.4 `app/album/[slotGroup]/page.tsx`：替換 h1 + p，headingClassName="mt-4"，subtitleClassName="mb-3 text-sm"

## 3. 版號與文件

- [x] 3.1 更新 `config/version.json` patch 版號 +1
- [x] 3.2 更新 `README-AI.md`
