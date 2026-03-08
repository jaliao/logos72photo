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

### Requirement: 相機頁面顯示 RTDB 同步資訊
相機頁面狀態列 SHALL 顯示裝置與伺服器的時差（格式 `+Xms` / `-Xms`），供現場人員判斷裝置時間是否偏差。時差由監聽 `sync/server_time` 節點計算得出；尚未收到資料時顯示 `—`。

#### Scenario: 收到時間同步後顯示時差
- **WHEN** RTDB `sync/server_time` 更新，裝置收到伺服器時間戳記
- **THEN** 狀態列「時差」欄位 SHALL 立即更新為 `serverTime - Date.now()` 的毫秒數值

#### Scenario: 尚未收到同步資料時顯示預設值
- **WHEN** 頁面載入後尚未收到任何 `sync/server_time` 更新
- **THEN** 狀態列「時差」欄位 SHALL 顯示 `—`

### Requirement: 心跳在線狀態指示
相機頁面狀態列 SHALL 以綠色指示點顯示裝置在線狀態，判斷依據為 `lastHeartbeat` 時間戳記。若距上次心跳未超過 30 秒（2 倍心跳間隔），SHALL 顯示為在線（綠色）；否則顯示為離線（灰色或紅色）。

#### Scenario: 心跳正常時顯示綠色
- **WHEN** `lastHeartbeat` 時間戳記距當前時間在 30 秒以內
- **THEN** 狀態列心跳指示點 SHALL 顯示綠色

#### Scenario: 心跳逾時時顯示離線
- **WHEN** `lastHeartbeat` 時間戳記距當前時間超過 30 秒
- **THEN** 狀態列心跳指示點 SHALL 顯示灰色或紅色，代表裝置可能離線
