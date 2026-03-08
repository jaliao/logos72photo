## Context

目前相簿各頁面 h1 各自顯示不同內容（首頁：品牌名；時段頁：日期；照片頁：日期+時段），缺乏品牌一致性。照片預覽頁的下載 overlay 依賴 CSS hover，在手機觸控裝置無效，訪客無法便捷地預覽或下載單張照片。首頁卡片陰影視覺層次不足。

## Goals / Non-Goals

**Goals:**
- 全相簿頁面 h1 固定為「不間斷讀經接力相簿」，日期/時段以副標方式呈現
- 照片預覽頁點擊縮圖開啟全螢幕 Lightbox，顯示高解析縮圖與明顯的下載、關閉按鈕
- 首頁日期卡片 box-shadow 加深，增強視覺層次

**Non-Goals:**
- 不實作 iOS Web Share API 或 native 相簿存取
- 不修改時段列表頁（slot page）卡片樣式
- 不新增滑動切換照片（swipe）功能

## Decisions

### D1：Lightbox 為獨立 Client Component `PhotoLightbox.tsx`

照片頁（`AlbumPage`）為 Server Component，Lightbox 需要 `useState`（開啟/關閉、目前照片索引）。因此抽出 `PhotoLightbox` Client Component，由 Server Component 傳入照片陣列。

- **理由**：最小化 Client Component 範圍，Server Component 負責資料取得，Client Component 只負責互動。
- **替代方案**：將整個 AlbumPage 轉為 Client Component — 失去 SSR 資料取得優勢，不採用。

### D2：Lightbox 顯示 image-service 高解析縮圖（1280px），不使用原圖

Lightbox 開啟時載入 `toThumbUrl(r2Url, 1280, 85)` 而非 R2 原圖（可能數 MB）。

- **理由**：R2 原圖在手機網路下載緩慢；1280px WebP 已足夠全螢幕手機螢幕顯示。下載按鈕仍連結 R2 原圖，確保使用者可取得完整解析度。
- **替代方案**：直接顯示原圖 — 網路成本高，UX 差。

### D3：Lightbox 關閉方式：點擊背景、按 Escape、點擊關閉按鈕

三種關閉路徑，適配桌面（ESC）與手機（點擊背景/關閉按鈕）。

- **理由**：一致的用戶習慣；手機無鍵盤，需明顯的點擊關閉按鈕。

### D4：h1 改為固定文字，日期/時段改為 `<p>` 副標

頁面結構：`<h1>不間斷讀經接力相簿</h1>` → `<p class="subtitle">{date} / {slotLabel}</p>`。首頁副標維持「從白天到黑夜不停的運行」，子頁面副標顯示日期+時段上下文。

- **理由**：品牌識別優先；上下文資訊（日期、時段）仍清晰呈現於副標。
- **替代方案**：h1 顯示品牌名，另加麵包屑導覽列 — 結構較複雜，目前流量規模不需要。

### D5：PhotoLightbox 以 `fixed inset-0` 覆蓋層實作，z-index 高於 GalleryBackground

Lightbox backdrop `bg-black/90` 蓋住整個 viewport，含 GalleryBackground 動畫。

- **理由**：避免背景動畫干擾照片瀏覽；z-50 確保覆蓋所有層。

## Risks / Trade-offs

- **iOS Safari `download` 屬性跨域限制** → R2 URL 與網站 origin 不同時，`<a download>` 在 iOS 可能開新頁而非下載。建議在 Lightbox 說明文字加「iOS 請長按圖片 → 儲存到照片」提示。
- **Lightbox 鎖定頁面捲動** → 開啟時需 `document.body.style.overflow = 'hidden'`，關閉後還原，避免背景可捲動。於 `useEffect` cleanup 中還原。
- **Server Component 傳 photos 給 Client Component** → 照片陣列序列化為 props，確保 `PhotoDoc` 只包含可序列化欄位（string、number），無 Function/Date 物件。

## Migration Plan

1. 建立 `app/components/PhotoLightbox.tsx`
2. 修改 `app/gallery/[date]/[slot]/[album]/page.tsx`：引入 Lightbox、修改 h1/副標
3. 修改 `app/gallery/[date]/[slot]/page.tsx`：修改 h1/副標
4. 修改 `app/page.tsx`：副標文字微調（h1 已正確）
5. 修改 `app/components/GalleryDateList.tsx`：加深 boxShadow
6. 本地視覺確認（手機 + 桌面）
