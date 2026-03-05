## Why

現有架構每次前端載入圖片均直接讀取 R2 原圖（2–5 MB JPEG），監控頁、相簿與縮圖皆無統一的 resize 與格式轉換機制。建立專屬的 Image 服務 Worker，可在邊緣節點即時完成 resize、WebP 轉換與浮水印壓製，降低頻寬成本並統一圖片處理邏輯。

## What Changes

- 新增獨立 Cloudflare Worker：`workers/image-service.ts`
- 路由格式：`GET /resizing/{width}/{quality}/{r2_key}`
- 處理流程：Cloudflare Cache API（L1）→ R2 thumbnails/ 持久快取（L2）→ R2 原圖處理（miss）
- 影像處理引擎：`@cf-wasm/photon`（WASM，支援 resize、WebP 編碼、浮水印合成）
- 輸出格式：WebP（預設），quality 由 URL 參數控制
- 浮水印：可選，watermark 圖片存放於 R2 `assets/watermark.png`
- 新增 `wrangler.image-service.toml`（獨立 Worker 部署設定）
- 前端（監控頁、相簿）改用 Image 服務 URL

## Capabilities

### New Capabilities
- `image-service`: Cloudflare Worker 提供 resize、WebP 轉換、浮水印的統一影像處理服務，含兩層快取機制

### Modified Capabilities
- `monitoring-dashboard`: 改用 image-service URL 顯示裝置最新照片（縮圖）
- `photo-retrieval-ui`: 相簿格狀檢視改用 image-service URL 載入縮圖

## Impact

- **新增 `workers/image-service.ts`**：Worker 主體，處理路由、快取、影像轉換
- **新增 `wrangler.image-service.toml`**：獨立 Worker 部署設定，綁定現有 R2 bucket
- **新增 `workers/lib/photon-helper.ts`**：封裝 @cf-wasm/photon 的 resize / WebP / watermark 操作
- **`app/admin/monitoring/page.tsx`**：圖片 URL 改為 image-service endpoint
- **`app/gallery/[date]/[slot]/[album]/page.tsx`**：縮圖 URL 改為 image-service endpoint
- **依賴新增**：`@cf-wasm/photon`（npm）

## Non-goals

- 不修改原圖上傳流程（`/api/upload` 維持不變）
- 不對 JPEG、PNG、GIF 以外格式做輸入支援
- 不提供動態浮水印文字（固定圖片浮水印）
- 不建立 Admin UI 管理 image-service 設定
- 不處理影片轉碼
