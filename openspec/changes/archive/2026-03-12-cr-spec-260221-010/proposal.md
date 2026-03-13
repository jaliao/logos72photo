## Why

目前相機頁面在呼叫 `getUserMedia` 時未指定解析度限制，導致瀏覽器自行選擇較低的預設畫質，使拍攝照片品質低於 iPhone 原生相機應有水準。現場攝影需要高畫質存檔，應充分利用 iPhone 硬體能力。

## What Changes

- 在 `getUserMedia` 的 video constraints 中，偵測裝置為 iPhone 時，將 `width` 與 `height` 設定為 `{ ideal: 9999 }`（要求瀏覽器給予最大解析度），讓系統自動採用該裝置原生相機支援的最高寬高
- 非 iPhone 裝置維持現有行為（無額外解析度限制）
- 拍照時以 `canvas.drawImage` 輸出的尺寸同步跟隨串流實際解析度（`videoWidth` / `videoHeight`），不做額外縮放

## Capabilities

### New Capabilities
- `iphone-photo-quality`: iPhone 裝置偵測與拍照解析度最大化邏輯，確保在 iPhone 上以原生相機最高支援解析度進行串流與拍照

### Modified Capabilities
- `camera-control`: 新增相機初始化時的解析度設定需求，以及依裝置類型套用不同 constraints 的行為規格

## Impact

- `app/camera[N]/page.tsx`（或對應的 CameraView Client Component）：修改 `getUserMedia` 呼叫的 constraints
- `canvas` 拍照輸出邏輯：確保輸出尺寸與串流解析度一致
- 無新增外部依賴、無 API 異動、無資料庫 schema 變更

## Non-goals

- 不調整 JPEG 壓縮品質參數（`toBlob` quality 值維持現狀）
- 不支援非 iPhone 裝置的解析度優化（超出本次範圍）
- 不提供使用者自行切換解析度的 UI
