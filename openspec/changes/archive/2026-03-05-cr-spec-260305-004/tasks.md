## 1. app/page.tsx 標題文字陰影

- [x] 1.1 在 `<h1>` 加上 `style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}`

## 2. app/components/GalleryDateList.tsx 半透明樣式

- [x] 2.1 日期卡片容器白色底改為 `bg-white/50`，並加上 `shadow-md`（或等效 box-shadow class）
- [x] 2.2 有照片時段格黑色底改為 `bg-zinc-800/50`
- [x] 2.3 確認無照片時段格維持 `bg-zinc-100`（不透明）

## 3. 版本與文件更新

- [x] 3.1 `config/version.json` patch +1（0.1.19 → 0.1.20）
- [x] 3.2 更新 `README-AI.md`，反映 v0.1.20 Glassmorphism 效果新增
