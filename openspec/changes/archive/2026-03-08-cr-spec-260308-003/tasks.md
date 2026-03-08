## 1. 照片縮圖 Grid 排版修正

- [x] 1.1 `app/components/PhotoLightbox.tsx`：縮圖 grid 欄數改為 `grid-cols-1 sm:grid-cols-2`
- [x] 1.2 `app/components/PhotoLightbox.tsx`：縮圖圖片樣式由 `h-40 w-full object-cover` 改為 `aspect-[3/4] w-full object-cover`

## 2. Lightbox 全螢幕直式照片顯示修正

- [x] 2.1 `app/components/PhotoLightbox.tsx`：Lightbox 圖片 `max-h` 由 `max-h-[75vh]` 改為 `max-h-[85vh]`

## 3. 版本與文件更新

- [x] 3.1 `config/version.json` patch 版號 +1
- [x] 3.2 更新 `README-AI.md`：版本號、業務邏輯說明、當前任務狀態
