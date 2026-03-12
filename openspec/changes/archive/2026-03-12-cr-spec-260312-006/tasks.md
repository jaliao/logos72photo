## 1. 建立後台頁面

- [x] 1.1 建立 `app/admin/rebuild-first-photos/page.tsx`（`'use client'`），包含說明文字、「執行重建」按鈕、載入狀態、結果摘要區塊
- [x] 1.2 實作 `handleRebuild()`：檢查 `NEXT_PUBLIC_ADMIN_SECRET` 是否設定，未設定時顯示錯誤並中止
- [x] 1.3 實作 API 呼叫：`POST /api/admin/rebuild-photo-index`，帶 `x-admin-secret` header，按鈕執行期間設為 disabled
- [x] 1.4 成功時顯示 `message` 文字，並以 `<details>` 展示各日期明細（`results[]`）
- [x] 1.5 失敗時顯示紅色錯誤訊息，按鈕恢復可點擊

## 2. 版本與文件更新

- [x] 2.1 將 `config/version.json` 的 `patch` 版號 +1
- [x] 2.2 依照 `.ai-rules.md` 重新產生 `README-AI.md`，反映本次新增後台頁面
