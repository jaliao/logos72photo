## Why

Image Service Worker 已部署且設定正確，但縮圖採用 lazy 產生策略（按需 WASM resize），活動當天第一批訪客每張照片都是 cold miss，造成明顯延遲。透過三項改善可大幅減少首屏等待時間。

## What Changes

- **上傳時預產縮圖**：`generateCover` Cloud Function（`photos/{docId}` onCreate）合成封面後，額外呼叫 Image Service 預 warm 640w/80q 與 1280w/85q 縮圖，強制 L2 快取寫入，讓訪客首次開啟即命中快取
- **封面 flag 存 Firestore**：封面合成成功後，於 Firestore `slotGroups/{slotGroup}` 文件寫入 `{ hasCover: true }`；`app/album/[slotGroup]/page.tsx` 改為讀取此 flag 取代每次 HEAD request
- **Grid 首圖 `priority`**：`AlbumPhotoViewer` grid 模式的第一張圖（index 0）加上 `priority` prop，讓瀏覽器優先載入首屏圖片

## Capabilities

### New Capabilities
無

### Modified Capabilities
- `image-service`：新增預熱規格（Cloud Function 呼叫 Image Service 預產縮圖）
- `slot-group-album`：封面存在狀態改由 Firestore flag 判斷，移除 HEAD request

## Impact

- `functions/src/generateCover.ts`：上傳封面後呼叫 Image Service × 2（640/1280），並寫入 Firestore `slotGroups/{slotGroup}`
- `lib/firebase-rest.ts`：新增 `getSlotGroupDoc()` 讀取 `slotGroups/{slotGroup}` 文件
- `app/album/[slotGroup]/page.tsx`：改用 Firestore flag 判斷封面，移除 `fetch(coverUrl, { method: 'HEAD' })`
- `app/components/AlbumPhotoViewer.tsx`：grid 首圖加 `priority`
- Firestore：新增 `slotGroups` collection
