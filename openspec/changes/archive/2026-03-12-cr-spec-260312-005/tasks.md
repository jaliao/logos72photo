## 1. 調整 PhotoSlideshow.tsx 前景照片容器樣式

- [x] 1.1 將桌機版前景照片容器的 `sm:h-full` 替換為 `sm:max-h-screen`，確保高度不超過視窗高度
- [x] 1.2 確認容器已有 `sm:aspect-[3/4]` 與 `sm:w-auto`，照片以 `h-full w-full object-cover` 填滿容器
- [x] 1.3 確認手機版（預設）容器維持 `absolute inset-0`，照片以 `object-cover` 填滿全螢幕

## 2. 版本與文件更新

- [x] 2.1 將 `config/version.json` patch 版號 +1
- [x] 2.2 依 `.ai-rules.md` 重新產生 `README-AI.md`
