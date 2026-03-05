## MODIFIED Requirements

### Requirement: 狀態列目前時間顯示
狀態列 SHALL 顯示裝置當前的本地時間，格式為**上午/下午 H:MM:SS**（12 時制），每秒自動更新，供現場人員確認裝置時間。時間格式化 SHALL 使用手動計算方式：`hours % 12 || 12` 取得 12 時制小時數，並根據 `hours < 12` 決定「上午」或「下午」前綴，確保跨裝置輸出一致。

#### Scenario: 狀態列顯示即時時間（12 時制）
- **WHEN** 相機頁面處於任意狀態（idle、countdown、shooting、uploading）
- **THEN** 狀態列「現在時間」欄位 SHALL 每秒更新為裝置本地時間，格式為「上午/下午 H:MM:SS」（例：「上午 9:05:30」、「下午 12:00:00」）

#### Scenario: 午夜 12 點顯示正確
- **WHEN** 裝置本地時間為 00:xx:xx
- **THEN** 狀態列 SHALL 顯示「上午 12:xx:xx」

#### Scenario: 正午 12 點顯示正確
- **WHEN** 裝置本地時間為 12:xx:xx
- **THEN** 狀態列 SHALL 顯示「下午 12:xx:xx」

### Requirement: 相機頁面顯示 RTDB 觸發時間戳記
相機頁面狀態列 SHALL 顯示最後一次從 Firebase RTDB 收到的 `trigger/last_shot` 原始時間，格式為**上午/下午 H:MM:SS**（12 時制），供現場人員判斷觸發信號是否正常抵達。

#### Scenario: 正常接收觸發後顯示時間（12 時制）
- **WHEN** RTDB `trigger/last_shot` 更新，iPhone 相機頁面收到通知
- **THEN** 狀態列中「RTDB 觸發：」欄位 SHALL 立即更新為該觸發的本地時間，格式為「上午/下午 H:MM:SS」

#### Scenario: 尚未收到任何觸發時顯示預設值
- **WHEN** 頁面載入後尚未收到任何 RTDB 觸發
- **THEN** 狀態列「RTDB 觸發：」欄位 SHALL 顯示「—」

## ADDED Requirements

### Requirement: 拍照觸發排程提早 60 秒
伺服器端 cron job SHALL 在每 5 分鐘週期的第 **−60 秒**（即第 4 分整）送出觸發，而非整點第 0 秒。例：原 12:00:00、12:05:00 送出觸發，改為 11:59:00、12:04:00 送出觸發。cron 表達式 SHALL 調整為 `0 4,9,14,19,24,29,34,39,44,49,54,59 * * *`（每小時於第 4、9、14… 分觸發）或等效設定。

#### Scenario: 觸發時間在每 5 分鐘週期提早 60 秒送出
- **WHEN** 系統時間到達每 5 分鐘週期的第 4 分 0 秒（xx:04:00、xx:09:00 等）
- **THEN** cron job SHALL 呼叫 `/api/trigger`，送出 RTDB `trigger/last_shot` 更新

#### Scenario: 倒數 10 秒後拍照時間接近原整點
- **WHEN** 觸發在 xx:04:00 送出，iPhone 收到後進入 10 秒倒數
- **THEN** 實際拍照（`shoot()` 執行）時間 SHALL 約為 xx:04:10
