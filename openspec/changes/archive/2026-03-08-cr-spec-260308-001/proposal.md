## Why

首頁 `queryPhotoIndex()` 目前讀取 `photo_index` 集合的**所有文件**，文件數隨活動天數線性增長，且無法排除非活動期間的雜訊日期。透過環境變數設定活動起訖日期，首頁可以只顯示有效日期範圍，並減少不必要的文件讀取。

## What Changes

- 新增兩個環境變數（`NEXT_PUBLIC_GALLERY_START_DATE`、`NEXT_PUBLIC_GALLERY_END_DATE`），定義相簿顯示的日期範圍。
- `queryPhotoIndex()` 接受可選的 `startDate` / `endDate` 參數，在取得文件列表後以日期字串比較過濾（Firestore REST LIST API 不支援文件 ID 範圍查詢，仍需全量讀取後 client-side 過濾）。
- 首頁從環境變數讀取起訖日期，結束日期未設定時預設為台灣今日日期。

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `photo-retrieval-ui`：首頁日期列表改為只顯示起訖日期範圍內的日期

## Non-goals

- 不實作 Firestore 伺服器端日期範圍查詢（photo_index 使用文件 ID 為日期，REST LIST 不支援 ID 範圍過濾）
- 不修改 slot / album 子頁面的查詢邏輯
- 不新增 admin 介面設定日期範圍

## Impact

- `lib/firebase-rest.ts`：`queryPhotoIndex` 新增 `startDate` / `endDate` 可選參數
- `app/page.tsx`：讀取環境變數並傳入 `queryPhotoIndex`
- `.env.local` / Cloudflare Pages 環境變數：新增 `NEXT_PUBLIC_GALLERY_START_DATE`、`NEXT_PUBLIC_GALLERY_END_DATE`
