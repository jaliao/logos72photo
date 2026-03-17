## Context

`/admin/slot-passwords` 目前提供單筆查詢與瀏覽器列印，密碼透過 `derivePassword()`（HMAC-SHA256，edge runtime 相容）在 server 端即時計算。專案部署於 Cloudflare Pages，所有 API Route 均設定 `export const runtime = 'edge'`。

本次新增 Excel 匯出 API，起始 slotGroup 固定為 `03251803`（2026/03/25 18:30），結束為 `03303004`（2026/03/30 23:45），共約 480 筆。

## Goals / Non-Goals

**Goals:**
- 新增 `GET /api/admin/slot-passwords/export` 回傳 `.xlsx` 二進位檔案
- 前端加入一鍵下載按鈕（`<a href>` 直接觸發下載）
- 沿用現有 `admin_session` cookie 驗證，不另開 endpoint 驗證

**Non-Goals:**
- 不做自訂日期範圍 UI
- 不支援 CSV 格式
- 不快取或儲存匯出檔案

## Decisions

### 1. Excel 套件：SheetJS（`xlsx`）

**選擇：** `xlsx`（SheetJS community edition）
**理由：** 純 JS 實作，無 Node.js built-in 依賴，可在 Cloudflare Workers / edge runtime 執行。`exceljs` 依賴 Node.js Buffer/stream API，在 edge runtime 會失敗。

### 2. API 回傳方式

**選擇：** 直接回傳 binary `Response`，Content-Type 設為 `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`，Content-Disposition 設為 `attachment; filename="slot-passwords-YYYYMMDD.xlsx"`
**理由：** 前端只需 `<a href="/api/admin/slot-passwords/export" download>` 即可觸發下載，不需額外的 fetch + Blob 處理。

### 3. 密碼批次計算

沿用 print page 的 batching 策略，每批 96 筆（一天份）以 `Promise.all` 並發計算，避免一次性 Promise 過多。

### 4. 起始 slotGroup 硬寫

起始值 `03251803` 直接寫在 API route，不透過 query param 控制（非目標）。

## Risks / Trade-offs

- **Edge runtime 記憶體限制** → `.xlsx` 產生的 ArrayBuffer 約 40–80 KB，遠低於 Cloudflare Workers 的 128 MB 限制，風險極低
- **SheetJS bundle size** → `xlsx` 壓縮後約 200 KB，會增加 edge bundle 大小，但仍在可接受範圍
- **驗證繞過風險** → 沿用 `admin_session` cookie 明文比對，與現有後台一致，無額外風險

## Migration Plan

1. 安裝 `xlsx`：`npm install xlsx --legacy-peer-deps`
2. 新增 `app/api/admin/slot-passwords/export/route.ts`
3. 修改 `app/admin/slot-passwords/page.tsx`，加入「匯出 Excel」按鈕

無資料庫異動，無需 rollback 策略。
