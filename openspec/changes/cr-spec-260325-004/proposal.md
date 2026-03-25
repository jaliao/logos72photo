## Why

camera1（`iphone-1`）間歇性拍出全黑照片並上傳至 R2，汙染相簿。硬體損壞時無法立即更換設備，需要一個後台開關能讓攝影師快速將問題裝置下線，並在換機後重新啟用，同時加入黑圖自動偵測作為軟體層防護。

## What Changes

- **新增裝置啟用/停用控制**：Firestore `devices/{device_id}` 文件紀錄裝置狀態（`enabled: boolean`）；上傳 API 拒絕來自停用裝置的請求；相機頁面顯示「裝置已下線」訊息。
- **後台裝置管理頁面**：`/admin/devices` 列出所有已知裝置，可切換啟用狀態。
- **黑圖自動偵測（相機端）**：拍照後在 canvas 取樣像素平均亮度，若低於閾值（如 8/255）視為黑圖，自動重拍最多 3 次，仍黑則跳過本次觸發並記錄 error log。
- **新增 camera warm-up 保護**：`getUserMedia` 成功後，記錄 stream 啟動時間，倒數觸發時若 stream 啟動未滿 1.5 秒則延後拍照。

## Non-goals

- 不修改 R2 儲存結構。
- 不自動刪除已上傳的黑圖（需手動透過現有 admin 清除工具處理）。
- 不支援遠端觸發裝置重啟。
- 不支援超過 2 台裝置的擴充（維持現有 `iphone-1` / `iphone-2` 架構）。

## Capabilities

### New Capabilities

- `device-enable-control`：裝置啟用/停用狀態管理（Firestore 資料模型 + 上傳 API 驗證 + 相機頁面狀態顯示 + 後台管理介面）。
- `black-photo-detection`：相機端拍照後黑圖偵測與自動重拍邏輯。

### Modified Capabilities

- `photo-upload-api`：上傳前檢查裝置啟用狀態，停用裝置回傳 403。
- `camera-control`：新增 warm-up 保護與黑圖偵測整合至拍照流程。
- `admin-gallery`：新增 `/admin/devices` 裝置管理子頁面。

## Impact

- `app/api/upload/route.ts`：新增 Firestore 裝置狀態查詢。
- `app/(camera)/camera1/page.tsx`、`camera2/page.tsx`（或共用 camera component）：新增 warm-up guard + 黑圖偵測邏輯。
- `app/admin/devices/page.tsx`：新頁面。
- `app/api/admin/devices/route.ts`：新 API（GET 列表 / PATCH 切換狀態）。
- Firestore：新增 `devices` collection。
