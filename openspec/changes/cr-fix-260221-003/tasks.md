## 1. 新增 `queryPhotos()` 至 `lib/firebase-rest.ts`

- [x] 1.1 在 `lib/firebase-rest.ts` 新增 `queryPhotos(filters)` 函式，使用 Firestore REST API `runQuery` endpoint（POST），支援多個 EQUAL FieldFilter
- [x] 1.2 新增內部輔助函式，將 `filters` 陣列轉換為 Firestore `StructuredQuery` JSON 格式
- [x] 1.3 回傳值以 `parseFirestoreFields` 解析，型別為 `PhotoDoc[]`

## 2. 修正 `app/page.tsx`（日期文字色）

- [x] 2.1 在 date `<input>` 的 className 加入 `text-zinc-900`，確保各瀏覽器（含 iOS Safari）顯示黑色文字

## 3. 更新 `app/gallery/[date]/[slot]/page.tsx`（1 小時分組 + REST API）

- [x] 3.1 移除 `firebase/firestore` 與 `@/lib/firebase` 的 import
- [x] 3.2 將 `generateSubAlbums()` 的步長從 15 改為 60，產生 8 個 1 小時格子（而非 32 個 15 分鐘格子）
- [x] 3.3 將 `getAlbumsWithPhotos()` 改用 `queryPhotos()`（過濾 `date` 與 `slot_8h`），以 `Math.floor(slot_15m / 60) * 60` 計算各張照片所屬小時，回傳 `Set<number>`（小時起始分鐘）
- [x] 3.4 更新頁面說明文字（`15 分鐘相簿` → `1 小時相簿`）

## 4. 更新 `app/gallery/[date]/[slot]/[album]/page.tsx`（時間範圍查詢 + REST API）

- [x] 4.1 移除 `firebase/firestore` 與 `@/lib/firebase` 的 import
- [x] 4.2 將 `getPhotos()` 改用 `queryPhotos()`（過濾 `date` 與 `slot_8h`），在 memory 中過濾 `slot_15m >= slot15m && slot_15m < slot15m + 60`，依 `timestamp` 升冪排序
- [x] 4.3 更新頁面標題格式，顯示 1 小時範圍（例如 `08:00 – 09:00`）而非單一 15 分鐘時間點

## 5. 部署與驗證

- [x] 5.1 本地 `npm run build` 確認無 TypeScript 錯誤
- [ ] 5.2 `git push origin main` 觸發 Cloudflare Pages 重新部署
- [ ] 5.3 正式環境確認：點選時段後相簿列表正常顯示（不再發生 Worker exception）
- [ ] 5.4 正式環境確認：相簿列表顯示 8 個 1 小時格子
- [ ] 5.5 正式環境確認：點擊有照片的 1 小時格子，照片正常顯示
- [ ] 5.6 正式環境確認：首頁日期選擇器文字為黑色
