## 1. 時段列表頁（slot page）視覺更新

- [x] 1.1 在 `app/gallery/[date]/[slot]/page.tsx` 加入 `<style>` 定義 `@keyframes fadeIn`（與首頁 GalleryDateList 一致）
- [x] 1.2 小時格 grid 外層加入 glassmorphism 卡片容器：`rounded-2xl bg-white/50 p-5`、`style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.7)', animation: 'fadeIn 300ms ease-out forwards' }}`
- [x] 1.3 h1 改為 `text-2xl font-bold text-zinc-900`（原為 `text-xl text-zinc-800`）
- [x] 1.4 subtitle（slotLabel）顏色改為 `text-zinc-700`（原為 `text-zinc-600`）

## 2. 照片預覽頁（album page）視覺更新

- [x] 2.1 在 `app/gallery/[date]/[slot]/[album]/page.tsx` 加入 `<style>` 定義 `@keyframes fadeIn`
- [x] 2.2 照片 grid 外層加入 glassmorphism 卡片容器：`rounded-2xl bg-white/50 p-5`、`style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.7)', animation: 'fadeIn 300ms ease-out forwards' }}`
- [x] 2.3 h1 改為 `text-2xl font-bold text-zinc-900`（原為 `text-xl text-zinc-800`）
- [x] 2.4 subtitle（照片數量文字）顏色改為 `text-zinc-700`（原為 `text-zinc-600`）

## 3. 版本與文件更新

- [x] 3.1 `config/version.json` patch 版號 +1
- [x] 3.2 更新 `README-AI.md`：版本號、業務邏輯說明、當前任務狀態
