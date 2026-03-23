## 1. 更新 GalleryBackground 組件

- [x] 1.1 `app/components/GalleryBackground.tsx`：Props interface 新增 `gradient?: string`
- [x] 1.2 `app/components/GalleryBackground.tsx`：背景圖層邏輯改為 `gradient` 優先 > `bgSrc` > 響應式預設

## 2. 更新各頁面

- [x] 2.1 `app/album/[slotGroup]/page.tsx`：移除 `bgSrc="/bg/album/1.jpg"`，改傳 `gradient="linear-gradient(to bottom, #1a2d3d 0%, #1e3345 45%, #c47a3a 80%, #6b3318 100%)"`
- [x] 2.2 `app/admin/page.tsx`：同上
- [x] 2.3 `app/admin/gallery/[date]/[slot]/page.tsx`：同上
- [x] 2.4 `app/admin/gallery/[date]/[slot]/[album]/page.tsx`：同上

## 3. 版本與文件

- [x] 3.1 `config/version.json`：patch 版號 +1
- [x] 3.2 `README-AI.md`：依 `.ai-rules.md` 更新，反映本次變更
