## 1. lib/firebase-rest.ts — 新增索引讀寫函式

- [x] 1.1 新增 `PhotoIndexDoc` 型別介面（`slots: number[]`, `hours: Record<string, number[]>`）
- [x] 1.2 實作 `updatePhotoIndex(date, slot8h, hourMin)`：GET 現有文件 → 記憶體合併（Set 去重）→ PATCH 寫回
- [x] 1.3 實作 `queryPhotoIndex()`：讀取 `photo_index` 集合所有文件，回傳 `Array<{ date: string; slots: Set<0 | 8 | 16> }>` 依日期降冪
- [x] 1.4 實作 `getPhotoIndexByDate(date)`：GET `photo_index/{date}` 單一文件，回傳 `hours` map；文件不存在時回傳 `{}`

## 2. app/api/upload/route.ts — 上傳後更新索引

- [x] 2.1 import `updatePhotoIndex` from `@/lib/firebase-rest`
- [x] 2.2 在 `addDoc('photos', ...)` 成功後，fire-and-forget 呼叫 `updatePhotoIndex(dateStr, getSlot8h(taiwanNow), getSlot15m(taiwanNow) 換算為 hourMin)`
- [x] 2.3 `updatePhotoIndex` 失敗時以 `console.error` 記錄，不影響上傳回應

## 3. app/page.tsx — 首頁改讀索引

- [x] 3.1 將 `queryDatesWithSlots()` import 改為 `queryPhotoIndex()`
- [x] 3.2 呼叫 `queryPhotoIndex()` 取代 `queryDatesWithSlots()`

## 4. app/gallery/[date]/[slot]/page.tsx — slot 頁改讀索引

- [x] 4.1 移除 `getAlbumsWithPhotos()`（含 `queryPhotos` 呼叫）
- [x] 4.2 import `getPhotoIndexByDate` from `@/lib/firebase-rest`
- [x] 4.3 呼叫 `getPhotoIndexByDate(date)` 取得 hours map，以 `hours[slot]` 陣列判斷哪些 hourMin 有照片

## 5. 版本與文件更新

- [x] 5.1 `config/version.json` patch +1（0.1.21 → 0.1.22）
- [x] 5.2 更新 `README-AI.md`，反映 v0.1.22 photo_index 索引機制與 Firestore 讀取優化
