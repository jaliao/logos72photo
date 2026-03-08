## 1. `queryPhotoIndex` 加入日期範圍過濾

- [ ] 1.1 `lib/firebase-rest.ts`：`queryPhotoIndex()` 新增可選參數 `startDate?: string`、`endDate?: string`
- [ ] 1.2 在 `.sort()` 前加入 `.filter()`：`date >= startDate`（若有設定）且 `date <= endDate`（若有設定）

## 2. 首頁讀取環境變數並傳入

- [ ] 2.1 `app/page.tsx`：讀取 `process.env.NEXT_PUBLIC_GALLERY_START_DATE`
- [ ] 2.2 `app/page.tsx`：讀取 `process.env.NEXT_PUBLIC_GALLERY_END_DATE`；未設定時計算台灣今日（`new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)`）
- [ ] 2.3 `app/page.tsx`：將 `startDate` / `endDate` 傳入 `queryPhotoIndex()`

## 3. 版本與文件更新

- [ ] 3.1 `config/version.json` patch 版號 +1
- [ ] 3.2 更新 `README-AI.md`：版本號、業務邏輯說明、當前任務狀態
