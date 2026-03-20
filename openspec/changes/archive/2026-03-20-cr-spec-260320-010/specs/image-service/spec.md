## ADDED Requirements

### Requirement: 上傳時預熱縮圖
`generateCover` Cloud Function 於封面合成並上傳 R2 成功後，SHALL 以 fire-and-forget 方式呼叫 Image Service 預熱該時段首張照片的 640w/80q 與 1280w/85q 縮圖，強制觸發 L2 快取寫入。`IMAGE_SERVICE_URL` 透過 Cloud Function 環境變數注入。

#### Scenario: 封面上傳成功後觸發縮圖預熱
- **WHEN** `generateCover` 成功將封面上傳至 R2
- **THEN** 系統 SHALL 呼叫 `{IMAGE_SERVICE_URL}/resizing/640/80/{r2_key}` 及 `{IMAGE_SERVICE_URL}/resizing/1280/85/{r2_key}`（Promise.all，fire-and-forget）

#### Scenario: 預熱失敗不影響主流程
- **WHEN** Image Service 呼叫失敗或 timeout
- **THEN** `generateCover` SHALL 記錄 warning 但不拋出例外，封面合成結果不受影響

#### Scenario: r2_key 推導正確
- **WHEN** 照片 `r2_url` 為 `{R2_PUBLIC_URL}/{date}/{filename}`
- **THEN** 預熱使用的 `r2_key` SHALL 為 `{date}/{filename}`（去除 `R2_PUBLIC_URL/` 前綴）
