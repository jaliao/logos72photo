## ADDED Requirements

### Requirement: CameraClient 拍照失敗錯誤回報
CameraClient SHALL 在所有 catch 區塊捕捉 `err` 參數，並呼叫 `logError` 將錯誤送至後端，同時不改變現有的使用者介面狀態（仍設回 idle）。

涵蓋三個 catch 點：
1. `blob` 為 null（拍照結果無效）
2. `res.ok` 為 false（上傳回應非 2xx，附帶 HTTP status code）
3. 網路例外（`fetch` 拋出，附帶 `err.message`）

#### Scenario: blob 為 null 時回報錯誤
- **WHEN** 相機拍照後取得的 blob 為 null
- **THEN** CameraClient SHALL 呼叫 `logError('camera-client', 'blob is null')`，並將狀態設回 idle

#### Scenario: 上傳回應非 2xx 時回報錯誤
- **WHEN** `/api/upload` 回傳非 2xx 狀態碼
- **THEN** CameraClient SHALL 呼叫 `logError('camera-client', 'upload failed: <status>')` 其中 `<status>` 為實際 HTTP 狀態碼，並將狀態設回 idle

#### Scenario: 網路例外時回報錯誤
- **WHEN** `fetch` 呼叫拋出網路例外
- **THEN** CameraClient SHALL 呼叫 `logError('camera-client', err.message)`，並將狀態設回 idle
