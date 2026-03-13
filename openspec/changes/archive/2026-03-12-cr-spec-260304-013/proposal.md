## Why

相機頁面存在自動拍照失效的 bug：上傳出錯後 `status` 卡在 `error` 而無法回到 `idle`，導致後續排程永遠不執行。此外狀態列資訊不足，現場難以判斷下次拍照時間與 RTDB 連線健康狀態。

## What Changes

- **BUG 修復**：`status === 'error'` 後加入自動恢復機制，3 秒後重設為 `idle` 並重新排程下次拍照
- **新增下次拍照時間**：`scheduleNextShot` 計算出 `nextShotAt` 並存入 state，顯示於狀態列（格式：`下次拍照：HH:MM:SS`）
- **狀態列改版**：
  - 顯示相機時間（已有 `currentTime`，改標籤為「相機時間」）
  - 顯示最後 RTDB 同步時間（現僅顯示時差 ms，改為也顯示上次同步時刻，格式：`RTDB：HH:MM:SS`）
  - 移除原始時差 ms 顯示（改為同步時間取代）

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `camera-pwa`: 自動拍照排程的錯誤恢復行為變更；狀態列新增下次拍照時間與最後 RTDB 同步時間欄位

## Non-goals

- 不改動拍照頻率（仍為每整 5 分鐘）
- 不改動心跳邏輯
- 不改動 RTDB 觸發機制（目前 RTDB 已降級為時間同步用途）

## Impact

- `app/camera/CameraClient.tsx`：新增 `nextShotAt`、`lastRtdbSyncAt` state；修改 error 恢復邏輯；調整狀態列 JSX
