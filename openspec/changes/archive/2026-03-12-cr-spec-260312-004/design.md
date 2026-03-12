## Context

時段列表頁（`/gallery/[date]/[slot]`）的每個小時格目前以純色塊（`bg-zinc-800/50`）呈現，並在下方顯示照片張數（`hourCounts`）。本次改版目標：有照片的格子以該小時第一張照片作為封面，無照片的格子禁用點擊，同時移除張數資訊。

現有資料結構（`photo_index/{date}`）：
- `slots`: `number[]`
- `hours`: `Record<slot8h_str, hourMin_str[]>`
- `hourCounts`: `Record<slot8h_str, Record<hourMin_str, number>>`

第一張照片 URL 目前**未**儲存於 `photo_index`，需新增欄位或改以查詢取得。

## Goals / Non-Goals

**Goals:**
- 有照片的小時格：顯示該小時第一張照片封面 + 70% 黑色遮罩 + 白色時間文字
- 無照片的小時格：灰色背景 + 白色時間文字 + 不可點擊
- 移除所有小時格的照片張數顯示

**Non-Goals:**
- 不修改 8 小時時段格（首頁日期卡片）
- 不改動照片上傳 API 以外的 Firestore 寫入邏輯
- 不預載或快取封面圖片（使用 R2 公開 URL 直接渲染即可）

## Decisions

### 決策 1：封面 URL 的取得方式

**選項 A（採用）：在 `photo_index` 新增 `firstPhotos` 欄位**
結構：`firstPhotos: Record<slot8h_str, Record<hourMin_str, r2_url_string>>`。
在 `updatePhotoIndex()` 上傳照片時，若對應 `hourMin` 的 `firstPhotos` 尚未設定，則寫入目前照片的 `r2_url`（first-write-wins）。

理由：
- 與現有 `hourCounts` 反正規化模式一致，頁面仍只需 1 次 Firestore read
- Edge runtime 限制下不宜增加額外查詢
- 第一張照片 URL 在活動期間不會變動，無需失效機制

**選項 B（不採用）：頁面載入時查 Firestore `photos` 集合，每小時各 1 次（limit 1）**
缺點：8 次額外查詢，Edge runtime latency 增加，成本較高。

---

### 決策 2：無照片格子的不可點擊實作

有照片 → 保留 `<Link>` 元件。
無照片 → 改為 `<div>`，移除 `href`，加上 `cursor-default opacity-60`。
不使用 `disabled` 或 `pointer-events-none`，以維持語意正確性。

---

### 決策 3：封面圖渲染方式

使用 Next.js `<Image>` 元件，`fill` + `object-cover`，父容器設 `position: relative overflow-hidden`。
遮罩以 `<div className="absolute inset-0 bg-black/70">` 疊加。
時間文字以 `<span className="relative z-10">` 確保在遮罩之上。

`<Image>` 使用 `unoptimized` 或設定 `remotePatterns` 允許 R2 公開網域，避免 Next.js Image Optimization 對 R2 URL 的 hostname 驗證失敗。

## Risks / Trade-offs

| 風險 | 緩解方式 |
|------|----------|
| 舊有 `photo_index` 文件無 `firstPhotos` 欄位 | 讀取端以 `firstPhotos?.[slotKey]?.[hourKey]` 安全存取，`undefined` 時降級為無照片格子（灰色）|
| R2 公開 URL 未加入 `next.config` `remotePatterns` | 實作時確認 `next.config.ts` 已允許 R2 public domain |
| `updatePhotoIndex` 多裝置並發寫入時 `firstPhotos` 可能被覆蓋 | 改用 Firestore `update`（僅 PATCH 未設定欄位），或接受偶爾的覆蓋（封面照只是美觀用途，影響極小）|

## Migration Plan

1. 修改 `lib/firebase-rest.ts`：`PhotoIndexDoc` 新增 `firstPhotos` 欄位，`updatePhotoIndex()` 新增 first-write-wins 邏輯
2. 修改 `lib/firebase-rest.ts`：`getPhotoIndexByDate()` 回傳值新增 `firstPhotos`
3. 修改 `app/gallery/[date]/[slot]/page.tsx`：讀取 `firstPhotos`，傳入小時格元件
4. 更新小時格渲染邏輯（inline 或抽出子元件）
5. 部署後舊有小時格無 `firstPhotos` → 降級為灰色；新上傳照片後自動填入封面

回滾：`photo_index` 新欄位為選填，移除 UI 端讀取邏輯即可回滾，無需清理資料。

## Open Questions

無。
