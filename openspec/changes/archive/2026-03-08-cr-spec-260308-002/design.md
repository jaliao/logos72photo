## Context

時段列表頁（`/gallery/[date]/[slot]`）目前以 `photo_index/{date}.hours` 判斷哪些小時格有照片，但 `hours` 結構只儲存「有照片的 hourMin 清單」，沒有張數資訊。要在每格下方顯示「N 張」，需擴充索引結構或另行查詢。

現有 `photo_index/{date}` 結構：
```ts
interface PhotoIndexDoc {
  slots: number[]                       // e.g. [0, 8]
  hours: Record<string, number[]>       // e.g. { "0": [0, 60, 120] }
}
```

`updatePhotoIndex()` 每次上傳呼叫一次，負責合併 slot 與 hourMin 到索引。

## Goals / Non-Goals

**Goals:**
- 時段列表頁所有小時格統一顯示深色（黑色）方塊
- 每格下方顯示「N 張」照片數量
- 避免額外 Firestore 讀取，保持現有 1 read/次效率

**Non-Goals:**
- 不修改首頁日期卡片三格外觀
- 不修改照片預覽頁
- 不修改相機端上傳流程（除 `updatePhotoIndex` 簽名變更）

## Decisions

### 決策 1：擴充 `photo_index` 新增 `hourCounts` 欄位

**選項 A**：每次查詢時掃描 `photos` 集合計算張數
- 缺點：多次 Firestore reads（回到 O(photos) 代價），與 photo_index 優化方向相反

**選項 B**：在 `photo_index/{date}` 新增 `hourCounts` 欄位（選定）

結構：
```ts
interface PhotoIndexDoc {
  slots: number[]
  hours: Record<string, number[]>
  hourCounts: Record<string, Record<string, number>>
  // hourCounts[slot8h_str][hourMin_str] = count
  // e.g. { "0": { "0": 12, "60": 8 }, "8": { "480": 5 } }
}
```

`updatePhotoIndex(date, slot8h, hourMin)` 每次呼叫時將 `hourCounts[slotKey][hourMin_str]` 遞增 1。
讀取端（`SlotPage`）從回傳資料中取得 `hourCounts[slot8h][hourMin]` 顯示。

**理由**：不增加 read 次數；結構向下相容（舊文件無此欄位時視為 0）。

### 決策 2：UI — 全格統一深色，移除「有/無照片」分支

移除 `hasPhotos` 判斷，所有格子套用 `bg-zinc-800/50 text-white hover:bg-zinc-700/60`。
每格顯示：
- 上方：時間標籤（`formatSlot15m(albumMin)`）
- 下方：`N 張`（`text-xs text-zinc-300`）；若 N = 0 顯示「0 張」

### 決策 3：`getPhotoIndexByDate` 回傳型別擴充

目前 `getPhotoIndexByDate` 回傳 `Record<string, number[]>`（只有 hours）。
改為回傳完整結構：
```ts
{ hours: Record<string, number[]>; hourCounts: Record<string, Record<string, number>> }
```

`SlotPage` 解構使用兩個欄位。

## Risks / Trade-offs

- **Read-modify-write 競態**：`updatePhotoIndex` 先讀再寫，多裝置同時上傳時可能漏計。現有架構已有此問題（`hours` Set 合併），屬已知限制；活動場景為少數裝置，可接受。
- **舊文件相容**：`hourCounts` 欄位不存在時，`??` 回傳空物件，`count ?? 0` 顯示 0 張，向下相容。
- **Cloudflare Pages edge runtime**：無 `node:` 模組，現有架構已符合，本次無新增依賴。
