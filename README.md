# logos72photo — 開發測試說明書

讀經接力 72 小時自動拍照與照片管理系統。

---

## 目錄

1. [前置需求](#前置需求)
2. [環境變數設定](#環境變數設定)
3. [啟動開發伺服器](#啟動開發伺服器)
4. [開發工具腳本](#開發工具腳本)
5. [功能測試指南](#功能測試指南)
   - [首頁（照片瀏覽入口）](#首頁照片瀏覽入口)
   - [相機頁面（iPhone PWA）](#相機頁面iphone-pwa)
   - [觸發 API](#觸發-api)
   - [監控儀表板](#監控儀表板)
6. [外部服務未就緒時的測試方式](#外部服務未就緒時的測試方式)
7. [常見錯誤排查](#常見錯誤排查)

---

## 前置需求

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 執行環境 |
| npm | 9+ | 套件管理 |
| Firebase 專案 | — | Firestore + RTDB |
| Cloudflare R2 Bucket | — | 照片儲存 |

> 若尚未建立 Firebase 或 R2，請先參考 [外部服務未就緒時的測試方式](#外部服務未就緒時的測試方式)。

---

## 環境變數設定

### 步驟 1：複製範本

```bash
cp .env.local.example .env.local
```

### 步驟 2：填入 Firebase 設定

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的專案 → **專案設定** → **您的應用程式**
3. 複製 SDK 設定（`firebaseConfig` 物件）並填入以下欄位：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=yourproject
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://yourproject-default-rtdb.asia-southeast1.firebasedatabase.app
```

### 步驟 3：填入 Firebase Admin SDK（觸發 API 用）

1. Firebase Console → **專案設定** → **服務帳戶**
2. 點擊「**產生新的私鑰**」→ 下載 JSON 檔案
3. 從 JSON 中取出對應欄位：

```env
FIREBASE_ADMIN_PROJECT_ID=yourproject
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@yourproject.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
```

> ⚠️ `FIREBASE_ADMIN_PRIVATE_KEY` 的換行符必須寫成 `\n`，整個值用雙引號包住。

### 步驟 4：填入 Cloudflare R2 設定

1. Cloudflare Dashboard → **R2** → **管理 R2 API 權杖**
2. 建立具有 Bucket 讀寫權限的 API 權杖：

```env
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=logos72photo
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### 步驟 5：設定觸發安全金鑰

自行產生任意隨機字串（例如用 `openssl rand -hex 32`）：

```env
TRIGGER_API_SECRET=your_random_secret_here
```

### 步驟 6：設定裝置 ID（測試用）

```env
NEXT_PUBLIC_DEVICE_ID=iphone-test
```

---

## 啟動開發伺服器

```bash
npm install
npm run dev
```

伺服器啟動後，開啟 [http://localhost:3000](http://localhost:3000)

---

## 開發工具腳本

`scripts/` 目錄內有三支輔助腳本，方便在開發與測試期間使用。

---

### `scripts/trigger.sh` — 手動觸發拍照

發送一次拍照指令給所有在線的相機頁面。Secret 自動從 `.env.local` 讀取。

```bash
# 觸發本機 dev server
./scripts/trigger.sh

# 觸發正式環境
./scripts/trigger.sh https://logos72photo.pages.dev
```

**預期輸出：**
```json
{
    "ok": true,
    "triggered_at": 1708481234567
}
```

**適用情境：** 測試相機頁面是否正確回應觸發、驗證端對端流程。

---

### `scripts/cron-local.sh` — 本機模擬自動拍照 Cron

每 5 分鐘自動呼叫一次 `trigger.sh`，在正式 Cloudflare Worker 部署前模擬自動觸發。

```bash
./scripts/cron-local.sh
```

**輸出範例：**
```
本機 Cron 啟動（每 300 秒觸發一次）
停止請按 Ctrl+C
────────────────────────────────
[14:00:00] 觸發拍照... "ok":true
下次觸發：14:05:00
```

按 **Ctrl+C** 停止。

**適用情境：** 活動正式開始前的本機完整流程測試；正式部署後改由 Cloudflare Worker Cron 接管。

> ⚠️ 需同時在另一個終端機執行 `npm run dev`。

---

### `scripts/test-r2.mjs` — Cloudflare R2 連線診斷

驗證 R2 憑證設定是否正確，並測試實際上傳一個小檔案。

```bash
node scripts/test-r2.mjs
```

**成功輸出：**
```
── R2 診斷 ──────────────────────────
Account ID  : abc123...  (32 字元，應為 32)
Access Key  : d218bf***
Bucket      : logos72photo
Endpoint    : https://abc123....r2.cloudflarestorage.com
─────────────────────────────────────

正在測試上傳一個小檔案...
✅ 上傳成功！R2 連線正常。
```

**常見錯誤提示：**

| 錯誤 | 原因 | 解法 |
|------|------|------|
| `R2_ACCOUNT_ID 長度不對` | 填了 API Key 而非帳號 ID | 從 Cloudflare Dashboard 右上角複製 32 字元帳號 ID |
| `InvalidAccessKeyId` | Access Key 錯誤 | 重新產生 R2 API 權杖 |
| `SignatureDoesNotMatch` | Secret Key 錯誤 | 重新產生 R2 API 權杖 |
| `NoSuchBucket` | Bucket 不存在 | 在 Cloudflare Dashboard 建立 Bucket |

**適用情境：** 初次設定 R2 時、遇到上傳失敗 SSL 錯誤時。

---

## 功能測試指南

### 首頁（照片瀏覽入口）

**URL：** `http://localhost:3000`

**測試步驟：**
1. 確認頁面顯示日期選擇器與三個時段按鈕
2. 選擇今天的日期
3. 點擊任一時段按鈕（例如「08:00 – 16:00」）
4. 確認跳轉至 `http://localhost:3000/gallery/YYYY-MM-DD/8`
5. 確認顯示 32 個 15 分鐘子相簿格子（無照片時顯示灰色）

**預期結果：** 無照片時顯示灰色格子，有照片時格子變深色並標示「有照片」。

---

### 相機頁面（iPhone PWA）

**URL：** `http://localhost:3000/camera`

> 💡 在桌機瀏覽器測試時，相機預覽會請求使用電腦的攝影機。

**測試步驟：**
1. 開啟頁面，允許瀏覽器存取攝影機
2. 確認畫面顯示相機預覽
3. 確認底部狀態列顯示：
   - 裝置 ID（例如 `iphone-test`）
   - 心跳燈（綠色閃爍點）
   - 狀態：`待機中`
4. 測試手動觸發（見下方「觸發 API」段落）
5. 觸發後確認：
   - 狀態短暫變為「拍照中...」→「上傳中...」→「待機中」
   - 畫面出現**綠色邊框閃爍**（約 1.5 秒）
   - 「最後拍照」時間更新

**在 iPhone 上測試 PWA：**
1. 用 iPhone Safari 開啟 `http://<你的電腦 IP>:3000/camera`
2. 點擊下方分享按鈕 → 「加入主畫面」
3. 從主畫面開啟 → 確認以全螢幕模式運行

---

### 觸發 API

**URL：** `POST http://localhost:3000/api/trigger`

**使用 curl 測試：**

```bash
curl -X POST http://localhost:3000/api/trigger \
  -H "x-trigger-secret: your_random_secret_here"
```

**預期回應：**
```json
{ "ok": true, "triggered_at": 1708481234567 }
```

**驗證效果：**
- 同時開著相機頁面（`/camera`），觸發後應在 1 秒內看到拍照動作
- 觸發後在 Firestore `photos` 集合確認新增了一筆記錄

**錯誤情境測試：**
```bash
# 無金鑰 → 應回傳 401
curl -X POST http://localhost:3000/api/trigger

# 錯誤金鑰 → 應回傳 401
curl -X POST http://localhost:3000/api/trigger \
  -H "x-trigger-secret: wrong_secret"
```

---

### 照片上傳 API（直接測試）

**URL：** `POST http://localhost:3000/api/upload`

```bash
# 用任意圖片檔測試上傳
curl -X POST http://localhost:3000/api/upload \
  -F "photo=@/path/to/test.jpg" \
  -F "device_id=iphone-test"
```

**預期回應：**
```json
{ "ok": true, "url": "https://pub-xxx.r2.dev/2026-02-21/iphone-test_1708481234567.jpg" }
```

**驗證：**
- 在 R2 Bucket 確認檔案存在於 `YYYY-MM-DD/` 路徑下
- 在 Firestore `photos` 集合確認新增了含 `slot_8h`、`slot_15m` 的記錄

---

### 監控儀表板

**URL：** `http://localhost:3000/admin/monitoring`

**測試步驟：**
1. 先透過相機頁面產生至少一筆心跳資料
2. 開啟儀表板確認顯示裝置卡片
3. 確認卡片包含：
   - 裝置名稱（`iphone-test`）
   - 電量進度條
   - 最後心跳時間
   - 最新照片縮圖（需先上傳至少一張照片）
4. 若超過 5 分鐘未收到心跳，裝置狀態應顯示紅色「失聯」

---

## 外部服務未就緒時的測試方式

若 Firebase 或 R2 尚未建立，仍可測試 **UI 佈局與頁面路由**：

### 方法：填入假設定值

在 `.env.local` 中填入假值（不會連線，但可讓 Next.js 啟動）：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=fake-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fake.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fake-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fake.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000:web:000000
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://fake-project-default-rtdb.firebaseio.com

R2_ACCOUNT_ID=fake
R2_ACCESS_KEY_ID=fake
R2_SECRET_ACCESS_KEY=fake
R2_BUCKET_NAME=fake-bucket
R2_PUBLIC_URL=https://fake.r2.dev

FIREBASE_ADMIN_PROJECT_ID=fake-project
FIREBASE_ADMIN_CLIENT_EMAIL=fake@fake.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0fake\n-----END RSA PRIVATE KEY-----\n"

TRIGGER_API_SECRET=dev-secret-for-testing
NEXT_PUBLIC_DEVICE_ID=iphone-test
```

**可測試的項目（不需真實服務）：**
- ✅ 首頁 UI 與時段按鈕
- ✅ 相機頁面畫面（需允許攝影機）
- ✅ 相簿列表頁面路由（`/gallery/2026-02-21/8`）
- ✅ 儀表板頁面（顯示空狀態）
- ❌ 實際拍照上傳（需 R2）
- ❌ 照片顯示（需 Firestore + R2）
- ❌ 跨裝置觸發同步（需 RTDB）

---

## 常見錯誤排查

| 錯誤訊息 | 原因 | 解法 |
|---------|------|------|
| `FIREBASE FATAL ERROR: Can't determine Firebase Database URL` | `NEXT_PUBLIC_FIREBASE_DATABASE_URL` 未設定 | 在 `.env.local` 填入 RTDB URL |
| `401 未授權` (觸發 API) | `x-trigger-secret` 標頭缺失或錯誤 | 確認 header 與 `.env.local` 的 `TRIGGER_API_SECRET` 一致 |
| 相機頁面無畫面 | 瀏覽器未允許攝影機 | 點擊網址列旁的攝影機圖示 → 允許 |
| R2 上傳 403 | API 金鑰權限不足 | 確認 R2 API 權杖有 Bucket 的讀寫權限 |
| `Cannot find module 'nosleep.js'` | 相依套件未安裝 | `npm install` |
| Firestore 查詢無回傳 | 缺少複合索引 | Firebase Console → Firestore → 索引 → 依錯誤提示建立 |

---

## 快速指令速查

```bash
# 安裝相依套件
npm install

# 啟動開發伺服器
npm run dev

# 型別檢查
npx tsc --noEmit

# Lint 檢查
npm run lint

# 生產環境建置
npm run build

# 測試觸發 API（需先啟動 dev server）
curl -X POST http://localhost:3000/api/trigger \
  -H "x-trigger-secret: $(grep TRIGGER_API_SECRET .env.local | cut -d= -f2)"
```
