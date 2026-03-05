## 1. 型別與基礎設定

- [x] 1.1 在 `lib/types.ts` 新增 `ErrorLogDoc` 介面（含 `device_id`、`source`、`message`、`timestamp`、`date`、`expires_at`）
- [x] 1.2 確認 Firestore `error_logs` 集合在 `lib/firebase-rest.ts` 可寫入（確認 Admin SDK 有 Firestore 寫入 scope）

## 2. Client 端 logError Helper

- [x] 2.1 新增 `lib/log-error.ts`，實作 `logError(source, message)` fire-and-forget 函式
- [x] 2.2 確認 `logError` 內部 catch 靜默忽略，不拋出例外

## 3. 錯誤日誌 API Route

- [x] 3.1 新增 `app/api/log-error/route.ts`（Edge Runtime，POST handler）
- [x] 3.2 實作 body 解析與必要欄位驗證（`source`、`message`），缺少時回傳 400
- [x] 3.3 計算 `date`（台灣時間 YYYY-MM-DD）與 `expires_at`（+7 天）並透過 Admin SDK 寫入 Firestore

## 4. 修復 CameraClient catch 點

- [x] 4.1 在 `app/camera/CameraClient.tsx` 找出三個 catch 區塊，補上 `err` 參數
- [x] 4.2 blob 為 null 的 catch：呼叫 `logError('camera-client', 'blob is null')`
- [x] 4.3 `res.ok` 為 false 的 catch：呼叫 `logError('camera-client', \`upload failed: ${res.status}\`)`
- [x] 4.4 網路例外的 catch：呼叫 `logError('camera-client', err.message)`

## 5. 修復 Upload API catch 點

- [x] 5.1 在 `app/api/upload/route.ts` 找出 catch 區塊，補上 `err` 參數
- [x] 5.2 在 catch 內透過 Admin SDK 直接寫入 `error_logs`（`source: 'upload-api'`），寫入失敗靜默忽略

## 6. 後台錯誤查閱頁面

- [x] 6.1 新增 `app/admin/errors/page.tsx`（Server Component），實作日期選擇器（`searchParams` 取 `date`，預設今日台灣時間）
- [x] 6.2 實作 Firestore 查詢：`where("date", "==", selectedDate)` + 依 `timestamp` 遞減排序
- [x] 6.3 實作錯誤列表 UI：顯示時間（台灣時間 HH:MM:SS）、裝置 ID、來源、訊息
- [x] 6.4 實作無記錄時的空狀態提示文字

## 7. Firestore TTL 設定

- [x] 7.1 在 Firestore Console 於 `error_logs` 集合設定 TTL policy，欄位指向 `expires_at`（記錄至 README 或部署說明）
