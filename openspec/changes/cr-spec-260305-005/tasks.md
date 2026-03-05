## 1. app/gallery/[date]/[slot]/page.tsx

- [x] 1.1 加入 `import GalleryBackground from '@/app/components/GalleryBackground'`
- [x] 1.2 `<main>` 改為 `relative min-h-screen px-4 py-8`，移除 `bg-zinc-50`，加入 `<GalleryBackground />`
- [x] 1.3 `<h1>` 加上 `style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}`
- [x] 1.4 有照片小時卡片改為 `bg-zinc-800/50 hover:bg-zinc-700/60`
- [x] 1.5 無照片小時卡片維持 `bg-zinc-100`（確認不變）
- [x] 1.6 返回連結改為 `text-white/70 hover:text-white`

## 2. app/gallery/[date]/[slot]/[album]/page.tsx

- [x] 2.1 加入 `import GalleryBackground from '@/app/components/GalleryBackground'`
- [x] 2.2 `<main>` 改為 `relative min-h-screen px-4 py-8`，移除 `bg-zinc-50`，加入 `<GalleryBackground />`
- [x] 2.3 `<h1>` 加上 `style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}`
- [x] 2.4 返回連結改為 `text-white/70 hover:text-white`

## 3. 版本與文件更新

- [x] 3.1 `config/version.json` patch +1（0.1.20 → 0.1.21）
- [x] 3.2 更新 `README-AI.md`，反映 v0.1.21 相簿子頁面視覺統一
