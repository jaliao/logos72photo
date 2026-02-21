## Why

PWA standalone 偵測邏輯（`window.matchMedia('(display-mode: standalone)')`）在 Cloudflare Pages 正式環境實測時未能正確觸發，導致 iPhone 開啟 `/camera1`、`/camera2` 後顯示安裝引導畫面而非相機，相機功能完全無法使用。同時發現 Firebase RTDB 安全規則與 Cloudflare Worker Cron 未就緒，導致 5 分鐘自動拍照機制無法運作。

## What Changes

- 移除 `CameraClient` 中的 standalone 模式偵測，改為直接啟動相機（`setIsStandalone(true)`），確保正式環境可用
- 新增 Firebase RTDB 設定章節至 `README.md`（啟用步驟、安全規則、環境變數驗證）
- 新增 Cloudflare Worker Cron 部署章節至 `README.md`（wrangler deploy、secret 設定、log 驗證）
- 部署並設定 `logos72photo-cron` Worker（`TRIGGER_API_SECRET` 已寫入）

## Non-goals

- 重新實作 standalone 偵測（留待未來確認正確偵測方式後再處理）
- 修改 RTDB 安全規則自動化設定

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `camera-control`：移除 standalone 模式限制，相機功能在所有瀏覽器模式下均可啟動

## Impact

- **修改：** `app/camera/CameraClient.tsx`（`isStandalone` 偵測邏輯）
- **修改：** `README.md`（新增 RTDB 設定、Worker Cron 部署章節）
- **部署：** Cloudflare Worker `logos72photo-cron`（secret + cron 啟動）
