## Why

個人相簿的封面照片（`covers/{slotGroup}.jpg`）目前展開後只能下載，無法刪除。訪客若不同意封面照片用於行銷，需要一致的刪除管道。

## What Changes

- 新增 `DELETE /api/album/cover` API：驗證 `album_session`，刪除 R2 `covers/{slotGroup}.jpg`
- `AlbumPhotoViewer` 封面展開時加入「刪除」按鈕（同一般照片樣式）
- 刪除成功後封面從列表移除（本地 state），不重新查詢

**Non-goals：**
- 不重建封面（刪除後不自動補回）
- 不刪除 Firestore 任何資料
- 不影響其他時段的封面

## Capabilities

### New Capabilities
- `album-cover-delete`：訪客刪除自己時段封面的 API，受 `album_session` 保護，操作對象為 R2 物件

### Modified Capabilities
- `album-photo-viewer`：封面展開模式新增刪除按鈕（原本僅有下載）

## Impact

- 新增 `app/api/album/cover/route.ts`（DELETE）
- 修改 `app/components/AlbumPhotoViewer.tsx`：封面展開模式加入刪除按鈕與對應邏輯
- 需要 R2 刪除權限（`lib/r2.ts` 已有 `deleteR2ObjectsByPrefix`，確認可用或新增單一物件刪除）
