## 1. lib/r2.ts — 新增 R2 刪除輔助函式

- [x] 1.1 `lib/r2.ts`：import `ListObjectsV2Command`、`DeleteObjectsCommand` from `@aws-sdk/client-s3`
- [x] 1.2 `lib/r2.ts`：新增 `deleteR2ObjectsByPrefix(prefix: string): Promise<number>` — 列舉並批次刪除指定前綴的所有物件，回傳刪除筆數

## 2. API Route — purge-date

- [x] 2.1 建立 `app/api/admin/purge-date/route.ts`，`runtime = 'edge'`，驗證 `x-admin-secret` header
- [x] 2.2 解析 request body `{ date, targets }`，驗證 `date` 格式（YYYY-MM-DD）
- [x] 2.3 實作 `target: "r2"` — 呼叫 `deleteR2ObjectsByPrefix("{date}/")`
- [x] 2.4 實作 `target: "photos"` — Firestore structured query `date == {date}`，逐一 DELETE 文件
- [x] 2.5 實作 `target: "photo_index"` — DELETE `photo_index/{date}` 文件（404 視為成功）
- [x] 2.6 實作 `target: "error_logs"` — Firestore structured query `date == {date}`，逐一 DELETE 文件
- [x] 2.7 實作 `target: "devices"` — LIST `devices` 集合，逐一 PATCH 將 `last_photo_url`、`last_shot_at` 設為 null
- [x] 2.8 各 target 以 try/catch 包覆，失敗記錄 error message，不阻斷其他 target；最終回傳所有 target 結果

## 3. 後台管理頁面

- [x] 3.1 建立 `app/admin/data-cleanup/page.tsx`（`'use client'`）：日期輸入欄（預設台灣今日）+ 五個目標勾選框
- [x] 3.2 實作「執行清除」按鈕：點擊後顯示確認 `window.confirm()`，確認後呼叫 API（帶 `NEXT_PUBLIC_ADMIN_SECRET`）
- [x] 3.3 執行中禁用按鈕，顯示「清除中…」
- [x] 3.4 顯示各 target 結果摘要（刪除筆數或錯誤訊息）；API 失敗顯示錯誤提示

## 4. 版本與文件更新

- [x] 4.1 `config/version.json` patch 版號 +1
- [x] 4.2 更新 `README-AI.md`：版本號、業務邏輯說明、當前任務狀態
