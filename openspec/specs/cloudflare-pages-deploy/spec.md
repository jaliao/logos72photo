## ADDED Requirements

### Requirement: 專案可透過 next-on-pages 建置

專案 SHALL 能以 `@cloudflare/next-on-pages` 適配器成功建置，產出 Cloudflare Pages 相容的靜態與 Edge Worker 輸出。

#### Scenario: 建置成功
- **WHEN** 執行 `npm run pages:build`
- **THEN** 建置過程無錯誤完成，且 `.vercel/output/` 目錄存在

#### Scenario: 建置指令已定義
- **WHEN** 查看 `package.json` 的 `scripts`
- **THEN** 包含 `pages:build`（執行 `next-on-pages`）及 `pages:deploy`（執行 `wrangler pages deploy`）兩個指令

---

### Requirement: API routes 執行於 Edge Runtime

所有 API routes（`/api/trigger`、`/api/upload`、`/api/heartbeat`）SHALL 宣告 `export const runtime = 'edge'`，以相容 Cloudflare Workers 執行環境。

#### Scenario: trigger API 使用 Edge Runtime
- **WHEN** 讀取 `app/api/trigger/route.ts`
- **THEN** 檔案頂層包含 `export const runtime = 'edge'`

#### Scenario: upload API 使用 Edge Runtime
- **WHEN** 讀取 `app/api/upload/route.ts`
- **THEN** 檔案頂層包含 `export const runtime = 'edge'`

#### Scenario: heartbeat API 使用 Edge Runtime
- **WHEN** 讀取 `app/api/heartbeat/route.ts`
- **THEN** 檔案頂層包含 `export const runtime = 'edge'`

---

### Requirement: firebase-admin 已從 API routes 移除

API routes SHALL 不直接 import `firebase-admin` 或 `firebase-admin/*` 任何模組。

#### Scenario: trigger API 不含 firebase-admin
- **WHEN** 讀取 `app/api/trigger/route.ts`
- **THEN** 不含任何 `firebase-admin` import 語句

#### Scenario: upload API 不含 firebase-admin
- **WHEN** 讀取 `app/api/upload/route.ts`
- **THEN** 不含任何 `firebase-admin` import 語句

#### Scenario: heartbeat API 不含 firebase-admin
- **WHEN** 讀取 `app/api/heartbeat/route.ts`
- **THEN** 不含任何 `firebase-admin` import 語句

---

### Requirement: Firebase REST 封裝模組存在

`lib/firebase-rest.ts` SHALL 封裝以下功能，且所有實作僅使用 Web 標準 API（`fetch`、`SubtleCrypto`）：
- 以 Service Account 私鑰產生 Google OAuth2 access token
- Firestore REST：新增文件（`POST .../documents`）、更新文件（`PATCH .../documents/:id`）
- RTDB REST：寫入節點（`PUT .../path.json`）

#### Scenario: 模組存在且無 Node.js 原生依賴
- **WHEN** 讀取 `lib/firebase-rest.ts`
- **THEN** 檔案存在，且不含 `require('crypto')`、`require('net')`、`require('tls')` 等 Node.js 原生模組

#### Scenario: access token 產生使用 SubtleCrypto
- **WHEN** 讀取 `lib/firebase-rest.ts`
- **THEN** 使用 `crypto.subtle.importKey` 或 `crypto.subtle.sign` 進行 JWT 簽署

---

### Requirement: Buffer 用法已替換為 Edge Runtime 相容寫法

`app/api/upload/route.ts` SHALL 不使用 Node.js `Buffer`，改用 `Uint8Array` 或 `ArrayBuffer` 操作二進位資料。

#### Scenario: upload API 不使用 Buffer
- **WHEN** 讀取 `app/api/upload/route.ts`
- **THEN** 不含 `Buffer.from(` 或 `Buffer.alloc(` 的呼叫

---

### Requirement: 本機 wrangler 開發環境變數範本存在

`.dev.vars.example` SHALL 存在於專案根目錄，列出所有在 Cloudflare Pages 本機開發（`wrangler pages dev`）時需要的環境變數名稱（值為空或假值）。

#### Scenario: 範本檔案存在
- **WHEN** 查看專案根目錄
- **THEN** `.dev.vars.example` 檔案存在

#### Scenario: 範本包含所有必要變數
- **WHEN** 讀取 `.dev.vars.example`
- **THEN** 包含以下所有 key：`NEXT_PUBLIC_FIREBASE_API_KEY`、`NEXT_PUBLIC_FIREBASE_DATABASE_URL`、`FIREBASE_ADMIN_PROJECT_ID`、`FIREBASE_ADMIN_CLIENT_EMAIL`、`FIREBASE_ADMIN_PRIVATE_KEY`、`R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET_NAME`、`R2_PUBLIC_URL`、`TRIGGER_API_SECRET`

---

### Requirement: Cloudflare Pages 部署成功

應用程式 SHALL 能在 Cloudflare Pages 上成功部署並透過 `*.pages.dev` URL 存取。

#### Scenario: 首頁可正常顯示
- **WHEN** 瀏覽 `https://logos72photo.pages.dev`
- **THEN** 頁面顯示日期選擇器與三個時段按鈕，HTTP 狀態 200

#### Scenario: trigger API 可正常呼叫
- **WHEN** 以正確 `x-trigger-secret` 向 `https://logos72photo.pages.dev/api/trigger` 發送 POST
- **THEN** 回傳 `{"ok": true, "triggered_at": <timestamp>}`，HTTP 狀態 200

#### Scenario: 錯誤金鑰被拒絕
- **WHEN** 以錯誤或缺少 `x-trigger-secret` 向 `/api/trigger` 發送 POST
- **THEN** 回傳 HTTP 狀態 401
