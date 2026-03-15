## Context

目前照片系統以 `slot8h`（8 小時大時段）+ `hourMin`（分鐘）兩層索引管理照片瀏覽。照片上傳後存入 Firestore `photos` 集合與 Cloudflare R2，並透過 `photo_index` 維護封面縮圖。

本次新增「個人時段相簿」概念：每 15 分鐘為一個分組（`slotGroup`，8 碼 MMDDHHSS），照片依拍攝時間自動歸組，來賓可透過固定網址查看該時段全部照片。

## Goals / Non-Goals

**Goals:**
- 定義 `slotGroup` 欄位（`MMDDHHSS`）並在上傳時自動寫入 Firestore 照片記錄
- 新增 `/album/[slotGroup]` 獨立相簿頁面，依 slotGroup 查詢並呈現照片
- 頁面顯示分組編號供來賓辨識

**Non-Goals:**
- 不修改現有相簿路由（`/gallery/...`）的邏輯
- 不提供 slotGroup 管理後台或手動修改介面
- 不建立 slotGroup 層級的 photo_index 索引（避免額外寫入成本）
- 不支援跨 slotGroup 搜尋

## Decisions

### 1. slotGroup 自動計算邏輯（上傳端）

**選擇：** 由 `/api/upload` 現有的 `dateStr`（台灣日期）與 `slot_15m`（當日對齊 15 分鐘的分鐘數）直接推導，不需 EXIF 解析。相機自動拍照後立即上傳，伺服器時間與拍攝時間誤差極小。

**計算公式（基於現有變數）：**
```
MM   = dateStr.slice(5, 7)                          // 月份 2 碼
DD   = dateStr.slice(8, 10)                         // 日期 2 碼
HH   = Math.floor(slot_15m / 60)                    // 小時（00–23）
SS   = Math.floor((slot_15m % 60) / 15) + 1         // 子時段（01–04）
slotGroup = MM + DD + HH.padStart(2,'0') + SS.toString().padStart(2,'0')
```

範例：`date="2026-03-13"`，`slot_15m=90`（= 01:30）→ `"03130103"`

**替代方案考慮：** 解析 EXIF（棄用，增加複雜度；自動拍照立即上傳，伺服器時間已足夠精確）。

### 2. 資料儲存位置

**選擇：** 在 Firestore `photos/{id}` 文件新增 `slotGroup: string` 欄位，於 `/api/upload` handler 計算後一併寫入。

**替代方案考慮：** 建立獨立 `slot_groups` 集合（棄用，增加讀寫複雜度，無必要性）。

### 3. 查詢方式

**選擇：** `/album/[slotGroup]` 頁面直接對 Firestore `photos` 集合執行 `where('slotGroup', '==', slotGroup)` 查詢，依 `createdAt` 排序。

**Firestore index：** 需建立複合索引 `slotGroup ASC, createdAt ASC`（部署時透過 firestore.indexes.json 定義）。

**替代方案考慮：** 使用 `photo_index` 快取（棄用，slotGroup 粒度細，維護成本高）。

### 4. 路由設計

**選擇：** `/album/[slotGroup]` 為獨立 Next.js App Router 路由，不嵌套在 `/gallery/` 下，保持職責分離。

- Server Component 取得照片資料
- Client Component 處理 Lightbox 互動（沿用現有 `photo-lightbox` 能力）

### 5. slotGroup 格式驗證

**選擇：** 路由層以正則 `/^\d{8}$/` 驗證，格式不符回傳 404，避免無效查詢打到 Firestore。

## Risks / Trade-offs

- **上傳延遲** → 相機拍照後若因網路緩慢延遲上傳，伺服器時間可能跨越 15 分鐘邊界。接受此風險，因自動拍照每 5 分鐘一次，延遲超過 10 分鐘的情況屬極端例外。
- **Firestore 查詢費用** → 每次頁面載入執行一次 collection query，每個 slotGroup 照片數量有限（約數十張），成本可接受。
- **歷史照片無 slotGroup** → 舊照片不補寫，`/album/[slotGroup]` 只顯示有 slotGroup 欄位的照片。接受此限制。

## Migration Plan

1. 部署新版 `/api/upload`（含 slotGroup 計算），新照片自動帶 slotGroup
2. 新增 `firestore.indexes.json` 複合索引定義並部署
3. 發布 `/album/[slotGroup]` 路由

## Open Questions

- 無
