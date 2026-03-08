## Why

相簿首頁已套用 Glassmorphism 卡片（`bg-white/50`、`boxShadow`）與進退場動畫，但時段列表頁與照片預覽頁的內容容器缺少相同的卡片包裝，造成視覺風格不統一——子頁面內容浮在背景上，缺乏首頁的層次感與精緻度。

## What Changes

- 時段列表頁（`/gallery/[date]/[slot]`）：小時格 grid 外包一層 glassmorphism 卡片（`rounded-2xl bg-white/50 p-5 + boxShadow`），與首頁日期卡片同款
- 照片預覽頁（`/gallery/[date]/[slot]/[album]`）：照片 grid 外包同款 glassmorphism 卡片
- 子頁面標題排版對齊首頁：`text-2xl font-bold text-zinc-900`（目前子頁為 `text-xl text-zinc-800`）
- 子頁面 subtitle 顏色對齊：`text-zinc-700`（目前 `text-zinc-600`）
- 子頁面加入進場 fadeIn 動畫（與首頁 GalleryDateList 一致，300ms ease-out）

## Non-Goals

- 不修改 GalleryBackground 元件（各頁面已使用）
- 不修改首頁任何行為或樣式
- 不修改路由結構或資料取得邏輯

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `photo-retrieval-ui`：子頁面視覺容器加入 glassmorphism 卡片包裝、標題排版與首頁對齊、加入進場動畫

## Impact

- `app/gallery/[date]/[slot]/page.tsx`：小時格 grid 加 glassmorphism 卡片容器、調整 h1/subtitle 樣式、加入 fadeIn
- `app/gallery/[date]/[slot]/[album]/page.tsx`：照片 grid 加 glassmorphism 卡片容器、調整 h1/subtitle 樣式、加入 fadeIn
