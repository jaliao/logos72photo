## Why

相機端與 API 端的錯誤均被靜默吞掉（`catch` 無 `err` 參數），現場無法得知失敗原因。需要一套輕量錯誤日誌機制，將錯誤寫入 Firestore 並在後台依日期查閱，同時避免日誌無限成長（TTL 7 天自動清除）。

## What Changes

- **新增 Firestore `error_logs` 集合**：文件含 `device_id`、`source`、`message`、`timestamp`、`date`、`expires_at`（Firestore TTL 欄位，7 天後自動刪除）
- **新增 API `/api/log-error`**：接收 client 端錯誤，透過 Admin SDK 寫入 `error_logs`（Edge Runtime，POST JSON）
- **修復 CameraClient 三個 catch 點**：
  - `blob` 為 null
  - `res.ok` 為 false（附帶 HTTP status code）
  - 網路例外（附帶 `err.message`）
  - 每個 catch 呼叫 `logError(source, message)` 送至 `/api/log-error`
- **修復 `/api/upload` catch**：伺服器端錯誤同樣寫入 `error_logs`（Admin SDK 直寫，不需走 REST）
- **新增後台頁面 `/admin/errors`**：依日期（台灣時間）列出錯誤，顯示時間、裝置、來源、訊息；日期選擇器預設今天

## Capabilities

### New Capabilities
- `error-logging`: 錯誤收集 API、Firestore 寫入、TTL 策略、後台查閱頁面

### Modified Capabilities
- `camera-pwa`: catch 點補上 `err` 並呼叫 logError
- `photo-upload-api`: catch 補上錯誤寫入

## Non-goals

- 不做即時告警（LINE Notify、Email 等）
- 不做錯誤統計圖表
- 不做 client 端離線佇列（失敗就送，送不出去就算）

## Impact

- 新增：`app/api/log-error/route.ts`
- 新增：`app/admin/errors/page.tsx`
- 修改：`app/camera/CameraClient.tsx`（三處 catch）
- 修改：`app/api/upload/route.ts`（catch 補寫日誌）
- 修改：`lib/types.ts`（新增 `ErrorLogDoc`）
- Firestore：需在 Console 設定 `error_logs.expires_at` TTL policy
