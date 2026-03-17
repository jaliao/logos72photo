## Why

後台 `/admin/slot-passwords` 目前僅支援瀏覽器列印，無法以試算表方式整理與分發帳密資料。為配合活動執行需求，需在 3/25（三）18:30 前提供可匯出的 Excel 檔案，讓工作人員能快速篩選、分配各時段帳密。

## What Changes

- 在 `/admin/slot-passwords` 頁面新增「匯出 Excel」按鈕
- 點擊後呼叫新的 API Route，批次取得所有 slotGroup 的密碼，回傳 `.xlsx` 檔案下載
- 匯出資料範圍：從 **2026/03/25 18:30**（slotGroup `03251803`）起至現有結束日（2026/03/30），共約 480 筆
- Excel 欄位：分組號碼、時段說明、密碼
- 下載檔名：`slot-passwords-YYYYMMDD.xlsx`

## Capabilities

### New Capabilities
- `slot-password-excel-export`：後台帳密 Excel 批次匯出功能，包含 API Route 與前端下載按鈕

### Modified Capabilities
- `slot-group-album`：匯出起始時段調整（從 3/25 18:30 開始），不影響現有登入邏輯

## Impact

- **新增：** `app/api/admin/slot-passwords/export/route.ts`（回傳 `.xlsx` binary）
- **修改：** `app/admin/slot-passwords/page.tsx`（加入匯出按鈕與起始日期參數）
- **依賴：** 需新增 `xlsx`（SheetJS）或 `exceljs` npm 套件
- **權限：** 沿用現有後台 admin 驗證（`ADMIN_PASSWORD`），無需額外 auth

## Non-goals

- 不支援自訂日期範圍 UI（硬寫起始 slotGroup）
- 不做匯出歷程紀錄
- 不支援 CSV 以外格式（僅 xlsx）
