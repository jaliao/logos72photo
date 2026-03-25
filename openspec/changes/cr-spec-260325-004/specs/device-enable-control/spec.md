## ADDED Requirements

### Requirement: 裝置啟用狀態資料模型
系統 SHALL 在 Firestore `devices/{device_id}` 文件中儲存裝置啟用狀態，欄位 `enabled: boolean`。文件不存在時 SHALL 視為 `enabled: true`（向下相容，不破壞現有裝置）。已知裝置 ID 為 `iphone-1` 與 `iphone-2`。

#### Scenario: 文件存在且 enabled=false
- **WHEN** Firestore `devices/iphone-1` 文件存在且 `enabled: false`
- **THEN** 系統 SHALL 視 iphone-1 為停用狀態

#### Scenario: 文件不存在
- **WHEN** Firestore `devices/iphone-1` 文件不存在
- **THEN** 系統 SHALL 視 iphone-1 為啟用狀態（fail open）

### Requirement: 後台裝置管理 API
系統 SHALL 提供 `GET /api/admin/devices` 回傳所有已知裝置的啟用狀態清單；提供 `PATCH /api/admin/devices/[deviceId]` 切換指定裝置的啟用狀態。兩支 API 均須持有有效 `admin_session` cookie，否則回傳 `401`。

#### Scenario: GET 列出裝置清單
- **WHEN** 已登入管理員呼叫 `GET /api/admin/devices`
- **THEN** API SHALL 回傳 `[{ device_id, enabled }]` 陣列，列出 `iphone-1` 與 `iphone-2` 的啟用狀態

#### Scenario: PATCH 停用裝置
- **WHEN** 已登入管理員呼叫 `PATCH /api/admin/devices/iphone-1`，body 為 `{ enabled: false }`
- **THEN** API SHALL 更新 Firestore `devices/iphone-1.enabled = false` 並回傳 `200`

#### Scenario: PATCH 啟用裝置
- **WHEN** 已登入管理員呼叫 `PATCH /api/admin/devices/iphone-1`，body 為 `{ enabled: true }`
- **THEN** API SHALL 更新 Firestore `devices/iphone-1.enabled = true` 並回傳 `200`

#### Scenario: 未登入者呼叫 API
- **WHEN** 未持有有效 `admin_session` cookie 的請求呼叫 `GET /api/admin/devices`
- **THEN** API SHALL 回傳 `401 Unauthorized`

### Requirement: 後台裝置管理頁面
系統 SHALL 在 `/admin/devices` 提供裝置管理頁面，列出已知裝置及其啟用狀態，管理員可透過切換按鈕啟用或停用各裝置。頁面需持有有效 `admin_session` cookie 方可存取。

#### Scenario: 顯示裝置啟用狀態
- **WHEN** 已登入管理員進入 `/admin/devices`
- **THEN** 頁面 SHALL 顯示 `iphone-1` 與 `iphone-2` 各自的啟用/停用狀態

#### Scenario: 切換裝置至停用
- **WHEN** 管理員點擊 `iphone-1` 的停用按鈕
- **THEN** 頁面 SHALL 呼叫 `PATCH /api/admin/devices/iphone-1`（`enabled: false`），並即時更新 UI 顯示為停用

#### Scenario: 切換裝置至啟用
- **WHEN** 管理員點擊停用裝置的啟用按鈕
- **THEN** 頁面 SHALL 呼叫 `PATCH /api/admin/devices/{deviceId}`（`enabled: true`），並即時更新 UI 顯示為啟用

### Requirement: 相機頁面裝置下線顯示
相機頁面（`/camera1`、`/camera2`）的 Server Component SHALL 在頁面載入時從 Firestore 讀取裝置啟用狀態，並將 `initialEnabled` prop 傳入 Client Component。若 `initialEnabled === false`，Client Component SHALL 顯示裝置下線訊息，且 MUST NOT 啟動相機串流、RTDB 監聽或心跳。

#### Scenario: 停用裝置開啟相機頁面
- **WHEN** `iphone-1` 為停用狀態，用戶開啟 `/camera1`
- **THEN** 頁面 SHALL 顯示「裝置已下線，請聯繫管理員」訊息，相機串流 MUST NOT 啟動

#### Scenario: 啟用裝置開啟相機頁面
- **WHEN** `iphone-1` 為啟用狀態，用戶開啟 `/camera1`
- **THEN** 頁面 SHALL 正常進入相機模式（standalone 檢查邏輯維持不變）

#### Scenario: Firestore 讀取失敗時 fail open
- **WHEN** Server Component 讀取 `devices/iphone-1` 發生網路錯誤或逾時
- **THEN** `initialEnabled` SHALL 預設為 `true`，頁面正常啟動相機
