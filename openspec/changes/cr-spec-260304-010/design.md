## Context

目前 `CameraClient.tsx` 透過 Firebase RTDB `trigger/last_shot` 監聽伺服器推送的時間戳記來觸發拍照。伺服器端 `/api/trigger` 每 5 分鐘寫入一次，裝置收到變更後進入倒數並拍照。

此架構的問題：RTDB 連線不穩時，裝置收不到推送，拍照完全停擺。本設計將觸發機制改為裝置本地定時，RTDB 降級為純時間同步用途。

## Goals / Non-Goals

**Goals:**
- 裝置依本地時鐘每 5 分鐘整點（00:00、00:05 … 00:55）自動拍照
- RTDB 僅用於伺服器 ↔ 裝置時間同步（每 10 分鐘）
- RTDB 故障時拍照流程不受影響

**Non-Goals:**
- 多裝置拍照精確同步（毫秒級）
- 遠端即時命令停止/暫停拍照
- 修改上傳流程或儲存邏輯

## Decisions

### D1：定時器使用 `setTimeout` 遞迴，而非 `setInterval`

每次拍照後重新計算下一個整 5 分鐘時刻，排程下一次 `setTimeout`。

- **理由**：`setInterval` 不考慮執行時間漂移；`setTimeout` 每次都對齊牆鐘，避免累積偏差。
- **替代方案**：固定 `setInterval(300_000)` — 會因頁面載入時間點不同而逐漸偏離整點。

### D2：RTDB 監聽節點改為 `sync/server_time`，伺服器每 10 分鐘寫入

`/api/trigger` 改寫 `sync/server_time`（Unix timestamp ms）。裝置監聽此節點，收到後計算 `serverTime - Date.now()` 時差，顯示於狀態列。

- **理由**：與拍照觸發解耦，RTDB 僅傳遞時間資訊，不再控制拍照行為。
- **替代方案**：保留 `trigger/last_shot` 節點名稱 — 語意混淆，不建議。

### D3：定時器在頁面載入後立即計算並排程，不等待 RTDB

裝置載入頁面後立即啟動定時器，計算距下一個整 5 分鐘的剩餘毫秒數並排程。

- **理由**：確保即使 RTDB 完全不可用，拍照仍能正常運作。

### D4：整 5 分鐘判斷邏輯

```
nextShot = ceil(now / 5min) * 5min
delay = nextShot - now
```

若 `delay < 2000ms`（距整點不足 2 秒）則跳過此輪，排程下一個整點，避免頁面剛載入時誤觸發。

## Risks / Trade-offs

- **裝置時鐘偏差** → 若裝置時間不準，拍照時刻會偏離整點。透過狀態列顯示時差讓現場人員知悉，必要時手動校正裝置時間。
- **頁面背景化（iOS Safari）** → iOS 在 PWA 背景模式可能凍結 JS timer。此為現有限制，本次不處理；建議裝置保持螢幕常亮。
- **移除即時觸發能力** → 改版後無法從伺服器端即時命令裝置立刻拍照。若日後有此需求，需另行設計獨立的 command 節點。

## Migration Plan

1. 更新 Firebase RTDB Security Rules：新增 `sync/server_time` 可匿名讀寫
2. 部署 `/api/trigger` 改版（寫入 `sync/server_time`）
3. 部署 `CameraClient.tsx` 改版（移除舊監聽、加入定時器）
4. 確認裝置重新載入頁面後可在整點自動拍照

**Rollback**：若有問題，還原 `CameraClient.tsx` 與 `/api/trigger` 至前一版本即可；RTDB 舊節點 `trigger/last_shot` 資料不刪除。
