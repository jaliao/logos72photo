## Why

目前拍照觸發完全依賴 Firebase RTDB 推送訊號；一旦 RTDB 連線不穩，所有裝置將停止拍照。改為裝置本地定時觸發後，RTDB 故障只影響時間同步，拍照流程可獨立持續運作，提升整體可靠性。

## What Changes

- 拍照觸發機制從「RTDB 事件驅動」改為「裝置本地時脈定時」
  - 每 5 分鐘整點（HH:00、HH:05、HH:10 … HH:55）進入倒數並拍照
  - 使用裝置本地時間計算下次拍照時刻
- RTDB 角色從「拍照觸發」降級為「時間同步」
  - 伺服器每 10 分鐘更新 `sync/server_time` 節點（timestamp）
  - 裝置收到後計算與伺服器的時差，並顯示於狀態列供現場人員確認
- `/api/trigger` 端點：從觸發拍照改為僅寫入時間同步節點
- 移除裝置端對 `trigger/last_shot` 的監聽邏輯

## Capabilities

### New Capabilities
- `camera-scheduled-shot`: 裝置本地定時拍照，每 5 分鐘整點自動進入倒數並執行拍照，不依賴外部推送訊號
- `device-time-sync`: 伺服器每 10 分鐘透過 RTDB 發布時間戳記，裝置計算時差並顯示於狀態列

### Modified Capabilities
- `camera-control`: 移除「同步拍照觸發」需求（RTDB 觸發拍照），改由 `camera-scheduled-shot` 取代；保留心跳在線狀態指示、狀態列時間顯示等需求，RTDB 觸發時間戳記欄位改為顯示時間同步資訊

## Impact

- `app/camera/CameraClient.tsx`：移除 RTDB `trigger/last_shot` 監聽，加入本地 `setInterval` 定時邏輯
- `app/api/trigger/route.ts`：寫入目標節點從 `trigger/last_shot` 改為 `sync/server_time`
- Firebase RTDB Security Rules：新增 `sync/server_time` 可匿名讀取規則
- `openspec/specs/camera-control/spec.md`：移除同步拍照觸發 requirement，新增時間同步 requirement
