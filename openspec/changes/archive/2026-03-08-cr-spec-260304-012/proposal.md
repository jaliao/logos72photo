## Why

開發與測試過程中會產生大量測試照片與 Firestore 紀錄，目前沒有機制清除，必須手動進入各平台後台逐一刪除。需要一個後台管理頁面，讓管理員能依日期批次清除測試資料（R2 原圖、Firestore photos/photo_index/error_logs、devices 裝置狀態）。

## What Changes

- 新增 `POST /api/admin/purge-date` API route：接受 `date`（`YYYY-MM-DD`）與可選的 `targets`（清除範圍），受 `x-admin-secret` 保護
  - R2：列舉並刪除 `{date}/` 前綴下的所有原圖物件
  - Firestore `photos`：查詢並刪除 `date = YYYY-MM-DD` 的所有文件
  - Firestore `photo_index`：刪除 `photo_index/{date}` 文件
  - Firestore `error_logs`：刪除 `date = YYYY-MM-DD` 的所有文件
  - Firestore `devices`：清除 `last_photo_url`、`last_shot_at`（PATCH 覆寫為 null）
- 新增後台管理頁面 `/admin/data-cleanup`：日期選擇器 + 清除範圍勾選 + 執行按鈕，顯示清除結果摘要

## Capabilities

### New Capabilities
- `admin-data-cleanup`：後台測試資料批次清除功能（API + UI）

### Modified Capabilities
（無）

## Impact

- `app/api/admin/purge-date/route.ts`（新增）
- `app/admin/data-cleanup/page.tsx`（新增）
- `lib/r2.ts`：新增 `deleteR2ObjectsByPrefix()` 輔助函式

## Non-goals

- 不支援清除 RTDB `sync/server_time`（影響時間同步，不應清除）
- 不支援跨多日期批次清除（一次清一天）
- 不提供「清除全部」功能（避免誤刪線上資料）
- 不刪除 R2 thumbnails 快取（由 Image Service 自行管理）
