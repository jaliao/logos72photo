## 1. 新增 PhotoLightbox Client Component

- [x] 1.1 建立 `app/components/PhotoLightbox.tsx`：接收 `photos: { r2Url: string; thumbUrl: string; alt: string }[]` props
- [x] 1.2 實作 `useState` 管理開啟狀態與目前照片索引（`open: boolean`、`index: number`）
- [x] 1.3 實作 `useEffect`：開啟時 `document.body.style.overflow = 'hidden'`，關閉時還原
- [x] 1.4 實作 `useEffect`：監聽 `keydown` 事件，Escape 鍵觸發關閉
- [x] 1.5 Lightbox 覆蓋層：`fixed inset-0 z-50 bg-black/90 flex items-center justify-center`
- [x] 1.6 右上角關閉按鈕（✕）、點擊黑色背景關閉（`onClick` on backdrop，`stopPropagation` on image container）
- [x] 1.7 中央顯示高解析縮圖（`<img src={thumbUrl}>`），`max-h-[85vh] max-w-[95vw] object-contain`
- [x] 1.8 底部工具列：「下載原圖」`<a href={r2Url} download>` 按鈕 + iOS 提示文字「iOS 請長按圖片 → 儲存到照片」
- [x] 1.9 縮圖 grid 的每個 `<div>` 加上 `onClick={() => openLightbox(index)}`、`cursor-pointer`

## 2. 照片預覽頁引入 PhotoLightbox

- [x] 2.1 `app/gallery/[date]/[slot]/[album]/page.tsx`：將照片資料傳至 `PhotoLightbox`，縮圖 grid 改為 Client Component 觸發
- [x] 2.2 移除原先 hover overlay（`group-hover:opacity-100` 的 `absolute` 工具列），功能移至 Lightbox

## 3. 全相簿頁面統一 h1

- [x] 3.1 `app/gallery/[date]/[slot]/page.tsx`：h1 改為「不間斷讀經接力相簿」；副標題改為 `{date} · {slotLabel}`
- [x] 3.2 `app/gallery/[date]/[slot]/[album]/page.tsx`：h1 改為「不間斷讀經接力相簿」；副標題改為 `{date} · {hourLabel}`
- [x] 3.3 `app/page.tsx`：確認 h1 已為「不間斷讀經接力相簿」（現況正確，確認副標題文字無需調整）

## 4. 首頁日期卡片陰影加深

- [x] 4.1 `app/components/GalleryDateList.tsx`：boxShadow 從 `0 4px 20px rgba(0,0,0,0.7)` 改為 `0 8px 40px rgba(0,0,0,0.85)`

## 5. 版本與文件更新

- [x] 5.1 `config/version.json` patch 版號 +1
- [x] 5.2 更新 `README-AI.md`：版本號、業務邏輯說明、當前任務狀態
