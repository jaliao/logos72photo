## 1. Firebase Functions 初始化

- [x] 1.1 在專案根目錄執行 `firebase init functions`，選擇 TypeScript、Node.js 18+
- [x] 1.2 安裝依賴：`cd functions && npm install sharp @aws-sdk/client-s3`
- [x] 1.3 將 `public/watermark2.png` 複製至 `functions/assets/watermark2.png`

## 2. Cloud Function 實作

- [x] 2.1 建立 `functions/src/generateCover.ts`：定義 Firestore `photos/{docId}` onCreate 觸發器
- [x] 2.2 實作「判斷是否第一張」邏輯：查詢 Firestore 該 `slot_group` 的照片數量，count > 1 則跳過
- [x] 2.3 實作冪等保護：查詢 R2 `covers/{slotGroup}.jpg` 是否已存在，已存在則跳過
- [x] 2.4 實作圖像合成：下載原圖 → sharp cover-crop 844×861 → composite 至底圖 (x=117, y=229) → JPEG quality 88
- [x] 2.5 實作 R2 上傳：`PutObjectCommand` 上傳至 `covers/{slotGroup}.jpg`
- [x] 2.6 實作錯誤處理：下載或合成失敗時 `console.error` 記錄，不拋出例外

## 3. R2 環境變數設定

- [x] 3.1 將 R2 憑證（`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`）設定至 Firebase Functions 環境（`.env` 或 Secret Manager）

## 4. 部署與驗證

- [x] 4.1 執行 `firebase deploy --only functions` 部署 Cloud Function
- [ ] 4.2 上傳一張測試照片，確認 R2 `covers/` 下出現對應 `.jpg`
- [ ] 4.3 再次上傳同 slotGroup 照片，確認不重複生成（冪等性驗證）

## 5. 本機批次補齊腳本

- [x] 5.1 建立 `scripts/generate-covers.mjs`：讀取 CLI 參數 `--from`/`--to`（MMDD 格式）
- [x] 5.2 實作 Firestore REST 查詢：取得各 slotGroup 的第一張照片 URL
- [x] 5.3 實作 sharp 合成流程（與 Cloud Function 相同邏輯）並上傳 R2
- [ ] 5.4 執行腳本補齊現有歷史 slotGroup 封面，驗證結果

## 6. 版號與文件

- [x] 6.1 更新 `config/version.json` patch 版號 +1
- [x] 6.2 更新 `README-AI.md`
