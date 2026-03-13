## Context

相簿首頁（`app/page.tsx`）已完成 GalleryBackground 動態背景 + GalleryDateList Glassmorphism 卡片設計。子頁面（`/gallery/[date]/[slot]` 與 `/gallery/[date]/[slot]/[album]`）目前仍使用 `bg-zinc-50` 靜態背景與不透明卡片，視覺斷層明顯。本次以最小修改讓子頁面沿用相同的設計語言。

## Goals / Non-Goals

**Goals:**
- 兩個子頁面加入 `GalleryBackground`，移除靜態 `bg-zinc-50`
- 標題 `<h1>` 加 `text-shadow`
- 時段列表頁小時卡片套用 `bg-white/50` + 深色陰影（有照片 `bg-zinc-800/50`，無照片 `bg-zinc-100`）
- 返回連結調整顏色以確保可讀性

**Non-Goals:**
- 不修改照片縮圖格樣式
- 不加 `backdrop-filter: blur`
- 不修改資料查詢邏輯

## Decisions

### 1. GalleryBackground 直接 import，不抽共用 layout

**選擇：** 在各子頁面直接 `import GalleryBackground`，不建立新的 layout 層
**理由：** 子頁面各有不同的 `max-w`（slot 頁 `max-lg`，album 頁 `max-2xl`），共用 layout 反而需要更多 prop 設計。直接 import 更簡潔，與首頁做法一致。

### 2. 時段列表頁卡片：與首頁時段格樣式一致

**選擇：** 沿用 `bg-zinc-800/50`（有照片）/ `bg-zinc-100`（無照片）+ `boxShadow: '0 4px 20px rgba(0,0,0,0.7)'` 外層容器
**理由：** 與首頁 GalleryDateList 完全相同的設計語言，不引入新的設計決策。

### 3. 照片預覽頁（album）：只加背景與標題樣式

**選擇：** album 頁僅加 `GalleryBackground` + 標題 `text-shadow`，照片格（`rounded-xl bg-zinc-200`）保持不變
**理由：** 照片格的主體是縮圖，半透明對照片格意義不大且可能影響縮圖視覺；保持照片格不透明可確保縮圖顯示品質。

### 4. 返回連結顏色

**選擇：** 改為 `text-white/70 hover:text-white`，並加上 `drop-shadow`
**理由：** 動態漸層背景色彩多變，原本 `text-zinc-500` 在深色背景段落對比度不足，白色半透明在各種背景下皆可讀。

## Risks / Trade-offs

- **GalleryBackground 在多頁使用**：`GalleryBackground` 會在每個子頁面獨立隨機選取背景圖，子頁面與首頁背景不會同步——屬於預期行為，每頁各自獨立。
- **Edge Runtime 限制**：子頁面已宣告 `export const runtime = 'edge'`，`GalleryBackground` 為 Client Component，不受 edge 限制，安全。
