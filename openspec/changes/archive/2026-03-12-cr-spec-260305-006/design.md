## Context

Firestore 免費配額每日 50,000 reads。`queryDatesWithSlots()` 每次首頁載入對 `photos` 集合全表掃描（limit: 2000），造成 reads 快速耗盡。根本原因是用查詢資料集合（photos）來建立導覽索引，而非維護一個專用索引。

## Goals / Non-Goals

**Goals:**
- 新增 `photo_index` 集合作為反正規化索引，消除首頁與 slot 頁的大量 reads
- 首頁讀取量從 O(photos) 降至 O(dates)
- Slot 頁判斷小時索引從 O(照片數) 降至 O(1)

**Non-Goals:**
- 不修改 album 頁（仍需完整 photo 資料）
- 不導入外部快取或 KV 存儲
- 不回填歷史資料（現有照片不會出現在索引中，需重新上傳或手動建立）

## Decisions

### 1. `photo_index/{date}` 文件結構

```
photo_index/{YYYY-MM-DD}:
  slots: [0, 8, 16]           // 有照片的 slot_8h 值（陣列）
  hours: {
    "0":  [0, 60, 120, ...]   // slot_8h=0 下有照片的 hourMin 陣列
    "8":  [480, 540, ...]
    "16": [960, 1020, ...]
  }
```

**理由：** 單一文件即可同時服務首頁（讀 `slots`）與 slot 頁（讀 `hours[slot]`）。首頁讀 N 筆（N = 日期數），slot 頁讀 1 筆。

### 2. `updatePhotoIndex()` 以 arrayUnion 語意更新

Firestore REST API 沒有原生 arrayUnion 操作。實作策略：

1. 先 GET `photo_index/{date}` 讀取現有文件（若不存在則建立空結構）
2. 在記憶體中合併新的 slot 與 hourMin（用 Set 去重）
3. PATCH 寫回完整文件

**成本：** 每次上傳 1 read（GET index）+ 1 write（PATCH index），合理可接受。

**理由：** 避免引入 Firestore Transaction（REST API 實作複雜），且上傳頻率低（每 5 分鐘最多 2 次），競態條件風險極低。

### 3. 首頁讀取改為 `listDocs('photo_index')`

直接使用現有 `listDocs()` 讀取 `photo_index` 所有文件。文件 ID 即為日期，可省去額外欄位。

**fields 結構調整：** `slots` 存為 array，`hours` 存為 map（key 為 slot_8h 字串）。

### 4. Slot 頁讀取：新增 `getPhotoIndexByDate(date)` 單筆讀取

Slot 頁只需讀取特定日期的索引，直接 GET `photo_index/{date}`（1 read）即可取得該日期所有小時索引。

### 5. 不回填歷史資料

**理由：** 回填需要讀取全部 photos（觸發 quota 問題），且本系統為活動現場使用，歷史資料不重要。未來照片上傳時自動建立索引，舊資料可視需求手動補建。

## Risks / Trade-offs

- **歷史照片缺失**：首頁切換為讀 `photo_index` 後，現有照片（`photos` 集合）不會出現，直到 `/api/upload` 寫入新照片更新索引。→ **緩解：** 可在 Firebase Console 手動建立 `photo_index` 文件，或暫時保留 `queryDatesWithSlots()` 作備援。
- **競態條件**：極少數情況下兩台相機同時上傳同一日期，可能導致其中一台的 hourMin 被覆蓋。→ **影響極低**：hourMin 只影響 slot 頁的「有照片」視覺標記，不影響實際照片查詢。

## Migration Plan

1. 部署新版（含 `updatePhotoIndex` 邏輯）
2. 新上傳的照片自動更新 `photo_index`
3. 首頁暫時可能顯示「尚無拍攝紀錄」（若 `photo_index` 為空），等待第一次上傳後恢復正常
4. 如需立即顯示歷史資料，可在 Firebase Console 手動新增 `photo_index/{date}` 文件
