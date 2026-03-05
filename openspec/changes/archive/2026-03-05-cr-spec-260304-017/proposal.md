## Why

目前首頁是手動輸入日期 + 按鈕，訪客不知道哪些日期有照片可以看，需要自己猜日期。改為自動列出有資料的日期，讓訪客一眼看到所有可瀏覽的拍攝紀錄，並補充 OpenGraph 標籤使分享連結更完整。

## What Changes

- 首頁（`app/page.tsx`）改為 Server Component，從 Firestore 查出所有有照片的日期
- 每個日期以卡片呈現，卡片標題顯示日期，卡片內有三個時段格（早 0–8、中 8–16、晚 16–24）
- 有照片的時段格深色可點擊，無照片的時段格淺色（仍可點擊進入，行為與現有 slot 頁一致）
- 依日期**由新到舊**排列，只顯示至少有一張照片的日期
- 頁面標題改為「不間斷讀經接力相簿」
- 新增 OpenGraph meta tags（`og:title`、`og:description`、`og:type`）

## Capabilities

### New Capabilities

（無新 capability，均為既有功能改版）

### Modified Capabilities

- `photo-retrieval-ui`：首頁由手動日期選擇器改為自動日期卡片列表；新增「依日期顯示三時段格」互動模式
- `seo-metadata`：新增 OpenGraph meta tags 需求（`og:title`、`og:description`、`og:type`）

## Impact

- `app/page.tsx`：整頁重寫，從 Client Component 改為 Server Component（需 edge runtime + Firestore REST 查詢）
- `lib/firebase-rest.ts`：可能需新增「查詢所有有照片日期」的 query helper
- `app/layout.tsx`：新增 OpenGraph metadata export
