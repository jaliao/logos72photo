## 1. 修改上傳 API

- [x] 1.1 在 `app/api/upload/route.ts` 頂部新增常數 `MIN_PHOTO_BYTES = 300_000`
- [x] 1.2 在 `arrayBuffer()` 讀取完、建立 `body` 後，加入 size check：若 `body.byteLength < MIN_PHOTO_BYTES` 則呼叫 `writeErrorLog()` 並 return HTTP 400
- [x] 1.3 確認 `writeErrorLog()` 呼叫時 `source` 為 `"upload-size-guard"`，`message` 包含實際 `byteLength` 數值

## 2. 驗證與測試

- [ ] 2.1 本機以 < 300K 的檔案手動 POST `/api/upload`，確認回傳 400 且 R2 無新物件
- [ ] 2.2 本機以 >= 300K 的正常照片 POST，確認上傳成功
- [ ] 2.3 確認 Firestore `error_logs` 中出現 `source: "upload-size-guard"` 的紀錄
