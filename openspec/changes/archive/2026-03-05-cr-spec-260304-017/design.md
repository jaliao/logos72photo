## Context

目前首頁（`app/page.tsx`）是 Client Component，提供日期選擇器與三個時段按鈕，訪客需要自行猜測哪些日期有資料。Firestore `photos` 集合已存有每張照片的 `date`（`YYYY-MM-DD`）與 `slot_8h`（`0 | 8 | 16`）欄位，可從中重建「哪些日期 × 哪些時段有照片」的索引。

現有 `lib/firebase-rest.ts` 使用 Service Account JWT 呼叫 Firestore REST API，已確認可在 Edge Runtime 執行。

## Goals / Non-Goals

**Goals:**
- 首頁自動列出有照片的日期，每日一張卡片，卡片內顯示三時段格
- 時段格有照片者深色、無照片者淺色，均可點擊
- 日期由新到舊排列
- 頁面標題 `<h1>` 改為「不間斷讀經接力相簿」
- `app/layout.tsx` 補充 OpenGraph meta tags

**Non-Goals:**
- 不引入 Firestore 額外的 `dates` summary collection（維持現有 schema）
- 不修改 `/gallery/[date]/[slot]/` 以下的路由與 UI
- 不做分頁（72 小時活動照片量可在單次查詢內完成）

## Decisions

### D1：Firestore 查詢策略 — Field Mask + Server-side 去重

**選擇：** 在 `buildStructuredQuery` 加入 `select.fields`（field mask），只拉取 `date` 與 `slot_8h` 兩個欄位，減少傳輸量；回傳後在 Server Component 去重，建立 `Map<date, Set<slot_8h>>` 索引。

**替代方案考量：**
- *全欄位查詢* — 資料量大（含 `r2_url`、`timestamp` 等），傳輸浪費
- *引入 `dates` summary collection* — 需修改上傳 API 維護另一個 collection，超出此 CR 範圍

**理由：** 72 小時活動最多約 1,728 筆（2 台相機 × 每 5 分鐘 × 72 小時），加上 field mask 後資料量小，單次查詢可接受。若未來活動規模增加再考慮 summary collection。

---

### D2：新增 `queryDatesWithSlots()` helper

**選擇：** 在 `lib/firebase-rest.ts` 新增一個專用函式 `queryDatesWithSlots()`，返回 `Array<{ date: string; slots: Set<0 | 8 | 16> }>`，按日期由新到舊排序。

**理由：** 業務邏輯集中在一個地方，首頁 Server Component 保持簡潔；未來若改用 summary collection，只需替換此函式。

---

### D3：首頁改為 Server Component + Edge Runtime

**選擇：** `app/page.tsx` 改為 async Server Component，加上 `export const runtime = 'edge'` 與 `export const dynamic = 'force-dynamic'`，直接 `await queryDatesWithSlots()`。

**替代方案考量：**
- *Client Component + API Route* — 多一次網路往返，且需保護 API Route 不洩漏 Firebase 憑證

**理由：** 與 `/gallery/[date]/[slot]/page.tsx` 相同模式，已驗證可行。

---

### D3.5：RWD — Mobile-First

**選擇：** 所有 UI 以手機為優先設計，Tailwind breakpoint 從 `sm:` 向上擴展，預設樣式針對手機，桌面版為漸進增強。

- 日期卡片列表：手機單欄，`sm:` 以上可視情況多欄
- 時段格：手機三欄（每個時段一格），平板以上保持三欄
- 最大寬度容器限制，置中顯示

---

### D4：OpenGraph — Next.js `metadata` export

**選擇：** 在 `app/layout.tsx` 的 `metadata` 物件加入 `openGraph` 屬性（`og:title`、`og:description`、`og:type`）。

**理由：** Next.js App Router 原生支援，無需額外套件；`og:image` 暫不設定（無固定 cover image）。

## Risks / Trade-offs

- **Firestore 查詢量上限**：Firestore `runQuery` 單次回傳上限為 100 筆（需加 `pageToken` 分頁）。→ 先加 `limit: 2000` 確保覆蓋最大預期量；若超過再加分頁邏輯。
- **首頁 Cold Start**：每次請求都會查 Firestore（`force-dynamic`），Cloudflare edge node 無快取。→ 活動期間流量不大，可接受；若有需要可加 `next: { revalidate: 60 }` 或改用 ISR。
- **slot 欄位型別**：Firestore 儲存的 `slot_8h` 為 integer，REST API 回傳為 `integerValue`，需確認 `parseFirestoreValue` 正確轉型。→ 現有 `integerValue` → `Number()` 邏輯已有，應無問題。
