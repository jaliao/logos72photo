## Context

相簿瀏覽頁（`app/gallery/[date]/[slot]/page.tsx` 與 `app/gallery/[date]/[slot]/[album]/page.tsx`）均設定 `runtime = 'edge'`（Cloudflare Workers），但使用了 Firebase Client SDK（`firebase/firestore`），後者依賴 Node.js 內建模組，在 Edge Runtime 中無法執行，導致 Worker exception。

這與先前監控頁面（cr-fix-260221-002）發生的問題相同，已有解決範例：改用 `lib/firebase-rest.ts` 的純 Fetch 實作。不同之處在於，相簿頁面需要帶條件過濾的查詢（WHERE 多欄），而現有 `listDocs` 僅支援取得整個集合。

同時，使用者反映：
1. 日期輸入框文字顏色在部分瀏覽器（特別是 iOS Safari）顯示為灰色
2. 每個 8 小時時段顯示 32 個 15 分鐘格子，視覺上過於細碎，希望改為 8 個 1 小時格子

## Goals / Non-Goals

**Goals:**
- 修復 Edge Runtime 錯誤（gallery 頁面改用 REST API）
- 日期選擇器文字顯示為黑色
- 相簿列表以 1 小時為單位分組（8 格 / 時段）
- 相簿內頁查詢並顯示該小時內所有照片

**Non-Goals:**
- 不修改 Firestore 資料結構（不新增 `slot_1h` 欄位）
- 不修改照片上傳 API
- 不實作分頁或無限滾動

## Decisions

### 決策 1：新增 `queryPhotos()` 至 `lib/firebase-rest.ts`

**選擇：** 使用 Firestore REST API 的 `runQuery` endpoint（POST）搭配 `StructuredQuery`，支援多個 `FieldFilter`（`EQUAL` operator）。

**Rationale：** 現有 `listDocs` 是 GET 整個集合，無法過濾。`runQuery` 是 Firestore REST API 唯一支援 WHERE 的方式。不使用 Firestore SDK 的 `query()` 避免 Edge Runtime 衝突。

**簽名：**
```typescript
queryPhotos(filters: Array<{ field: string; value: unknown }>): Promise<PhotoDoc[]>
```

**替代方案：**
- `listDocs` 後 client-side 過濾 → 效能差，傳輸大量不必要資料
- 新增 API Route 包裝查詢 → 額外 RTT，不必要

### 決策 2：1 小時分組不改資料結構，在讀取層計算

**選擇：** SlotPage 查詢 `date + slot_8h`，以 `Math.floor(slot_15m / 60) * 60` 計算每張照片所屬小時，取得各小時是否有照片的 Set。

**Rationale：** 不需要修改 Upload API 或 Firestore 已存在的資料。計算成本極低（整數除法）。

**URL 結構不變：** 原本 `[album]` 是 slot_15m 值，改為小時起始分鐘（0, 60, 120, ... 420）。既有分享連結若以 15 分鐘值存取，頁面仍可正常回應（查詢範圍覆蓋該分鐘所在小時）。

### 決策 3：AlbumPage 查詢改為時間範圍（同一小時的 4 個 15 分鐘 slot）

**選擇：** 查詢 `date + slot_8h`，然後 in-memory 過濾 `slot_15m >= hourMin && slot_15m < hourMin + 60`，再依 `timestamp` 排序。

**Rationale：** `runQuery` 支援 `FieldFilter` 的多個 EQUAL，但不直接支援 BETWEEN 範圍過濾（需複合索引且 REST API 語法較複雜）。由於每個 8 小時時段照片數量有限（兩台 iPhone × 每 5 分鐘 = 最多 ~96 張），全部拉回後 in-memory 過濾效能可接受。

### 決策 4：日期 input text 色用 `text-zinc-900`

**Rationale：** Tailwind 的 `text-zinc-900` 保持與設計系統一致（比 `text-black` 更軟）。iOS Safari 對 `<input type="date">` 的文字顏色需明確設定才會覆寫系統預設。

## Risks / Trade-offs

- **[Risk] 既有 15 分鐘值的 URL 仍可訪問** → 不破壞，因 AlbumPage 會以 `Math.floor(album / 60) * 60` 取得小時起始，正確查詢該小時所有照片
- **[Risk] `runQuery` 需要 Service Account access token** → 已有 `getAccessToken()` 機制，直接沿用
- **[Trade-off] AlbumPage 傳輸量略增**（一次拉整個 8 小時的照片再過濾）→ 可接受，照片 metadata 每筆 < 1KB，8 小時最多 ~192 筆

## Migration Plan

1. 新增 `queryPhotos()` 至 `lib/firebase-rest.ts`
2. 更新 `app/gallery/[date]/[slot]/page.tsx`（1 小時分組 + REST API）
3. 更新 `app/gallery/[date]/[slot]/[album]/page.tsx`（時間範圍查詢 + REST API）
4. 更新 `app/page.tsx`（date input 文字色）
5. 部署並驗證

**Rollback：** 恢復上述四個檔案至修改前版本即可。

## Open Questions

- 無
