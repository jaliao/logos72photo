### Requirement: 本地定時拍照
裝置 SHALL 依本地時鐘每 5 分鐘整點（HH:00、HH:05、HH:10 … HH:55）自動進入倒數並拍照，不依賴任何外部推送訊號。頁面載入後 SHALL 立即計算距下一個整 5 分鐘的剩餘毫秒數並排程；若距整點不足 2 秒則跳過此輪，排程下一個整點。每次拍照完成後 SHALL 重新計算並排程下一次，以維持對齊牆鐘。

#### Scenario: 頁面載入後自動排程
- **WHEN** 使用者開啟相機頁面
- **THEN** 系統 SHALL 在 500ms 內計算下一個整 5 分鐘時刻，並排程倒數觸發

#### Scenario: 整 5 分鐘時刻自動拍照
- **WHEN** 裝置本地時間到達 HH:00、HH:05 … HH:55 任一整點
- **THEN** 系統 SHALL 進入倒數狀態（`status: 'countdown'`），倒數結束後執行拍照

#### Scenario: 距整點不足 2 秒時跳過
- **WHEN** 頁面載入時距下一個整 5 分鐘時刻不足 2000ms
- **THEN** 系統 SHALL 跳過此輪，改排程下一個整 5 分鐘時刻

#### Scenario: 拍照完成後重新排程
- **WHEN** 一次拍照及上傳流程完成，`status` 回到 `'idle'`
- **THEN** 系統 SHALL 自動計算並排程下一個整 5 分鐘時刻，無需使用者操作

#### Scenario: RTDB 不可用時仍正常拍照
- **WHEN** Firebase RTDB 連線失敗或超時
- **THEN** 定時器 SHALL 繼續正常觸發拍照，不受 RTDB 狀態影響

#### Scenario: 上傳中不重複觸發
- **WHEN** 整 5 分鐘時刻到達，但 `status` 不為 `'idle'`（如 `'uploading'`）
- **THEN** 系統 SHALL NOT 啟動新的倒數或拍照，等待下一個排程時刻
