## Why

`photo_index.firstPhotos` 欄位為新增功能，歷史資料需手動呼叫 API 回補。目前僅能透過 `curl` 執行，後台工作人員無法自助操作，需要一個視覺化介面觸發重建並確認結果。

## What Changes

- 在後台新增「重建照片封面索引」頁面（`/admin/rebuild-first-photos`）
- 提供「執行重建」按鈕，呼叫現有 `POST /api/admin/rebuild-photo-index` API
- 顯示執行進度（載入中狀態）與完成結果摘要（日期數、照片數）
- 失敗時顯示錯誤訊息

## Capabilities

### New Capabilities
- `admin-rebuild-first-photos`：後台「重建照片封面索引」操作頁面

### Modified Capabilities
無

## Impact

- 新增 `app/admin/rebuild-first-photos/page.tsx`（Client Component，使用 `NEXT_PUBLIC_ADMIN_SECRET`）
- 複用現有 `POST /api/admin/rebuild-photo-index` 端點，無需修改 API
