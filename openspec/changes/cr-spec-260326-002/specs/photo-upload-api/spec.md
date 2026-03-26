## ADDED Requirements

### Requirement: 上傳前執行照片大小守衛
`/api/upload` Route Handler SHALL 在 `arrayBuffer()` 讀取完成後、`uploadToR2()` 呼叫之前，執行 `photo-upload-size-guard` 定義的大小檢查。大小守衛失敗時，handler SHALL 立即終止並回傳 400，不繼續執行後續上傳與寫入邏輯。

#### Scenario: 大小守衛失敗時中止後續流程
- **WHEN** 照片 byteLength 小於 `MIN_PHOTO_BYTES`
- **THEN** handler SHALL 在 size check 後立即 return，不呼叫 `uploadToR2()`、`addDoc('photos', ...)`、`updatePhotoIndex()`
