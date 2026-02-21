# logos72photo — 開發測試說明書

讀經接力 72 小時自動拍照與照片管理系統。

---

## 目錄

1. [前置需求](#前置需求)
2. [環境變數設定](#環境變數設定)
3. [Firebase RTDB 設定](#firebase-rtdb-設定)
4. [Cloudflare Worker Cron 部署](#cloudflare-worker-cron-部署)
5. [啟動開發伺服器](#啟動開發伺服器)
6. [開發工具腳本](#開發工具腳本)
7. [功能測試指南](#功能測試指南)
   - [首頁（照片瀏覽入口）](#首頁照片瀏覽入口)
   - [相機頁面（iPhone PWA）](#相機頁面iphone-pwa)
   - [觸發 API](#觸發-api)
   - [監控儀表板](#監控儀表板)
8. [iPhone 開機步驟](#iphone-開機步驟)
9. [觸發鏈路除錯指南](#觸發鏈路除錯指南)
10. [部署至 Cloudflare Pages](#部署至-cloudflare-pages)
11. [外部服務未就緒時的測試方式](#外部服務未就緒時的測試方式)
12. [常見錯誤排查](#常見錯誤排查)

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

## Firebase RTDB 設定

自動拍照觸發機制依賴 Firebase **Realtime Database（RTDB）**。相機頁面透過 Firebase Client SDK 監聽 `trigger/last_shot` 節點，伺服器每 5 分鐘更新此節點，iPhone 收到更新即觸發拍照。

> ⚠️ **最常見的不拍照原因**：RTDB 安全規則預設鎖定，客戶端讀不到觸發值。請務必完成以下設定。

---

### 步驟 1：啟用 Realtime Database

1. 前往 [Firebase Console](https://console.firebase.google.com/) → 選擇你的專案
2. 左側選單 → **建構** → **Realtime Database**
3. 點擊「**建立資料庫**」
4. 選擇位置：**asia-southeast1（新加坡）**
5. 安全規則模式：選「**以鎖定模式啟動**」（之後手動設定）
6. 建立完成後，複製資料庫 URL（格式如：`https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app`）

---

### 步驟 2：設定安全規則（必要）

1. Firebase Console → **Realtime Database** → 上方分頁「**規則**」
2. 將規則**完整替換**為以下內容：

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "trigger": {
      "last_shot": {
        ".read": true,
        ".write": false
      }
    }
  }
}
```

3. 點擊「**發布**」

**規則說明：**
| 節點 | 讀 | 寫 |
|------|----|----|
| `trigger/last_shot` | ✅ 公開（iPhone 相機頁面讀取） | ❌ 僅 Server（Admin SDK 繞過規則） |
| 其他所有節點 | ❌ 禁止 | ❌ 禁止 |

> 💡 Server 端（`/api/trigger`）使用 Service Account OAuth2 token 寫入，Firebase Admin 權限可繞過安全規則，不受 `".write": false` 限制。

---

### 步驟 3：確認環境變數

在 Cloudflare Pages 環境變數（以及本機 `.env.local`）確認以下設定：

```env
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app
```

> ⚠️ URL 結尾**不能有斜線**，且必須與 Firebase Console 顯示的 URL 完全一致。

---

### 步驟 4：驗證 RTDB 連線

手動觸發一次，觀察 RTDB 是否有更新：

```bash
# 觸發正式環境（填入你的 TRIGGER_API_SECRET）
curl -X POST https://logos72photo.pages.dev/api/trigger \
  -H "x-trigger-secret: YOUR_SECRET"
```

**預期回應：**
```json
{ "ok": true, "triggered_at": 1708481234567 }
```

觸發後至 Firebase Console → Realtime Database → **資料** 分頁，確認 `trigger/last_shot` 節點有更新為最新時間戳記。

如果 iPhone 相機頁面狀態列的「RTDB 觸發：」欄位有更新時間，表示 RTDB 設定正確。

---

## Cloudflare Worker Cron 部署

Cron Worker 負責每 5 分鐘自動呼叫 `/api/trigger`，是自動拍照的驅動引擎。**未部署 Worker 則必須手動觸發。**

---

### 步驟 1：安裝 Wrangler 並登入

```bash
npm install -g wrangler
wrangler login
```

### 步驟 2：設定 Secret（安全金鑰）

```bash
wrangler secret put TRIGGER_API_SECRET
# 輸入與 Cloudflare Pages 環境變數相同的 TRIGGER_API_SECRET 值
```

### 步驟 3：確認 `wrangler.toml` 設定

```toml
name = "logos72photo-cron"
main = "workers/cron-trigger.ts"
compatibility_date = "2024-01-01"

[triggers]
crons = ["*/5 * * * *"]   # 每 5 分鐘

[vars]
TRIGGER_API_URL = "https://logos72photo.pages.dev/api/trigger"
```

### 步驟 4：部署 Worker

```bash
wrangler deploy workers/cron-trigger.ts
```

**成功輸出範例：**
```
✅ Successfully published your Worker to https://logos72photo-cron.your-account.workers.dev
```

### 步驟 5：確認 Cron 正常執行

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → `logos72photo-cron`
2. 點擊「**Logs**」→「**Begin log stream**」
3. 等待下一個 5 分鐘整點（xx:00, xx:05, xx:10...）
4. 確認 log 出現：`拍照觸發成功：2026-02-21T...`

> 如果 log 顯示錯誤 `401`，表示 `TRIGGER_API_SECRET` 與 Pages 環境變數不一致，重新執行 `wrangler secret put TRIGGER_API_SECRET`。

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

## iPhone 開機步驟

**正式環境網址：**

| 頁面 | URL |
|------|-----|
| 首頁 | https://logos72photo.pages.dev/ |
| **相機 1（iphone-1 專用）** | **https://logos72photo.pages.dev/camera1** |
| **相機 2（iphone-2 專用）** | **https://logos72photo.pages.dev/camera2** |
| 監控儀表板 | https://logos72photo.pages.dev/admin/monitoring |

> 每台 iPhone 有獨立網址，device_id 已硬綁定，不會混淆。

---

### 首次設定（每台 iPhone 僅需做一次）

#### iphone-1 首次設定

1. 用 **Safari** 開啟：`https://logos72photo.pages.dev/camera1`
2. 頁面顯示安裝引導（「尚未加入主畫面？」）
3. 點擊下方工具列的「**分享**」圖示（`□↑`）→「**加入主畫面**」
4. 名稱確認為「**接力相機 1**」→ 點「**新增**」
5. 回到主畫面，確認出現「接力相機 1」圖示

#### iphone-2 首次設定

1. 用 **Safari** 開啟：`https://logos72photo.pages.dev/camera2`
2. 頁面顯示安裝引導（「尚未加入主畫面？」）
3. 點擊下方工具列的「**分享**」圖示（`□↑`）→「**加入主畫面**」
4. 名稱確認為「**接力相機 2**」→ 點「**新增**」
5. 回到主畫面，確認出現「接力相機 2」圖示

> ⚠️ **重複加入防護：** 在 Safari 中直接開啟相機網址只會顯示安裝引導，不會啟動相機。相機功能只在從主畫面圖示開啟（standalone PWA 模式）時才會啟動，防止多個視窗同時搶佔同一 device_id。

---

### 每次開機步驟（活動當天）

#### iphone-1

| 步驟 | 操作 |
|------|------|
| 1 | 解除螢幕鎖定 |
| 2 | 點開主畫面上的「**接力相機 1**」圖示 |
| 3 | 確認出現黑色全螢幕相機畫面（鏡頭即時預覽） |
| 4 | **點觸螢幕任一處**（觸發防休眠，必要步驟！） |
| 5 | 確認底部狀態列顯示：裝置 `iphone-1`、綠色閃爍點 |
| 6 | 狀態顯示「**待機中**」→ 開機完成 |

#### iphone-2

| 步驟 | 操作 |
|------|------|
| 1 | 解除螢幕鎖定 |
| 2 | 點開主畫面上的「**接力相機 2**」圖示 |
| 3 | 確認出現黑色全螢幕相機畫面（鏡頭即時預覽） |
| 4 | **點觸螢幕任一處**（觸發防休眠，必要步驟！） |
| 5 | 確認底部狀態列顯示：裝置 `iphone-2`、綠色閃爍點 |
| 6 | 狀態顯示「**待機中**」→ 開機完成 |

---

### 確認兩台均正常上線

開啟監控儀表板：**https://logos72photo.pages.dev/admin/monitoring**

**預期畫面：**
- `iphone-1` 卡片 → 綠色「連線中」、電量顯示、心跳時間正常
- `iphone-2` 卡片 → 綠色「連線中」、電量顯示、心跳時間正常

> 心跳每 30 秒更新一次，若超過 5 分鐘未更新，該裝置卡片會變紅（「失聯」）。

---

### 活動中注意事項

| 事項 | 說明 |
|------|------|
| **螢幕常亮** | 設定 → 螢幕顯示與亮度 → 自動鎖定 → **永不** |
| **不要切換 app** | 切換至背景後 iOS 可能暫停相機，請保持 app 在前景 |
| **相機背景變紅** | 表示超過 5 分鐘未收到拍照指令，請依[觸發鏈路除錯指南](#觸發鏈路除錯指南)排查 |
| **電量監控** | 監控儀表板顯示即時電量，電量低於 10% 時建議立即接上電源 |

---

## 觸發鏈路除錯指南

自動拍照的完整觸發鏈路：

```
Cloudflare Worker Cron（每 5 分鐘）
  → POST /api/trigger（帶 x-trigger-secret）
  → Firebase RTDB trigger/last_shot 更新
  → iPhone 相機頁面收到 RTDB 推送
  → 執行拍照 → 上傳至 R2 → 寫入 Firestore
```

### 各環節檢查方式

| 環節 | 檢查方式 |
|------|---------|
| **Cron Worker** | Cloudflare Dashboard → **Workers & Pages** → `logos72photo-cron` → **Logs** → 確認每 5 分鐘有成功執行紀錄 |
| **觸發 API** | 手動呼叫（見下方），確認回傳 `{"ok":true}` |
| **RTDB 更新** | Firebase Console → Realtime Database → 確認 `trigger/last_shot` 值有隨時間遞增 |
| **iPhone 監聽端** | 觀察相機頁面（`/camera`）狀態列的「**RTDB 觸發**」欄位是否有更新時間 |

**手動呼叫觸發 API（用於隔離測試）：**

```bash
# 觸發本機 dev server
curl -X POST http://localhost:3000/api/trigger \
  -H "x-trigger-secret: $(grep TRIGGER_API_SECRET .env.local | cut -d= -f2)"

# 觸發正式環境
curl -X POST https://logos72photo.pages.dev/api/trigger \
  -H "x-trigger-secret: YOUR_SECRET"
```

### 如何區分問題來源

| 現象 | 問題所在 | 建議行動 |
|------|---------|---------|
| 相機頁面「RTDB 觸發」欄位**時間沒有更新** | Cron/API 端 | 1. 確認 Worker 是否部署：`wrangler deploy workers/cron-trigger.ts` <br>2. 確認 Worker secret 是否設定：`wrangler secret put TRIGGER_API_SECRET` <br>3. 手動呼叫 `/api/trigger` 測試 API 本身是否正常 |
| 相機頁面「RTDB 觸發」欄位**有更新**但沒有拍照 | iPhone 監聽端 | 1. 確認瀏覽器已允許攝影機權限 <br>2. 確認頁面未在背景被 iOS 暫停（保持螢幕常亮） <br>3. 確認「最後 RTDB 觸發」時間與「最後拍照」時間差距是否合理 |
| 相機背景**變紅**（`⚠️ 超過 5 分鐘未收到拍照指令`） | 超過 5 分鐘未收到新的有效 RTDB 觸發 | 依上表逐層排查 |

---

## 部署至 Cloudflare Pages

本專案透過 **GitHub 整合**實現 push-to-deploy：每次 `git push main` 時 Cloudflare Pages 自動觸發 build 與 deploy。

### 首次設定

1. **建立 Pages project**
   - Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
   - 選擇此 GitHub repository

2. **設定 Build configuration**

   | 欄位 | 值 |
   |------|-----|
   | Framework preset | `None`（手動設定） |
   | Build command | `npm run pages:build` |
   | Build output directory | `.vercel/output/static` |
   | Root directory | `/` |

3. **啟用 Node.js 相容性 flag**
   - Pages project → **Settings** → **Functions** → **Compatibility flags**
   - Production 欄位加入：`nodejs_compat`
   - > ⚠️ 此步驟必須完成，否則 `@aws-sdk/client-s3` 會在 Edge Runtime 報錯

4. **設定環境變數**
   - Pages project → **Settings** → **Environment variables** → **Production**
   - 依 `.dev.vars.example` 加入所有 key/value（以 Encrypted 儲存 secrets）

4. **完成首次部署**
   ```bash
   git push origin main
   ```
   推送後 Cloudflare Dashboard 將自動開始 build，約 1–2 分鐘完成。

### 日常部署

```bash
git push origin main   # 自動觸發 Cloudflare Pages build + deploy
```

### 本機 Cloudflare 環境測試（選做）

```bash
cp .dev.vars.example .dev.vars   # 填入真實值
npm run pages:build              # 建置 Cloudflare 產出
npm run pages:dev                # 本機以 wrangler 模擬 Pages 環境
```

### 手動部署（不透過 GitHub）

```bash
npm run pages:build
npm run pages:deploy
```

> ⚠️ 需先以 `wrangler login` 完成 Cloudflare 認證。

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

# Cloudflare Pages 建置（next-on-pages）
npm run pages:build

# 本機 Cloudflare Pages 環境（wrangler）
npm run pages:dev

# 手動部署至 Cloudflare Pages
npm run pages:deploy

# 測試觸發 API（本機 dev server）
curl -X POST http://localhost:3000/api/trigger \
  -H "x-trigger-secret: $(grep TRIGGER_API_SECRET .env.local | cut -d= -f2)"

# 測試觸發 API（wrangler pages dev）
curl -X POST http://localhost:8788/api/trigger \
  -H "x-trigger-secret: $(grep TRIGGER_API_SECRET .dev.vars | cut -d= -f2)"
```
