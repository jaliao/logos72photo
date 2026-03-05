## Why

目前每次拍照只存一張原始 JPEG（可達數 MB），監控頁與縮圖需求全部載入完整圖片，造成頻寬浪費、頁面載入緩慢。在上傳原圖的同時產生 WebP 縮圖，可顯著降低監控頁與相簿格狀檢視的流量消耗。

## What Changes

- `/api/upload` 在上傳原圖後，同步產生 WebP 縮圖並上傳至 R2 `thumbnails/` 資料夾
- R2 縮圖路徑格式：`thumbnails/YYYY-MM-DD/device_id_timestamp.webp`
- Firestore `photos` 文件新增 `thumbnail_url` 欄位
- Firestore `devices` 文件新增 `last_thumbnail_url` 欄位（供監控頁使用）
- 監控頁（`/admin/monitoring`）改用 `last_thumbnail_url` 顯示最新照片
- 相簿格狀檢視改用 `thumbnail_url` 載入縮圖，點擊後才載入原圖

## Capabilities

### New Capabilities
- `thumbnail-generation`: 伺服器端將 JPEG 轉換為 WebP 縮圖並上傳 R2，回寫 Firestore

### Modified Capabilities
- `photo-storage-management`: Firestore `photos` 新增 `thumbnail_url` 欄位；`devices` 新增 `last_thumbnail_url`
- `monitoring-dashboard`: 改用 `last_thumbnail_url` 顯示裝置最新照片
- `photo-retrieval-ui`: 相簿格狀格狀檢視改用 `thumbnail_url`

## Impact

- **`app/api/upload/route.ts`**：新增縮圖產生與上傳邏輯
- **`lib/r2.ts`**：無需改動（共用現有 S3 client）
- **`lib/types.ts`**：`PhotoDoc` 新增 `thumbnail_url`；`DeviceDoc` 新增 `last_thumbnail_url`
- **`app/api/heartbeat/route.ts`**：payload 接受 `last_thumbnail_url`
- **`app/admin/monitoring/page.tsx`**：改用 `last_thumbnail_url`
- **`app/gallery/[date]/[slot]/[album]/page.tsx`**：改用 `thumbnail_url`
- **依賴**：Edge Runtime 環境需使用純 Web API（`canvas` 不可用）；改用 `@cf/image-resize` 或透過 Cloudflare Images Transform，或在 Next.js Server Action 端用 `sharp`（若部署於 Node.js 環境）

## Non-goals

- 不修改原圖上傳邏輯或畫質
- 不對歷史照片批次補產縮圖
- 不提供縮圖尺寸自訂 API
- 不在 camera 端（瀏覽器）做縮圖，保持上傳流程單純
