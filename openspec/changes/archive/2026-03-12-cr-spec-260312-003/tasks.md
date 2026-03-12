## 1. 更新 LightboxPhoto Interface 與 AlbumPage

- [x] 1.1 在 `app/components/PhotoLightbox.tsx`（或獨立型別檔）的 `LightboxPhoto` interface 新增 `filename: string` 欄位
- [x] 1.2 更新 `app/gallery/[date]/[slot]/[album]/page.tsx`：`lightboxPhotos` 陣列中為每張照片填入 `filename: \`IMG_${String(index + 1).padStart(4, '0')}.jpg\``

## 2. 新建 PhotoSlideshow 元件（骨架與縮圖 Grid）

- [x] 2.1 建立 `app/components/PhotoSlideshow.tsx`（`'use client'`），定義 `SlideshowPhoto`（含 `r2Url`, `thumbUrl`, `alt`, `filename`）與 `Props` 型別
- [x] 2.2 實作縮圖 Grid（`grid-cols-1 sm:grid-cols-2`），點擊縮圖設定 `openIndex` state 開啟幻燈片
- [x] 2.3 幻燈片開啟時鎖定背景捲動（`document.body.style.overflow = 'hidden'`），關閉時恢復

## 3. 幻燈片全螢幕覆蓋層與導覽

- [x] 3.1 實作全螢幕覆蓋層（`fixed inset-0 z-50 bg-black`），單次顯示當前照片（`max-h-[85vh] max-w-[95vw]`）
- [x] 3.2 實作左上角「← 返回」按鈕，點擊關閉幻燈片
- [x] 3.3 實作左右箭頭按鈕（`absolute left-2` / `absolute right-2`），切換 `openIndex`；首張時左箭頭 disabled/隱藏，末張時右箭頭 disabled/隱藏
- [x] 3.4 鍵盤事件監聽：`useEffect` 中監聽 `window.keydown`，Escape 關閉，ArrowLeft / ArrowRight 切換；unmount 時清除監聽

## 4. 自製 useSwipe Hook（手機 Swipe 手勢）

- [x] 4.1 建立 `app/hooks/useSwipe.ts`，監聽 `touchstart` / `touchend`，計算 deltaX；deltaX > 50px 向左 → 下一張，向右 → 上一張
- [x] 4.2 在 `PhotoSlideshow` 中套用 `useSwipe`，連結至 index 切換邏輯

## 5. 下載按鈕（Blob Fetch + Web Share / a download）

- [x] 5.1 實作 `handleDownload` 非同步函式：`fetch(r2Url)` → `Blob` → 建立 `File` 物件（名稱為 `filename`）
- [x] 5.2 iOS 分支：`if (navigator.canShare?.({ files })) await navigator.share({ files, title: filename })`
- [x] 5.3 其他平台分支：`URL.createObjectURL(blob)` + 動態 `<a download={filename}>` click，完成後 `revokeObjectURL`
- [x] 5.4 按鈕下載中顯示 loading 狀態（`isDownloading` state），防止重複點擊
- [x] 5.5 在幻燈片右上角加入下載圖示按鈕，連結至 `handleDownload`

## 6. 分享按鈕（Clipboard API + Toast）

- [x] 6.1 實作 `handleShare` 函式：以 `navigator.clipboard.writeText(url)` 複製 `${location.href.split('?')[0]}?photo=${openIndex}` 至剪貼簿
- [x] 6.2 實作「已複製！」Toast state（`showToast`），顯示後 2 秒 `setTimeout` 自動清除
- [x] 6.3 在幻燈片右上角加入分享圖示按鈕（與下載按鈕並排），Toast 提示元素置於覆蓋層內

## 7. 分享連結自動開啟幻燈片

- [x] 7.1 在 `PhotoSlideshow` 的 `useEffect`（mount 時執行）中讀取 `window.location.search` 的 `?photo=` param
- [x] 7.2 若 param 存在且 index 在 `[0, photos.length - 1]` 範圍內，自動設定 `openIndex` 開啟幻燈片

## 8. 替換舊元件與版本更新

- [x] 8.1 更新 `app/gallery/[date]/[slot]/[album]/page.tsx`：import `PhotoSlideshow` 取代 `PhotoLightbox`，傳入 `photos={lightboxPhotos}`
- [x] 8.2 刪除 `app/components/PhotoLightbox.tsx`
- [x] 8.3 將 `config/version.json` 的 `patch` 版號 +1
- [x] 8.4 依照 `.ai-rules.md` 重新產生 `README-AI.md`
