## ADDED Requirements

### Requirement: 影像處理路由
Image Service Worker SHALL 提供 `GET /resizing/{width}/{quality}/{r2_key}` 路由，接受任意 `width`（px）與 `quality`（1-100）參數，回傳對應尺寸的 WebP 格式縮圖。呼叫端 SHALL 透過 `lib/image.ts` 的 `toThumbUrl()`、`toThumb640()`、`toThumb1280()` 產生對應 URL，不得在元件或頁面內直接拼接 Image Service URL 或硬編碼縮圖尺寸。

#### Scenario: 有效路由回傳縮圖
- **WHEN** 用戶端發送 `GET /resizing/{width}/{quality}/{r2_key}`
- **THEN** 系統 SHALL 回傳指定尺寸的圖片，尺寸為指定寬度（高度等比例）

#### Scenario: 呼叫端透過 lib/image 取得縮圖 URL
- **WHEN** 任意頁面或元件需要縮圖 URL
- **THEN** 該頁面 SHALL import `toThumb640` 或 `toThumb1280` 自 `lib/image`，不重複定義 `toThumbUrl`

#### Scenario: width 超出範圍
- **WHEN** width 小於 1 或大於 3000
- **THEN** 系統 SHALL 回傳 400 Bad Request

#### Scenario: quality 超出範圍
- **WHEN** quality 小於 1 或大於 100
- **THEN** 系統 SHALL 回傳 400 Bad Request

#### Scenario: R2 原圖不存在
- **WHEN** 指定的 r2_key 在 R2 中不存在
- **THEN** 系統 SHALL 回傳 404 Not Found

### Requirement: 兩層快取機制
系統 SHALL 以 Cloudflare Cache API（L1）與 R2 thumbnails/ 資料夾（L2）做兩層快取，避免重複處理相同參數的圖片。

#### Scenario: L1 快取命中
- **WHEN** 相同 URL 在邊緣節點已有快取
- **THEN** 系統 SHALL 直接回傳快取內容，不讀取 R2

#### Scenario: L2 快取命中（L1 miss）
- **WHEN** L1 未命中，但 R2 `thumbnails/{width}w_{quality}q/{r2_key}.jpg` 存在
- **THEN** 系統 SHALL 讀取 L2 快取並回傳，同時寫入 L1

#### Scenario: 雙層 miss，處理原圖
- **WHEN** L1 與 L2 皆未命中
- **THEN** 系統 SHALL 從 R2 讀取原圖，以 photon WASM 處理後回傳，並同時寫入 L1 與 L2

### Requirement: JPEG 格式輸出（lossy）
系統 SHALL 以 lossy JPEG 格式輸出所有處理結果，quality 參數控制壓縮品質。

#### Scenario: 輸出 JPEG
- **WHEN** 影像處理完成
- **THEN** 輸出 MUST 為 JPEG 格式，Content-Type: `image/jpeg`

#### Scenario: quality 參數生效
- **WHEN** quality=80
- **THEN** 輸出 JPEG 品質 SHALL 對應 80%，檔案大小應明顯小於 quality=100

### Requirement: 浮水印疊加
若環境變數 `WATERMARK_ENABLED=true`，系統 SHALL 在輸出圖片右下角疊加 R2 `assets/watermark.png`。

#### Scenario: 浮水印啟用
- **WHEN** `WATERMARK_ENABLED=true` 且 `assets/watermark.png` 存在於 R2
- **THEN** 輸出圖片右下角 SHALL 顯示浮水印，margin 為圖片寬度的 2%

#### Scenario: 浮水印停用
- **WHEN** `WATERMARK_ENABLED=false` 或未設定
- **THEN** 輸出圖片 SHALL 不包含任何浮水印

#### Scenario: 浮水印圖片不存在
- **WHEN** `WATERMARK_ENABLED=true` 但 R2 `assets/watermark.png` 不存在
- **THEN** 系統 SHALL 靜默略過浮水印，仍正常輸出縮圖

### Requirement: 影像處理失敗降級
影像處理失敗時，系統 SHALL 以 302 Redirect 至 R2 原圖公開 URL，確保前端不中斷。

#### Scenario: 影像處理錯誤
- **WHEN** photon WASM 處理過程發生錯誤
- **THEN** 系統 SHALL 回傳 `302 Location: {R2_PUBLIC_URL}/{r2_key}`

### Requirement: CORS 支援
Worker SHALL 回傳 `Access-Control-Allow-Origin: *` header，允許跨域存取。

#### Scenario: 跨域請求
- **WHEN** 任何來源發送 GET 請求
- **THEN** 回應 SHALL 包含 `Access-Control-Allow-Origin: *` header
