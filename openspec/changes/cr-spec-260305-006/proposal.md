## Why

相簿首頁的 `queryDatesWithSlots()` 每次頁面載入都對 `photos` 集合執行全表掃描（limit: 2000），以取得 `date` 與 `slot_8h` 欄位組合。每張照片算一次讀取，導致 Firestore 免費配額（50,000 reads/day）快速耗盡（目前已達 99%），造成 429 RESOURCE_EXHAUSTED 錯誤。

## What Changes

- **新增 `photo_index` 集合**：以 `{date}` 為 document ID，儲存 `slots`（有照片的 slot_8h 陣列）與 `hours`（各 slot_8h 下有照片的 hourMin 陣列），作為反正規化索引
- **`/api/upload` 更新索引**：每次上傳照片後，以 PATCH merge 方式更新對應日期的 `photo_index` 文件
- **`queryDatesWithSlots()` 改讀索引**：從掃描 photos（最多 2000 reads）改為讀取 `photo_index` 集合（reads = 日期數，通常 < 30）
- **slot 頁改讀索引**：從查詢所有照片判斷哪些小時有資料，改為讀取 `photo_index/{date}` 單一文件（1 read）

## Capabilities

### New Capabilities
- `photo-index`：`photo_index` Firestore 集合的讀寫規格（結構、寫入時機、查詢介面）

### Modified Capabilities
- `photo-retrieval-ui`：首頁與 slot 頁的資料來源從 `photos` 改為 `photo_index`

## Non-goals

- 不修改 album 頁（照片預覽頁仍讀 `photos` 集合，因需要完整 photo 資料）
- 不導入 Redis 或外部快取
- 不修改相機拍照端邏輯（只改 `/api/upload` 的後處理）

## Impact

- 新增：`lib/firebase-rest.ts` — `queryPhotoIndex()`、`updatePhotoIndex()` 函式
- 修改：`app/api/upload/route.ts` — 上傳成功後呼叫 `updatePhotoIndex()`
- 修改：`app/page.tsx` — 改呼叫 `queryPhotoIndex()` 取代 `queryDatesWithSlots()`
- 修改：`app/gallery/[date]/[slot]/page.tsx` — 改從索引取得哪些小時有照片
- **Firestore 讀取從 O(photos) 降至 O(dates)**，預計減少 99% 以上的首頁讀取量
