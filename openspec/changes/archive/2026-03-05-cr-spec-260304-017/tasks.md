## 1. Firestore 查詢 Helper

- [x] 1.1 在 `lib/firebase-rest.ts` 新增 `queryDatesWithSlots()` 函式，使用 field mask（`date`、`slot_8h`）查詢 `photos` 集合，加入 `limit: 2000`
- [x] 1.2 實作 server-side 去重邏輯：建立 `Map<string, Set<0|8|16>>`，返回 `Array<{ date: string; slots: Set<0|8|16> }>` 依日期由新到舊排序

## 2. 首頁重寫

- [x] 2.1 將 `app/page.tsx` 改為 async Server Component，加上 `export const runtime = 'edge'` 與 `export const dynamic = 'force-dynamic'`
- [x] 2.2 呼叫 `queryDatesWithSlots()`，處理空狀態（無資料時顯示「尚無拍攝紀錄」）
- [x] 2.3 實作日期卡片列表 UI：每日一卡、顯示日期標題（`YYYY-MM-DD`）
- [x] 2.4 實作卡片內三時段格（早 / 中 / 晚），有照片深色、無照片淺色，均以 `<Link href="/gallery/{date}/{slot}">` 包裹
- [x] 2.5 套用 Mobile-First RWD：手機單欄卡片列表，時段格三欄水平排列於卡片內，`sm:` 以上可視需要調整

## 3. 頁面標題

- [x] 3.1 將首頁 `<h1>` 改為「不間斷讀經接力相簿」

## 4. OpenGraph Meta Tags

- [x] 4.1 在 `app/layout.tsx` 的 `metadata` 物件新增 `openGraph`：`title`、`description`（繁體中文）、`type: 'website'`

## 5. 驗證

- [x] 5.1 本地執行 `npm run dev`，確認首頁正確列出有照片的日期與時段格
- [ ] 5.2 確認點擊時段格可正確導航至 `/gallery/{date}/{slot}`
- [ ] 5.3 使用 Facebook Sharing Debugger 或 LINE 預覽確認 OpenGraph 標籤輸出正確
- [ ] 5.4 手機瀏覽器確認 Mobile-First 排版正常

