## 1. 型別與工具函式

- [x] 1.1 在 `lib/types.ts` 的 `PhotoDoc` 介面新增 `slot_group: string` 欄位（8 碼，如 `"03130103"`）
- [x] 1.2 在 `lib/types.ts` 新增 `getSlotGroup(dateStr: string, slot15m: number): string` 工具函式，依 `dateStr` + `slot_15m` 計算並回傳 `slotGroup`

## 2. 上傳 API 寫入 slotGroup

- [x] 2.1 在 `app/api/upload/route.ts` 呼叫 `getSlotGroup(dateStr, slot_15m)` 計算 `slotGroup`
- [x] 2.2 將 `slot_group` 欄位加入 `photoDoc` 物件並寫入 Firestore `photos` 集合

## 3. Firestore 複合索引

- [x] 3.1 在 `firestore.indexes.json` 新增複合索引：collection `photos`，欄位 `slot_group ASC` + `timestamp ASC`

## 4. 照片查詢函式

- [x] 4.1 在 `lib/firebase-rest.ts`（或適當的 lib 檔）新增 `getPhotosBySlotGroup(slotGroup: string): Promise<PhotoDoc[]>` 函式，驗證格式（`/^\d{8}$/`）並查詢 Firestore

## 5. 個人時段相簿頁面

- [x] 5.1 建立路由 `app/album/[slotGroup]/page.tsx`（Server Component），格式驗證不符時呼叫 `notFound()`
- [x] 5.2 在頁面呼叫 `getPhotosBySlotGroup(slotGroup)` 取得照片列表
- [x] 5.3 頁面標題顯示分組號碼（如「時段 03130101」）與時段時間說明（如「03/13 01:00–01:14」）
- [x] 5.4 實作照片縮圖 grid：`aspect-[3/4]`、手機單欄（預設）、桌面雙欄（`sm:grid-cols-2`）
- [x] 5.5 整合現有 Lightbox 元件，點擊縮圖開啟全螢幕瀏覽與左右切換
- [x] 5.6 無照片時顯示「此時段尚無照片」空狀態提示
