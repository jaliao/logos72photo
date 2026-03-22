## Why

個人相簿頁（`/album/[slotGroup]`）目前只顯示該時段的拍照清單，沒有封面展示。封面合成功能（cr-spec-260309-002）已將每個 slotGroup 的封面存入 R2 `covers/{slotGroup}.jpg`，應在相簿頁面將封面置於照片列表的第一個位置，作為視覺亮點。

## What Changes

- `app/album/[slotGroup]/page.tsx`：照片列表前方加入封面圖（`covers/{slotGroup}.jpg`），固定顯示在第一格，樣式與其他照片格一致

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `slot-group-album`：個人相簿照片列表需在第一格顯示 slotGroup 封面圖

## Impact

- **修改：** `app/album/[slotGroup]/page.tsx`
- **依賴：** R2 `covers/{slotGroup}.jpg`（由 cr-spec-260309-002 產生）
- **不影響：** Firestore 查詢、幻燈片邏輯、其他頁面

## Non-goals

- 不修改封面合成邏輯
- 封面圖不加入 Firestore `photos` collection（不影響計數與查詢）
- 封面圖不支援下載或分享（僅展示）
- 若 `covers/{slotGroup}.jpg` 不存在，靜默跳過，不顯示空格
