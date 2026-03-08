## Why

相簿瀏覽體驗有三個待改善點：（1）各頁面 h1 顯示日期或時段，缺乏品牌一致性；（2）照片縮圖無法在手機上全螢幕預覽，hover overlay 在觸控裝置不可用；（3）首頁白色卡片陰影略淺，視覺層次感不足。

## What Changes

- 所有相簿頁面（首頁、時段列表、照片預覽）h1 統一顯示「不間斷讀經接力相簿」；原先的日期、時段、小時範圍等上下文資訊改為副標題（breadcrumb）
- 照片預覽頁新增 Lightbox：點擊縮圖開啟全螢幕覆蓋層，顯示原圖（或高解析縮圖），提供明顯的「下載」按鈕與關閉按鈕，適配手機操作
- 首頁白色日期卡片的 box-shadow 加深（`0 8px 40px rgba(0,0,0,0.85)`）

## Non-Goals

- 不實作 iOS Web Share API 或直接寫入系統相簿（需 native app 權限）；下載按鈕觸發瀏覽器下載，由使用者自行儲存
- 不修改相機拍照或上傳邏輯
- 不修改時段列表頁（slot page）的卡片陰影

## Capabilities

### New Capabilities

- `photo-lightbox`：照片預覽頁點擊縮圖開啟全螢幕 lightbox，顯示高解析縮圖、提供下載按鈕與鍵盤/點擊關閉

### Modified Capabilities

- `photo-retrieval-ui`：（1）所有相簿頁面 h1 統一為「不間斷讀經接力相簿」，日期/時段改為副標；（2）首頁日期卡片 box-shadow 加深

## Impact

- `app/page.tsx`：h1 已正確，副標題文字微調
- `app/gallery/[date]/[slot]/page.tsx`：h1 改為品牌名稱，日期 + 時段改為副標
- `app/gallery/[date]/[slot]/[album]/page.tsx`：h1 改為品牌名稱，日期 + 小時範圍改為副標；引入 Lightbox Client Component
- 新增 `app/components/PhotoLightbox.tsx`（Client Component）
- `app/components/GalleryDateList.tsx`：boxShadow 加深
