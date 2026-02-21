## Why

目前相機頁面（`/camera`）使用 build-time 環境變數 `NEXT_PUBLIC_DEVICE_ID` 作為裝置識別，所有裝置訪問同一 URL 時會顯示相同的 device_id，導致兩台 iPhone 在監控儀表板中無法區分。此外，在 Safari 瀏覽器直接開啟相機頁面（非 standalone PWA 模式）也會啟動相機串流，存在多個視窗同時搶佔同一 device_id 的風險。

## What Changes

- **新增 `/camera1` 路由**：device_id 硬綁定為 `iphone-1`，供第一台 iPhone 使用
- **新增 `/camera2` 路由**：device_id 硬綁定為 `iphone-2`，供第二台 iPhone 使用
- **`CameraClient` 改為接受 `deviceId` prop**：移除 `process.env.NEXT_PUBLIC_DEVICE_ID` 依賴
- **加入 PWA standalone 模式偵測**：非 standalone 模式（Safari 直接開啟）顯示安裝引導頁，不啟動相機，防止重複加入造成的多實例問題
- **更新 README.md**：iPhone 開機步驟使用新網址（camera1 / camera2）

## Capabilities

### New Capabilities
- `camera-device-routing`：透過獨立路由（`/camera1`、`/camera2`）區分多台相機裝置，避免 device_id 衝突

### Modified Capabilities
- `camera-control`：`CameraClient` 改為接受 `deviceId` prop；新增 standalone 偵測邏輯，限制相機功能只在 PWA 模式下啟動

## Impact

- **新增檔案：** `app/camera1/page.tsx`、`app/camera2/page.tsx`
- **修改檔案：** `app/camera/CameraClient.tsx`（介面變更：新增 `deviceId` prop）、`app/camera/page.tsx`（傳入 `deviceId` prop）
- **文件：** `README.md`（更新 iPhone 開機步驟網址）
- **無 breaking change**：原 `/camera` 路由保留，以 `NEXT_PUBLIC_DEVICE_ID` env var 或 `iphone-unknown` 為 fallback
