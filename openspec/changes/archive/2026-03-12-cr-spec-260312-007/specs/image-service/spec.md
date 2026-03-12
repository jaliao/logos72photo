## MODIFIED Requirements

### Requirement: 影像處理路由
Image Service Worker SHALL 提供 `GET /resizing/{width}/{quality}/{r2_key}` 路由，接受任意 `width`（px）與 `quality`（1-100）參數，回傳對應尺寸的 WebP 格式縮圖。呼叫端 SHALL 透過 `lib/image.ts` 的 `toThumbUrl()`、`toThumb640()`、`toThumb1280()` 產生對應 URL，不得在元件或頁面內直接拼接 Image Service URL 或硬編碼縮圖尺寸。

#### Scenario: 有效路由回傳 WebP 縮圖
- **WHEN** 請求 `GET /resizing/640/80/{r2_key}`
- **THEN** Worker SHALL 回傳 640px 寬、quality 80 的 WebP 圖片，HTTP 200

#### Scenario: 呼叫端透過 lib/image 取得縮圖 URL
- **WHEN** 任意頁面或元件需要縮圖 URL
- **THEN** 該頁面 SHALL import `toThumb640` 或 `toThumb1280` 自 `lib/image`，不重複定義 `toThumbUrl`
