### Requirement: 錯誤日誌寫入 Firestore
系統 SHALL 提供 Firestore `error_logs` 集合儲存錯誤記錄，每筆文件 SHALL 包含以下欄位：
- `device_id`（string）：裝置識別碼
- `source`（string）：錯誤來源（例：`camera-client`、`upload-api`）
- `message`（string）：錯誤描述
- `timestamp`（Timestamp）：錯誤發生的 UTC 時間
- `date`（string）：台灣時間日期，格式 `YYYY-MM-DD`，用於依日期查詢
- `expires_at`（Timestamp）：`timestamp + 7 天`，作為 Firestore TTL 欄位

#### Scenario: 寫入錯誤日誌
- **WHEN** server 端呼叫錯誤日誌寫入函式並傳入 source 與 message
- **THEN** Firestore `error_logs` 集合 SHALL 新增一筆文件，包含所有必要欄位，`expires_at` 為寫入時間加 7 天

#### Scenario: TTL 到期自動刪除
- **WHEN** Firestore TTL policy 設定於 `expires_at` 欄位，且文件 `expires_at` 已過期
- **THEN** Firestore SHALL 自動刪除該文件（可能延遲數小時，屬預期行為）

### Requirement: Client 端錯誤回報 API
系統 SHALL 提供 Edge Runtime Route Handler `POST /api/log-error`，接收 JSON body `{ device_id, source, message }`，驗證必要欄位後透過 Admin SDK 寫入 Firestore `error_logs`。

#### Scenario: 正常寫入錯誤日誌
- **WHEN** client 以 `POST /api/log-error` 傳入合法 JSON body
- **THEN** API SHALL 回傳 `200 OK`，並在 Firestore `error_logs` 新增對應文件

#### Scenario: 缺少必要欄位
- **WHEN** client 傳入的 body 缺少 `source` 或 `message`
- **THEN** API SHALL 回傳 `400 Bad Request`，不寫入 Firestore

### Requirement: `logError` Client 端 Helper
系統 SHALL 提供 `logError(source: string, message: string): void` 函式，以 fire-and-forget 方式呼叫 `POST /api/log-error`，不 await、不拋出例外。

#### Scenario: 送出錯誤日誌不阻塞主流程
- **WHEN** client 呼叫 `logError(source, message)`
- **THEN** 函式 SHALL 立即返回，不等待 API 回應，主流程 SHALL 繼續執行

#### Scenario: API 呼叫失敗時靜默忽略
- **WHEN** `/api/log-error` 回傳錯誤或網路中斷
- **THEN** `logError` SHALL 靜默忽略例外，不影響呼叫端執行

### Requirement: 後台錯誤查閱頁面
系統 SHALL 提供 `/admin/errors` 頁面，依日期（台灣時間）列出 `error_logs` 記錄，每筆顯示：時間（台灣時間 HH:MM:SS）、裝置 ID、來源、訊息。頁面 SHALL 提供日期選擇器，預設值為今日（台灣時間）。

#### Scenario: 預設顯示今日錯誤
- **WHEN** 管理員進入 `/admin/errors`，未選擇日期
- **THEN** 頁面 SHALL 顯示台灣時間今日的所有錯誤記錄，依 `timestamp` 遞減排序

#### Scenario: 切換日期查詢
- **WHEN** 管理員選擇特定日期
- **THEN** 頁面 SHALL 顯示該日期（台灣時間）的所有錯誤記錄

#### Scenario: 無錯誤記錄
- **WHEN** 所選日期無任何錯誤記錄
- **THEN** 頁面 SHALL 顯示「該日期無錯誤記錄」提示文字
