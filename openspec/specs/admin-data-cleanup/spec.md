### Requirement: 測試資料批次清除 API
系統 SHALL 提供 `POST /api/admin/purge-date` API route，接受 `date`（`YYYY-MM-DD`）與 `targets`（清除目標陣列），依指定目標清除 R2 原圖、Firestore 文件或裝置欄位。端點 SHALL 以 `x-admin-secret` header 驗證授權，未通過驗證 SHALL 回傳 HTTP 401。各目標清除獨立執行，單一目標失敗不阻斷其他目標。

#### Scenario: 未授權請求被拒絕
- **WHEN** 請求未帶 `x-admin-secret` header 或 secret 不符
- **THEN** API SHALL 回傳 HTTP 401，body 為 `{ "error": "未授權" }`

#### Scenario: 清除指定日期 R2 原圖
- **WHEN** `targets` 包含 `"r2"`，且 R2 中有 `{date}/` 前綴的物件
- **THEN** API SHALL 刪除該前綴下所有物件，並在回應中回報刪除筆數

#### Scenario: 清除 Firestore photos 文件
- **WHEN** `targets` 包含 `"photos"`，且 Firestore `photos` 集合中有 `date == YYYY-MM-DD` 的文件
- **THEN** API SHALL 刪除所有符合條件的文件，並回報刪除筆數

#### Scenario: 清除 photo_index 文件
- **WHEN** `targets` 包含 `"photo_index"`
- **THEN** API SHALL 刪除 `photo_index/{date}` 文件（文件不存在時視為成功）

#### Scenario: 清除 error_logs 文件
- **WHEN** `targets` 包含 `"error_logs"`，且 Firestore `error_logs` 集合中有 `date == YYYY-MM-DD` 的文件
- **THEN** API SHALL 刪除所有符合條件的文件，並回報刪除筆數

#### Scenario: 清除 devices 裝置照片欄位
- **WHEN** `targets` 包含 `"devices"`
- **THEN** API SHALL 將所有 `devices/{deviceId}` 文件的 `last_photo_url`、`last_shot_at` 欄位設為 null（PATCH 覆寫），並回報更新裝置數

#### Scenario: 部分目標失敗不中斷整體流程
- **WHEN** 某一目標（例如 `r2`）清除時發生錯誤
- **THEN** API SHALL 繼續執行其他目標，最終回傳各目標的個別結果（成功筆數或錯誤訊息），整體 HTTP status 為 200

### Requirement: 後台測試資料清除管理頁
系統 SHALL 在 `/admin/data-cleanup` 提供管理頁面，供管理員選擇日期與清除目標後執行批次清除，並顯示清除結果摘要。頁面 SHALL 在執行前要求確認，防止誤刪。

#### Scenario: 顯示日期選擇器與目標勾選
- **WHEN** 管理員進入 `/admin/data-cleanup`
- **THEN** 頁面 SHALL 顯示日期輸入欄（預設今日台灣時間）與五個目標勾選框（R2、photos、photo_index、error_logs、devices）

#### Scenario: 執行前確認
- **WHEN** 管理員點擊「執行清除」按鈕
- **THEN** 頁面 SHALL 顯示確認提示（含日期與目標清單），管理員確認後才送出 API 請求

#### Scenario: 執行中狀態顯示
- **WHEN** API 請求進行中
- **THEN** 頁面 SHALL 顯示載入指示，並禁用按鈕防止重複送出

#### Scenario: 顯示清除結果摘要
- **WHEN** API 回應成功
- **THEN** 頁面 SHALL 逐項顯示各目標的清除結果（刪除筆數或錯誤訊息）

#### Scenario: API 錯誤處理
- **WHEN** API 回傳非 200 狀態碼
- **THEN** 頁面 SHALL 顯示錯誤訊息，不清空已填入的日期與目標選擇
