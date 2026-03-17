## 1. 安裝套件

- [x] 1.1 安裝 SheetJS：`npm install xlsx --legacy-peer-deps`
- [x] 1.2 確認 `xlsx` 可在 edge runtime 正確 import（檢查 `package.json`）

## 2. 匯出 API Route

- [x] 2.1 新增 `app/api/admin/slot-passwords/export/route.ts`，設定 `export const runtime = 'edge'`
- [x] 2.2 實作 `admin_session` cookie 驗證（回傳 401 若未驗證）
- [x] 2.3 使用 `generateAllSlotGroups('2026-03-25', '2026-03-30')` 產生 slotGroups，並 filter 保留 `>= '03251803'`
- [x] 2.4 以批次（每批 96 筆）`Promise.all` 呼叫 `derivePassword()` 計算所有密碼
- [x] 2.5 使用 `xlsx` 建立工作表，欄位：分組號碼、時段（`formatSlotGroupLabel`）、密碼
- [x] 2.6 以 `xlsx.write(wb, { type: 'array', bookType: 'xlsx' })` 產生 ArrayBuffer
- [x] 2.7 回傳 `Response`，設定 `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` 與 `Content-Disposition: attachment; filename="slot-passwords-YYYYMMDD.xlsx"`

## 3. 前端匯出按鈕

- [x] 3.1 在 `app/admin/slot-passwords/page.tsx` 新增「匯出 Excel」按鈕，放置於「全部帳密表格」區塊的操作列右側
- [x] 3.2 使用 `useState` 控制 `downloading` 狀態，點擊時 disabled 並顯示「匯出中…」
- [x] 3.3 以 `fetch` 呼叫 `/api/admin/slot-passwords/export`，取得 Blob 後用 `URL.createObjectURL` 觸發下載
- [x] 3.4 下載完成或失敗後重置按鈕狀態

## 4. 驗證

- [x] 4.1 本機測試：點擊匯出按鈕，確認 Excel 下載成功，第一筆為 `03251803`、最後一筆為 `03303004`
- [x] 4.2 確認未登入時 API 回傳 401（手動驗證）
- [x] 4.3 更新 `config/version.json` patch 版號 +1
- [x] 4.4 更新 `README-AI.md`
