## Why

不間斷讀經活動全程連續拍照，每個小時區間必然有照片，因此時段列表頁（`/gallery/[date]/[slot]`）目前的「有/無照片」雙狀態格子視覺設計已無意義。統一改為黑色方塊並顯示張數，讓訪客一眼掌握每個小時的拍照量。

## What Changes

- 時段列表頁的小時格：全部改為深色（黑色）方塊，移除「有照片/無照片」的視覺區分
- 每個小時格下方新增照片張數標示（例：「12 張」）
- 照片張數從 `photo_index/{date}` 的 `hours` 欄位讀取（已有此資料）

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `photo-retrieval-ui`：時段列表頁小時格視覺規格變更（統一深色 + 張數標示）

## Impact

- `app/gallery/[date]/[slot]/page.tsx`：小時格渲染邏輯與樣式更新
- `openspec/specs/photo-retrieval-ui/spec.md`：時段列表頁相關 scenario 更新

## Non-goals

- 不修改首頁日期卡片的時段格（slot_8h 三格）外觀
- 不修改照片預覽頁（`/gallery/[date]/[slot]/[album]`）
- 不新增點擊行為，路由邏輯維持不變
