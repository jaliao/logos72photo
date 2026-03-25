## ADDED Requirements

### Requirement: 拍照後黑圖偵測
相機端在 `canvas.drawImage(video, 0, 0)` 完成後，SHALL 對 canvas 中心 64×64 px 區域取樣，計算所有像素的平均亮度（`Y = 0.299R + 0.587G + 0.114B`）。若平均亮度 < 8（滿分 255）則判定為黑圖，觸發重拍流程。

#### Scenario: 正常照片不觸發重拍
- **WHEN** `drawImage` 後取樣平均亮度 ≥ 8
- **THEN** 系統 SHALL 繼續執行正常的 `toBlob` → 上傳流程，不重拍

#### Scenario: 黑圖觸發重拍
- **WHEN** `drawImage` 後取樣平均亮度 < 8
- **THEN** 系統 SHALL 等待 500ms 後重新執行 `drawImage` 並再次取樣，最多重拍 3 次

#### Scenario: 重拍後成功取得正常照片
- **WHEN** 第 2 次重拍後平均亮度 ≥ 8
- **THEN** 系統 SHALL 使用該次 canvas 內容繼續執行 `toBlob` → 上傳流程

#### Scenario: 3 次重拍仍為黑圖則跳過
- **WHEN** 連續 3 次重拍（含原始拍照共 4 次嘗試）平均亮度均 < 8
- **THEN** 系統 SHALL 跳過本次觸發，不上傳任何圖片，並寫入 error log（`source: 'camera:black-frame'`），最後將 `status` 重設為 `'idle'`

### Requirement: Stream 暖機保護
相機串流（`getUserMedia`）成功啟動後，系統 SHALL 記錄啟動時間戳記 `streamReadyAt`。`shoot()` 函式執行時，若距 `streamReadyAt` 未滿 `WARMUP_MS`（1500 毫秒），SHALL 等待剩餘時間後再執行 `drawImage`，確保 sensor 已完成曝光初始化。

#### Scenario: 相機啟動後立即收到觸發
- **WHEN** `getUserMedia` 剛 resolve（`streamReadyAt` 剛設定），倒數結束後立即呼叫 `shoot()`，距啟動未滿 1500ms
- **THEN** `shoot()` SHALL 等待至距 `streamReadyAt` 滿 1500ms 後再執行 `drawImage`

#### Scenario: 相機已暖機完成
- **WHEN** `getUserMedia` resolve 後超過 1500ms，倒數結束呼叫 `shoot()`
- **THEN** `shoot()` SHALL 不額外等待，直接執行 `drawImage`

#### Scenario: streamReadyAt 尚未設定（stream 未就緒）
- **WHEN** `shoot()` 在 `getUserMedia` resolve 之前被呼叫（例如快速收到觸發）
- **THEN** `shoot()` SHALL 直接返回（不執行拍照），等同現有 `!video` guard 的行為
