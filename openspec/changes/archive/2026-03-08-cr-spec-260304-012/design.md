## Context

目前系統無測試資料清除機制，開發人員只能手動進入 Cloudflare R2 控制台、Firebase Console 逐一刪除。現有管理 API 以 `x-admin-secret` header 保護，已有 `lib/r2.ts`（S3Client）與 firebase-rest.ts（Firestore REST）可複用。

清除對象（以日期為單位）：
- **R2**：`{date}/{device_id}_{ts}.jpg` 原圖（前綴 `{date}/`）
- **Firestore `photos`**：查詢 `date == YYYY-MM-DD` 的所有文件
- **Firestore `photo_index`**：單一文件 `photo_index/{date}`
- **Firestore `error_logs`**：查詢 `date == YYYY-MM-DD` 的文件
- **Firestore `devices`**：清除 `last_photo_url`、`last_shot_at` 欄位（不刪除文件本身）

## Goals / Non-Goals

**Goals:**
- 管理員可在後台 UI 選擇日期 + 清除範圍，點擊執行並看到結果摘要
- API 以 `x-admin-secret` 保護，前端透過環境變數 `NEXT_PUBLIC_ADMIN_SECRET` 傳送
- 各清除目標獨立控制（勾選框），失敗不阻斷其他項目

**Non-Goals:**
- 不刪除 RTDB `sync/server_time`
- 不刪除 R2 thumbnails 快取
- 不支援多日期或全清除

## Decisions

### 決策 1：API 架構 — 單一 endpoint，`targets` 陣列控制範圍

`POST /api/admin/purge-date`
```json
{ "date": "2026-03-08", "targets": ["r2", "photos", "photo_index", "error_logs", "devices"] }
```
回傳各 target 的清除結果（成功筆數或 error）。

**選項 A**：多個 endpoint（`/purge-r2`, `/purge-photos`...）— 前端需多次呼叫，邏輯分散
**選項 B（選定）**：單一 endpoint + targets 陣列 — 原子性較佳，單次 HTTP 呼叫

### 決策 2：R2 批次刪除 — ListObjectsV2 + DeleteObjects

`@aws-sdk/client-s3` 已安裝。流程：
1. `ListObjectsV2Command({ Prefix: "{date}/" })` — 取得所有 key（最多 1000，測試資料不會超過）
2. `DeleteObjectsCommand({ Delete: { Objects: [...] } })` — 批次刪除

### 決策 3：Firestore 文件刪除 — REST API 逐一刪除

Firestore REST API 無批次刪除端點。流程：
1. 以 structured query 查詢 `date == YYYY-MM-DD` 的 `photos` 文件
2. 逐一 `DELETE https://firestore.googleapis.com/.../documents/{collection}/{id}`

`photo_index/{date}` 直接 DELETE 單一文件。`devices` 改用 PATCH 清除特定欄位。

### 決策 4：前端 — Client Component + fetch 呼叫 API

後台 `/admin/data-cleanup` 為 Client Component（需要 state、互動）。
- `NEXT_PUBLIC_ADMIN_SECRET` 環境變數供前端傳 header
- 顯示各 target 清除結果（筆數 / 錯誤訊息）

### 決策 5：`devices` 清除策略 — PATCH 清空欄位而非刪除文件

刪除 `devices/{deviceId}` 文件會造成裝置下次心跳時重建，行為一致。但為保留裝置 ID 紀錄，改以 PATCH 將 `last_photo_url`、`last_shot_at` 設為 null。

## Risks / Trade-offs

- **R2 1000 筆限制**：`ListObjectsV2` 單次最多 1000 物件。測試資料量不會達到此上限，若未來需要可加分頁。
- **Firestore 逐一刪除較慢**：Edge Runtime 無法平行化太多 fetch，大量文件（>100）可能超時。可接受，清除測試資料量有限。
- **NEXT_PUBLIC_ADMIN_SECRET 暴露**：前端環境變數可被用戶看到。本功能為內部管理工具，可接受；未來可改為 session cookie 保護。
