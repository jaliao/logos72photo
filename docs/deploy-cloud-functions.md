# Firebase Cloud Functions 部署說明

本文件說明如何部署或更新 `functions/` 目錄下的 Firebase Cloud Functions（包含封面合成函式 `generateCover`）。

---

## 函式說明

| 函式 | 觸發條件 | 功能 |
|---|---|---|
| `generateCover` | Firestore `photos/{docId}` onCreate | 該 slotGroup 第一張照片上傳後，自動合成封面底圖並上傳至 R2 `covers/{slotGroup}.jpg` |

封面規格：
- **底圖**：`functions/assets/watermark2.png`（1080×1440）
- **照片嵌入**：cover-crop 843×861，位置 x=118, y=229
- **輸出**：JPEG quality 88

---

## 前置需求

| 工具 | 版本 | 安裝方式 |
|---|---|---|
| Node.js | 20 | `nvm install 20` |
| Firebase CLI | 最新 | `npm install -g firebase-tools` |
| Firebase 登入 | — | `firebase login` |

確認登入狀態：

```bash
firebase projects:list
```

---

## 環境變數設定

Cloud Functions 的環境變數存放於 `functions/.env`（不納入 git，需手動建立）。

```bash
cp functions/.env.example functions/.env   # 若有範本
# 或手動建立
```

`functions/.env` 內容格式：

```env
# Cloudflare R2 設定（與根目錄 .env.local 相同值）
R2_ACCOUNT_ID=<your_account_id>
R2_ACCESS_KEY_ID=<your_access_key>
R2_SECRET_ACCESS_KEY=<your_secret_key>
R2_BUCKET_NAME=logos72photo
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

> ⚠️ `functions/.env` 已加入 `.gitignore`，**請勿 commit 此檔案**。

---

## 部署步驟

### 1. 進入 functions 目錄

```bash
cd functions
```

### 2. 安裝相依套件

```bash
npm install
```

### 3. TypeScript 編譯

```bash
npm run build
```

編譯結果輸出至 `functions/lib/`。確認無 TypeScript 錯誤後繼續。

### 4. 部署至 Firebase

```bash
npm run deploy
# 等同於：firebase deploy --only functions
```

**成功輸出範例：**

```
✔  functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/xxx/overview
```

---

## 更新封面底圖（watermark2.png）

當需要替換封面底圖時：

### 步驟 1：替換圖片

```bash
# 將新底圖放入 assets/（須為 PNG 格式，建議 1080×1440）
cp /path/to/new-watermark.png functions/assets/watermark2.png
```

### 步驟 2：確認合成參數

開啟 `functions/src/generateCover.ts`，確認 `composeCover()` 函式內的嵌入座標與尺寸是否需要調整：

```typescript
// 將照片 cover-crop 至 843×861
.resize(843, 861, { fit: 'cover' })

// 合成至底圖（1080×1440），照片置於 x=118, y=229
.composite([{ input: croppedBuffer, left: 118, top: 229 }])
```

### 步驟 3：重新部署

```bash
cd functions
npm run build && npm run deploy
```

> ⚠️ **已產生的封面不會自動更新。** 新底圖只對部署後觸發的新 slotGroup 生效。若需要重新產生歷史封面，使用根目錄的批次腳本：
>
> ```bash
> # 重新產生指定日期範圍的封面
> node scripts/generate-covers.mjs --from 0325 --to 0328
> ```

---

## 驗證部署

部署後可在 Firebase Console 確認：

1. [Firebase Console](https://console.firebase.google.com/) → 選擇專案 → **函式**
2. 確認 `generateCover` 函式版本已更新（部署時間戳記）
3. 測試：上傳一張新照片，觀察 **函式 → 記錄** 是否出現 `generateCover: covers/XXXXXXXX.jpg 上傳完成`

---

## 常見錯誤

| 錯誤 | 原因 | 解法 |
|---|---|---|
| `Firebase login required` | 未登入 | `firebase login` |
| `Error: Failed to load function definition` | TypeScript 編譯失敗 | 先執行 `npm run build`，修正錯誤 |
| `R2_ACCESS_KEY_ID is undefined` | `functions/.env` 缺少環境變數 | 補齊 `functions/.env` 內容 |
| `covers/XXX.jpg 已存在，跳過` | 冪等保護：封面已存在 | 正常行為；若需強制更新，手動刪除 R2 中的封面檔 |
| `PermissionDenied` (Firestore count) | 服務帳戶權限不足 | Firebase Console → 專案設定 → 服務帳戶，確認 Cloud Functions 服務帳戶有 Firestore 讀取權限 |
