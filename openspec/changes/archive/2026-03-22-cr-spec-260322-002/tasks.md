## 1. GalleryBackground 響應式背景圖

- [x] 1.1 在 `app/components/GalleryBackground.tsx` 的 `<style>` 區塊加入 `@media (min-width: 640px)` 規則，切換背景圖：預設（手機）使用 `.gallery-bg { background-image: url(/bg/bg-mb-1.png) }`，桌機使用 `url(/bg/bg-pc-1.png)`
- [x] 1.2 將背景圖層 `<div>` 加上 className（如 `gallery-bg`）以套用 CSS 規則，移除原本寫死的 `backgroundImage: url(/bg/1.png)` inline style

## 2. 版本與文件更新

- [x] 2.1 將 `config/version.json` 的 `patch` 版號 +1
- [x] 2.2 依 `.ai-rules.md` 重新產生 `README-AI.md`
