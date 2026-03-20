## Why

個人相簿（`/album/[slotGroup]`）的單張照片瀏覽目前為全螢幕黑底 overlay，UI 小、操作不明顯，且保留了「複製分享連結」功能（不適合訪客場景）。需要重新設計為白色圓角卡片樣式（與列表一致），加入清楚的下載與刪除按鈕，並說明照片使用同意政策。

## What Changes

- 新建 `app/components/AlbumPhotoViewer.tsx`：專屬個人相簿的單張照片展開檢視元件，以白色圓角卡片取代全螢幕 overlay
  - 移除分享（clipboard）功能
  - 明顯的「下載」與「刪除」按鈕
  - 說明文字：「本照片可能用於活動行銷，如不同意請點刪除」
  - 白色圓角底圖，無陰影
- 新增 `DELETE /api/album/photos` API：驗證 `album_session`，刪除 Firestore `photos/{docId}` 與 R2 原圖
- `app/album/[slotGroup]/page.tsx`：改用 `AlbumPhotoViewer` 取代 `PhotoSlideshow`
- `app/components/PhotoSlideshow.tsx` **不修改**（管理後台繼續使用）

**Non-goals：**
- 不修改管理後台 gallery 的 `PhotoSlideshow`
- 不實作刪除封面照片的邏輯（封面另一套機制）
- 不做刪除後的封面重建

## Capabilities

### New Capabilities
- `album-photo-viewer`：個人相簿單張照片檢視元件，含下載、刪除、使用同意說明
- `album-photo-delete`：訪客刪除自己照片的 API，受 `album_session` 保護

### Modified Capabilities
- `slot-group-album`：單張照片展開改用新元件，功能行為有變（移除分享、加入刪除）

## Impact

- 新增 `app/components/AlbumPhotoViewer.tsx`
- 新增 `app/api/album/photos/route.ts`（DELETE）
- 修改 `app/album/[slotGroup]/page.tsx`
- `PhotoSlideshow.tsx` 不受影響
