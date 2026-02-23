## MODIFIED Requirements

### Requirement: 同步拍照觸發
系統必須利用 Firebase Realtime Database 實現指令同步，每 5 分鐘由伺服器更新時間戳記，觸發所有連接的 iPhone 進行拍照。觸發條件以「RTDB 值遞增」為準，而非比對本地時脈差值，以避免時脈偏差導致遺漏觸發。RTDB 監聽器 SHALL 僅在頁面載入時掛載一次，不隨相機狀態（idle/countdown/shooting/uploading）重建。**相機功能（含 RTDB 監聽）SHALL 在頁面載入後立即啟動，不受 PWA standalone 模式限制**，確保在正式環境（Cloudflare Pages）中可正常運作。伺服器端寫入 `trigger/last_shot` 節點時，`rtdbSet` SHALL 以匿名方式（不附帶 Authorization header）呼叫 RTDB REST API，利用節點的 `.write: true` 公開規則完成寫入；安全性由上游 `/api/trigger` 的 `x-trigger-secret` header 驗證保障。收到觸發後，系統 SHALL 進入倒數流程（`status: 'countdown'`），不直接執行 `shoot()`；`shoot()` 僅在倒數結束後呼叫。guard 條件 SHALL 為 `status !== 'idle'`，涵蓋 `'countdown'`、`'shooting'`、`'uploading'` 狀態。

#### Scenario: 同步觸發後進入倒數
- **WHEN** 伺服器端更新 Firebase 中的 `trigger/last_shot` 為新的時間戳記（數值大於上一次已處理的值），且 `status` 為 `'idle'`
- **THEN** 所有正在運行拍照頁面的 iPhone SHALL 在 1 秒內收到通知並進入倒數狀態（`status: 'countdown'`）

#### Scenario: 頁面載入時不重播舊觸發
- **WHEN** iPhone 相機頁面載入，RTDB `trigger/last_shot` 已存在舊值（早於頁面載入時間）
- **THEN** 系統 SHALL NOT 觸發拍照或倒數（初始基準值設為頁面載入時間，只處理載入後的新觸發）

#### Scenario: 上傳中收到新觸發不遺漏
- **WHEN** iPhone 正在上傳前一張照片期間收到新的 RTDB 觸發信號
- **THEN** 新觸發 SHALL 被記錄為已收到，且在上傳完成後不因監聽器重建而遺失監聽

#### Scenario: rtdbSet 以匿名方式寫入成功
- **WHEN** `/api/trigger` 收到合法的 `x-trigger-secret`，呼叫 `rtdbSet('trigger/last_shot', timestamp)`
- **THEN** `rtdbSet` SHALL 以不含 `Authorization` header 的 HTTP PUT 請求寫入 RTDB，並回傳 HTTP 200

#### Scenario: rtdbSet 不使用 OAuth2 token
- **WHEN** `rtdbSet` 被呼叫
- **THEN** 請求 SHALL NOT 包含 `Authorization: Bearer` header 或 `?access_token=` query string，避免 Firebase 以 OAuth2 身分套用 Security Rules 造成 401

#### Scenario: Safari 直接開啟相機頁面可正常拍照
- **WHEN** 用戶在 Safari 瀏覽器（非 standalone 模式）開啟 `/camera1` 或 `/camera2`
- **THEN** 頁面 SHALL 正常啟動相機串流與 RTDB 監聽，收到觸發後進入倒數並拍照

## ADDED Requirements

### Requirement: 狀態列目前時間顯示
狀態列 SHALL 顯示裝置當前的本地時間（格式 HH:MM:SS），每秒自動更新，供現場人員確認裝置時間。

#### Scenario: 狀態列顯示即時時間
- **WHEN** 相機頁面處於任意狀態（idle、countdown、shooting、uploading）
- **THEN** 狀態列「現在時間」欄位 SHALL 每秒更新為裝置本地時間（HH:MM:SS 格式）

### Requirement: 心跳在線狀態指示
相機頁面狀態列 SHALL 以綠色指示點顯示裝置在線狀態，判斷依據為 `lastHeartbeat` 時間戳記。若距上次心跳未超過 30 秒（2 倍心跳間隔），SHALL 顯示為在線（綠色）；否則顯示為離線（灰色或紅色）。

#### Scenario: 心跳正常時顯示綠色
- **WHEN** `lastHeartbeat` 時間戳記距當前時間在 30 秒以內
- **THEN** 狀態列心跳指示點 SHALL 顯示綠色

#### Scenario: 心跳逾時時顯示離線
- **WHEN** `lastHeartbeat` 時間戳記距當前時間超過 30 秒
- **THEN** 狀態列心跳指示點 SHALL 顯示灰色或紅色，代表裝置可能離線
