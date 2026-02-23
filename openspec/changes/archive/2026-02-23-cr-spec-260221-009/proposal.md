## Why

`app/camera/CameraClient.tsx` 目前有多個 TODO 待補完，且缺乏鏡頭切換與拍照倒數視覺回饋，導致使用者在現場操作時缺乏明確的操作反饋與控制彈性。需在正式場合使用前完成這些 UI 功能。

## What Changes

- 新增鏡頭切換按鈕（前鏡頭 ↔ 後鏡頭），點擊時重新取得 MediaStream
- 新增拍照倒數機制：收到 RTDB 觸發後，先倒數 15 秒再執行拍照
- 新增倒數視覺特效：畫面中央顯示大型倒數數字，搭配縮放動畫與漸層光暈
- 新增「即將拍照」狀態文字，在狀態列閃爍提示
- 修正心跳綠色指示點：改用 `lastHeartbeat` 時間戳作為在線判斷依據（移除現有 TODO）
- 修正狀態列時間顯示（移除 TODO）

## Capabilities

### New Capabilities

- `camera-flip`: 前後鏡頭切換功能，重新呼叫 `getUserMedia` 並切換 `facingMode`
- `countdown-shutter`: 拍照倒數計時器（15 秒），含中央大字倒數與動畫特效

### Modified Capabilities

- `camera-control`: 相機控制流程加入倒數觸發邏輯，`shoot()` 改為在倒數結束後才執行

## Impact

- 影響檔案：`app/camera/CameraClient.tsx`（唯一修改目標）
- 無新增 API 路由、無資料庫 schema 變更
- 倒數期間 `status` 需新增 `'countdown'` 狀態，影響 shoot guard 邏輯
- 鏡頭切換需重設 `videoRef.srcObject`，需停止舊 stream 才能重新 getUserMedia
