## Context

`photo_index.firstPhotos` 為 cr-spec-260312-004 新增欄位，歷史照片資料需透過 `POST /api/admin/rebuild-photo-index` 回補。此 API 已存在且支援 `firstPhotos`，但目前只能透過 `curl` 呼叫，後台工作人員無法自助操作。

現有後台頁面（`/admin/data-cleanup`）為 Client Component，使用 `NEXT_PUBLIC_ADMIN_SECRET` 呼叫受保護 API，可作為實作參考。

## Goals / Non-Goals

**Goals:**
- 後台提供單一按鈕觸發重建，顯示執行中 / 完成 / 失敗狀態
- 成功後展示 API 回傳的結果摘要（日期數、照片數）

**Non-Goals:**
- 不新增 API 端點（直接複用 `POST /api/admin/rebuild-photo-index`）
- 不支援部分重建（指定日期）
- 不加入後台導覽列（不在本次範圍）

## Decisions

### 決策 1：Client Component 直接呼叫 API

與 `data-cleanup` 頁面一致，使用 `'use client'` + `useState` + `fetch`。
API 驗證沿用 `x-admin-secret: NEXT_PUBLIC_ADMIN_SECRET`。

### 決策 2：不需要確認 dialog

重建為冪等唯讀操作（只寫入 `firstPhotos`，不刪除資料），風險低，直接執行即可，不需要 confirm dialog。

### 決策 3：結果顯示

API 回傳 `{ ok, message, results[] }`，直接顯示 `message`（例：「重建完成：3 個日期，120 張照片」）。
`results[]` 陣列可折疊顯示（`<details>`），避免佔用過多版面。

## Risks / Trade-offs

| 風險 | 緩解方式 |
|------|----------|
| 重建時間較長（大量照片時） | 按鈕點擊後顯示 spinner，API timeout 由 Cloudflare Pages（預設 30s）限制；若超時再按一次即可（冪等） |
| `NEXT_PUBLIC_ADMIN_SECRET` 未設定 | fetch 前檢查，未設定時顯示錯誤提示而非靜默失敗 |
