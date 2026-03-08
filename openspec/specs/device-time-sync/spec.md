### Requirement: 伺服器時間同步發布
伺服器 SHALL 每 10 分鐘透過 `/api/trigger` 將當前 Unix 時間戳記（毫秒）寫入 Firebase RTDB `sync/server_time` 節點，供裝置計算時差。寫入 SHALL 以匿名方式（不含 Authorization header）呼叫 RTDB REST API，安全性由 `x-trigger-secret` header 保障。

#### Scenario: 定期寫入成功
- **WHEN** `/api/trigger` 收到合法的 `x-trigger-secret`
- **THEN** 系統 SHALL 將 `Date.now()` 寫入 `sync/server_time`，並回傳 HTTP 200

#### Scenario: 匿名寫入不含 OAuth2 token
- **WHEN** `rtdbSet('sync/server_time', timestamp)` 被呼叫
- **THEN** 請求 SHALL NOT 包含 `Authorization: Bearer` header，避免 Firebase Security Rules 拒絕

### Requirement: 裝置時差顯示
裝置 SHALL 監聽 RTDB `sync/server_time` 節點；收到新值後，計算 `serverTime - deviceTime`（毫秒）並顯示於相機頁面狀態列，供現場人員確認裝置時間是否偏差。顯示格式為 `+Xms` 或 `-Xms`；尚未收到資料時顯示 `—`。

#### Scenario: 收到同步資料後顯示時差
- **WHEN** RTDB `sync/server_time` 更新，裝置收到新的伺服器時間戳記
- **THEN** 狀態列「時差」欄位 SHALL 立即更新為 `serverTime - Date.now()` 的毫秒數值（帶正負號）

#### Scenario: 尚未收到同步資料時顯示預設值
- **WHEN** 頁面載入後尚未收到任何 `sync/server_time` 更新
- **THEN** 狀態列「時差」欄位 SHALL 顯示 `—`

#### Scenario: RTDB 不可用時不影響拍照
- **WHEN** Firebase RTDB 連線失敗，裝置無法接收 `sync/server_time`
- **THEN** 狀態列「時差」欄位 SHALL 保持上次已知值或 `—`，拍照定時器 SHALL 繼續正常運作
