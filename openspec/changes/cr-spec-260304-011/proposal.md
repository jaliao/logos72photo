## Why

監控儀表板的心跳資訊顯示過於分散：「最後心跳」與「下次心跳」分成兩列，佔用空間且語意不夠清晰。需要合併為更精簡的單列顯示，並統一用詞為「裝置心跳」。

## What Changes

- 將「最後心跳」標籤改為「裝置心跳」
- 將心跳時間與下次心跳倒數合併為同一列，格式：`2026/3/4 下午9:45:12 ( 約 5 秒後 )`
- 移除獨立的「下次心跳」列

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `monitoring-realtime-dashboard`: 心跳資訊顯示格式變更（合併兩列為一列、調整標籤文字）

## Impact

- `app/admin/monitoring/page.tsx`：調整時間資訊區塊的標籤與版面
