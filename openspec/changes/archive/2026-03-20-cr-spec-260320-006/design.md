## Context

封面照片存於 R2 `covers/{slotGroup}.jpg`，與 Firestore `photos` 集合無關。現有 `lib/r2.ts` 提供批次刪除（`deleteR2ObjectsByPrefix`）但無單一物件刪除函式。刪除封面需新增單一物件刪除工具函式，並透過新 API 端點完成。

## Goals / Non-Goals

**Goals:**
- 新增 `deleteR2Object()` 至 `lib/r2.ts`
- 新增 `DELETE /api/album/cover` API：驗證 `album_session`，刪除 R2 `covers/{slotGroup}.jpg`
- `AlbumPhotoViewer` 封面展開模式新增刪除按鈕

**Non-Goals:**
- 不重建封面
- 不刪除 Firestore 資料
- 不影響 `PhotoSlideshow`（後台）

## Decisions

### 決策 1：API 以 `album_session` 推導 key，不接受前端傳入路徑

前端不傳任何參數（或只傳 slotGroup 做驗證用），API 從已驗證的 `album_session` 解碼 `slotGroup`，自行組出 `covers/{slotGroup}.jpg` 刪除，避免任意路徑注入。

**替代方案：** 前端傳 `coverUrl` → 後端解析 key → 刪除。風險高（路徑可偽造），捨棄。

### 決策 2：新增 `deleteR2Object(key)` 至 `lib/r2.ts`

`DeleteObjectsCommand` 支援單一物件，直接傳 `[{ Key: key }]` 即可，無需新增 AWS SDK 依賴。

### 決策 3：刪除成功後前端移除 coverUrl state，不重新 fetch

`AlbumPhotoViewer` 將 `coverUrl` 由 prop 轉為本地 state，刪除成功後設為 `undefined`，返回 grid 模式。

## Risks / Trade-offs

- **R2 刪除不可逆**：封面刪除後無法自動復原；Cloud Function `generateCover` 只在第一張照片上傳時觸發（不會重建）→ 可接受，符合訪客「不同意使用」的需求
- **並發刪除**：極少數情況多個 session 同時刪除同一封面 → R2 DELETE 冪等，不影響結果

## Migration Plan

1. 新增 `deleteR2Object()` 至 `lib/r2.ts`
2. 新增 `app/api/album/cover/route.ts`（DELETE）
3. 修改 `app/components/AlbumPhotoViewer.tsx`：`coverUrl` 轉 state，封面展開加刪除按鈕
