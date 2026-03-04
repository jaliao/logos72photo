## Why

目前拍照觸發機制有兩個問題：倒數時間為 15 秒且觸發點從整點第 0 秒開始，導致實際拍照時間比預期晚；相機狀態列時間格式使用 24 時制，現場人員難以直觀判讀。需調整倒數秒數、觸發起始時間偏移，以及時間顯示格式，以符合實際拍攝需求。

## What Changes

- 倒數時間從 **15 秒改為 10 秒**（`countdown` state 初始值 15 → 10）
- 伺服器端觸發排程從「每 5 分鐘整點（0 秒）」改為「**每 5 分鐘的第 −60 秒**（即提早 60 秒觸發）」
  - 例：原 12:00:00、12:05:00 觸發 → 改為 11:59:00、12:04:00 觸發
- 相機狀態列「現在時間」與「RTDB 觸發」顯示格式從 **HH:MM:SS（24 時制）改為上午/下午 H:MM:SS（12 時制）**

## Capabilities

### New Capabilities
- 無新增 Capability

### Modified Capabilities
- `countdown-shutter`：倒數初始秒數從 15 改為 10
- `camera-control`：時間顯示格式改為 12 時制（上午/下午），觸發排程偏移 −60 秒（由 cron job / API 層調整）

## Impact

- `openspec/specs/countdown-shutter/spec.md`：更新倒數秒數 requirement
- `openspec/specs/camera-control/spec.md`：更新時間顯示格式 requirement，新增觸發排程偏移 requirement
- 相機頁面 Client Component（`CameraClient` 或同等組件）：修改倒數初始值與時間格式化邏輯
- 伺服器端觸發 API 或 cron 設定：調整觸發時間偏移（提早 60 秒）
