## Context

`/api/upload` 目前接收相機裝置上傳的 JPEG 後，直接存入 Cloudflare R2 並寫入 Firestore。
實際觀察到黑圖（全黑、曝光失敗）偶發性進入儲存層，這類壞圖通常 byte 大小遠小於正常照片。
需在最早可取得檔案大小的時間點加入守衛，阻止壞圖污染後續流程。

## Goals / Non-Goals

**Goals:**
- 在存入 R2 之前，依檔案大小篩掉壞圖
- 被拒絕的上傳留下可查詢的 `error_logs` 紀錄
- 不影響正常上傳的任何流程

**Non-Goals:**
- 不分析圖片內容（像素、色彩、EXIF）
- 不拒絕 300K 以上的損壞圖（超出本次範疇）
- 不修改 client 端行為

## Decisions

### 1. 攔截點：`arrayBuffer()` 之後、`uploadToR2()` 之前

`photo.arrayBuffer()` 回傳的 `ArrayBuffer` 的 `byteLength` 是最直接取得實際 byte 大小的方式。
此時 `body = new Uint8Array(arrayBuffer)` 已備妥，用 `body.byteLength` 即可，零額外 I/O。

**替代方案：** `photo.size`（`File` 物件屬性）——但在 Edge Runtime 上，`File.size` 反映的是 multipart 宣告值，不是實際解碼後的 byte 數；`body.byteLength` 較為可靠。

### 2. 閾值：300,000 bytes（約 293 KiB）

與業主討論確認，正常 JPEG 拍攝至少 500K 以上；300K 作為安全邊界，涵蓋黑圖、截圖、測試圖等異常案例。
閾值定義為具名常數 `MIN_PHOTO_BYTES = 300_000`，集中於檔案頂部，方便日後調整。

### 3. 拒絕行為：400 + 寫 error_logs，不寫 R2、不寫 Firestore

與現有裝置停用邏輯（回傳 403）保持一致的 fail-fast 模式。
`error_logs` 使用已有的 `writeErrorLog()` helper，`source` 設為 `"upload-size-guard"`，`message` 含實際 `byteLength`。

## Risks / Trade-offs

- **誤拒正常圖** → 閾值 300K 已保守設定，實際觀察值遠高於此；如有邊界案例可調整常數
- **`body.byteLength` vs `photo.size`** → 若 multipart 解碼行為在未來 runtime 版本有異，需重新驗證

## Migration Plan

1. 在 `route.ts` 新增常數與 size check
2. 部署後觀察 `error_logs` 中 `source: "upload-size-guard"` 的紀錄確認攔截正常運作
3. 無 rollback 需要（攔截邏輯移除即可回到原本行為）

## Open Questions

- 無
