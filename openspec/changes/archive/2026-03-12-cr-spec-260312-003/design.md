## Context

現有 `photo-lightbox` spec 已實作單張全螢幕 Lightbox（黑色背景覆蓋層、關閉按鈕、Escape 鍵、簡易下載連結）。本次升級目標是在不改變路由結構的前提下，將 Lightbox 元件改寫為仿 Google Photos 的全螢幕幻燈片，新增左右導覽、iOS Web Share API 下載流程、分享連結功能，並統一操作按鈕至左上 / 右上角。

照片資料已存放於 Cloudflare R2（public URL，無簽章）。**相簿瀏覽使用 image-service 縮圖**（WebP，透過 `ThumbnailImage` 元件）；**下載才存取 R2 原圖**（`r2_url`）。`PhotoDoc` 中無 `seq` 系統流水號欄位；R2 檔名格式為 `{device_id}_{timestamp}.jpg`。

R2 CORS 已設定，允許以下來源直接 `fetch` 原圖：`https://logos72photo.pages.dev`、`http://localhost:3000`（GET / POST / PUT / DELETE / HEAD）。

## Goals / Non-Goals

**Goals:**
- 幻燈片覆蓋整個 viewport，背景為同張照片的模糊版本（消除黑底），單次只顯示一張照片
- **手機**：前景照片 `object-cover` 填滿整個手機畫面（全螢幕滿版）
- **桌機**：前景照片以 `3/4` 比例容器置中，填滿視窗高度，兩側由模糊背景填補
- 左上角「← 返回」按鈕關閉幻燈片
- 左右箭頭按鈕切換上一張 / 下一張；支援鍵盤 ←→ 方向鍵；手機支援水平 Swipe 手勢
- 右上角「下載」按鈕：桌面 / Android 觸發存檔對話窗，預設檔名 `IMG_{seq}`；iOS 使用 `navigator.share` 系統分享選單（可存至相簿）
- 右上角「分享」按鈕：寫入 `navigator.clipboard`，顯示「已複製！」Toast 提示
- 移除點擊背景關閉（防誤觸）；保留 Escape 鍵關閉
- 首尾照片時箭頭 disabled 或隱藏（不循環）

**Non-Goals:**
- 不做縮圖列（filmstrip）
- 不做照片縮放（pinch-to-zoom）
- 不做影片播放
- 不修改路由結構或 URL
- 不做離線快取

## Decisions

### D1：元件架構 — 改寫現有 Lightbox 或新建幻燈片元件？
**決定：** 新建 `PhotoSlideshow` Client Component，舊 Lightbox 元件廢棄。

**理由：** 舊 Lightbox 僅支援單張，狀態管理簡單；幻燈片需要 `currentIndex` state、鍵盤事件監聽、Swipe 手勢，重寫比改寫更乾淨，避免舊邏輯干擾。

### D2：下載原圖方案 — Client-side Blob Fetch
**決定：** 前端直接 `fetch(r2Url)` 取得原圖 Blob，再依平台觸發對應存檔流程。不需要 Proxy API Route。

**理由：** R2 CORS 已確認設定（允許 `logos72photo.pages.dev` 與 `localhost:3000`），前端可直接跨域 fetch 原圖。

實作流程：
1. 點擊下載按鈕 → `fetch(r2Url)` → `Blob`
2. 建立 `File` 物件，命名為 `IMG_XXXX.jpg`
3. `if (navigator.canShare?.({ files })) navigator.share({ files, title: 'IMG_XXXX' })` → iOS 系統分享選單（可存至相簿）
4. `else` → `URL.createObjectURL(blob)` + 動態 `<a download="IMG_XXXX.jpg">` click → 存檔對話窗
5. 下載過程中按鈕顯示 loading，完成後釋放 object URL

### D2b：iOS 存至相簿方案 — Web Share API
**決定：** iOS 優先使用 `navigator.share({ files })` 開啟系統分享選單，讓使用者可直接「加入照片」存至相簿。

**理由：** R2 CORS 已開放，可成功 fetch Blob 並建立 File 物件。`navigator.share({ files })` 在 iOS 15+ 支援，且必須在 user gesture（button click）中呼叫，確保觸發條件滿足。桌面 / Android 自動 fallback 至 `<a download>`。

### D3：Swipe 手勢 — 自製 vs 套件？
**決定：** 自製輕量 `useSwipe` hook（`touchstart` / `touchend`，判斷 deltaX > 50px）。

**理由：** 避免引入 `react-swipeable` 等套件增加 bundle 大小；需求單純（僅水平 swipe），自製 hook 20 行內可完成。

### D4：分享連結格式
**決定：** 複製當前頁面 URL + `?photo={seq}` query param（僅供前端定位，不改變路由）。若已有 `?photo=` 則替換。

**理由：** 無需後端配合；訪客開啟連結時，前端讀取 `?photo=seq` 自動開啟對應幻燈片。

### D5：下載檔名 `IMG_XXXX` 的編號來源
**決定：** 以照片在相簿中的**顯示順序（1-based index，4 位補零）**作為流水號，例如第 1 張為 `IMG_0001.jpg`、第 12 張為 `IMG_0012.jpg`。伺服器端（`AlbumPage`）在 `lightboxPhotos` 陣列中填入 `filename: 'IMG_XXXX.jpg'`，傳給幻燈片元件。

**理由：** `PhotoDoc` 無全域流水號欄位；R2 檔名含 `device_id_timestamp`，不適合作為使用者可讀檔名。相簿內按時間排序的 index 已能唯一標識每張照片且簡潔易懂。`LightboxPhoto` interface 新增 `filename: string` 欄位。

## Risks / Trade-offs

- **iOS Web Share API 需使用者手勢觸發**（user gesture）→ 下載按鈕 `onClick` 直接呼叫，確保在手勢事件鏈中
- **Fetch 原圖需時間（大檔案）** → 下載按鈕點擊後顯示 loading 狀態，完成後再觸發 share/download
- **Fetch 原圖需時間（大檔案）** → 下載按鈕點擊後顯示 loading 狀態，完成後再觸發 share/download
- **`?photo=seq` 分享連結**：若照片已刪除，開啟後找不到對應 seq → 幻燈片靜默 fallback 至第一張，不顯示錯誤
- **鍵盤事件全域監聽** → `useEffect` 中監聽 `window.keydown`，元件 unmount 時清除，避免記憶體洩漏

## Migration Plan

1. 新建 `app/components/PhotoSlideshow.tsx`（Client Component，取代 PhotoLightbox）
2. 更新 `LightboxPhoto` interface，新增 `filename: string` 欄位
3. 更新 `AlbumPage`：`lightboxPhotos` 填入 `filename`，替換元件呼叫為 `<PhotoSlideshow>`
4. 刪除 `app/components/PhotoLightbox.tsx`
5. 測試：桌面 Chrome（存檔對話窗）、Android Chrome（存檔）、iOS Safari（Web Share → 加入照片）

## Open Questions

（無）
