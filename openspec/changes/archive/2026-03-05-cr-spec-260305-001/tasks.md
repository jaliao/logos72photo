## 1. 依賴安裝與專案設定

- [x] 1.1 執行 `npm install @cf-wasm/photon --legacy-peer-deps` 安裝影像處理庫
- [x] 1.2 確認 `package.json` 已新增 `@cf-wasm/photon` 依賴
- [x] 1.3 建立 `wrangler.image-service.toml`，設定 Worker name、main entry、R2 bucket binding 與環境變數（`R2_PUBLIC_URL`、`WATERMARK_ENABLED`）

## 2. Photon Helper 封裝

- [x] 2.1 建立 `workers/lib/photon-helper.ts`，封裝 `resizeToWidth(buffer, width): Uint8Array` 函式（等比例縮放）
- [x] 2.2 在 `photon-helper.ts` 新增 `encodeWebP(photonImage, quality): Uint8Array` 函式
- [x] 2.3 在 `photon-helper.ts` 新增 `applyWatermark(photonImage, watermarkBuffer, marginRatio): PhotonImage` 函式（右下角疊加）

## 3. Image-Service Worker 主體

- [x] 3.1 建立 `workers/image-service.ts`，實作路由解析 `GET /resizing/{width}/{quality}/{r2_key}`
- [x] 3.2 新增參數驗證：width 1–3000、quality 1–100，不合法回傳 400
- [x] 3.3 實作 L1 快取查詢：`caches.default.match(request)`，命中直接回傳
- [x] 3.4 實作 L2 快取查詢：讀取 R2 `thumbnails/{width}w_{quality}q/{r2_key}.webp`，命中則回傳並寫入 L1
- [x] 3.5 實作原圖讀取：從 R2 binding 讀取 `{r2_key}`，不存在回傳 404
- [x] 3.6 整合 photon-helper：原圖 → resize → WebP encode，視 `WATERMARK_ENABLED` 決定是否疊加浮水印
- [x] 3.7 處理完成後將結果寫入 L2（R2 thumbnails/）與 L1（Cache API）
- [x] 3.8 新增錯誤降級：影像處理失敗時回傳 `302 Location: {R2_PUBLIC_URL}/{r2_key}`
- [x] 3.9 回應加入 `Access-Control-Allow-Origin: *` 與 `Cache-Control: public, max-age=86400` headers

## 4. 浮水印圖片上傳

- [x] 4.1 準備浮水印圖片（PNG 格式，建議透明背景，寬度約 200px）
- [x] 4.2 以 `wrangler r2 object put logos72photo/assets/watermark.png --file ./assets/watermark.png` 上傳至 R2

## 5. Worker 部署與驗證

- [x] 5.1 執行 `wrangler deploy --config wrangler.image-service.toml` 部署 image-service Worker
- [x] 5.2 設定 Wrangler secret：`wrangler secret put R2_PUBLIC_URL --config wrangler.image-service.toml`（若未放 vars）
- [x] 5.3 手動測試：`GET /resizing/640/80/2026-03-05/iphone-2_1772682021956.jpg`，確認回傳 JPEG（改為 lossy JPEG 輸出）且尺寸正確
- [x] 5.4 驗證 L1 快取：連續兩次請求，第二次回應 header 含 `CF-Cache-Status: HIT`
- [x] 5.5 驗證 L2 快取：確認 R2 `thumbnails/640w_80q/` 資料夾出現對應 .jpg 檔案

## 6. 前端：監控頁更新

- [x] 6.1 修改 `app/admin/monitoring/page.tsx`，將最新照片 `<img>` src 改為 image-service URL（`/resizing/640/80/{r2_key}`）
- [x] 6.2 從 `last_photo_url` 解析出 `r2_key`（去掉 `R2_PUBLIC_URL` 前綴）
- [x] 6.3 新增 `onError` fallback：img 載入失敗時改用原始 `last_photo_url`

## 7. 前端：相簿格狀檢視更新

- [x] 7.1 修改 `app/gallery/[date]/[slot]/[album]/page.tsx`，格狀縮圖 src 改為 image-service URL（`/resizing/640/80/{r2_key}`）
- [x] 7.2 從 `r2_url` 解析出 `r2_key`
- [x] 7.3 新增 `onError` fallback：img 載入失敗時改用原始 `r2_url`
- [x] 7.4 確認點擊圖片「預覽原圖」或「下載」功能仍使用原始 `r2_url`

## 8. 版本號與 README-AI 更新

- [x] 8.1 將 `config/version.json` patch 版號 +1
- [x] 8.2 依照 `.ai-rules.md` 更新 `README-AI.md`，反映新增的 image-service Worker 架構
