## 1. 安裝依賴與建置設定

- [x] 1.1 安裝 `@cloudflare/next-on-pages` 與 `wrangler` 至 `devDependencies`
- [x] 1.2 在 `next.config.ts` 加入 `@cloudflare/next-on-pages` 的 ESLint plugin（`setupDevPlatform`）
- [x] 1.3 在 `package.json` 新增 `pages:build`（`next-on-pages`）、`pages:dev`（`wrangler pages dev`）、`pages:deploy`（`wrangler pages deploy .vercel/output/static`）三個 script

## 2. 建立 Firebase REST 封裝模組

- [x] 2.1 建立 `lib/firebase-rest.ts`，實作以 `SubtleCrypto` 簽署 Service Account JWT、取得 Google OAuth2 access token 的函式
- [x] 2.2 在 `lib/firebase-rest.ts` 實作 Firestore REST：新增文件（`addDoc`）與更新文件（`setDoc`）
- [x] 2.3 在 `lib/firebase-rest.ts` 實作 RTDB REST：寫入節點（`rtdbSet`）
- [x] 2.4 在模組層級快取 access token（含過期時間判斷），避免每 request 重新產生

## 3. 修改 API routes

- [x] 3.1 修改 `app/api/trigger/route.ts`：加入 `export const runtime = 'edge'`，以 `lib/firebase-rest.ts` 的 `rtdbSet` 取代 `firebase-admin` 的 RTDB 寫入
- [x] 3.2 修改 `app/api/heartbeat/route.ts`：加入 `export const runtime = 'edge'`，以 `lib/firebase-rest.ts` 的 `setDoc` 取代 `firebase-admin` 的 Firestore 寫入
- [x] 3.3 修改 `app/api/upload/route.ts`：加入 `export const runtime = 'edge'`，以 `lib/firebase-rest.ts` 的 `addDoc` 取代 `firebase-admin` 的 Firestore 寫入
- [x] 3.4 修改 `app/api/upload/route.ts`：將 `Buffer.from(arrayBuffer)` 改為直接傳遞 `Uint8Array`，確認 `uploadToR2` 可接受

## 4. 確認 R2 上傳相容性

- [x] 4.1 檢查 `lib/r2.ts` 中 `@aws-sdk/client-s3` 的呼叫方式，確認是否相容 Edge Runtime（是否使用 Node.js stream）
- [x] 4.2 若 `@aws-sdk/client-s3` 不相容，改用 `aws4fetch` 直接呼叫 R2 S3 相容 API（不需要，v3 已相容）

## 5. 環境變數範本

- [x] 5.1 在專案根目錄新增 `.dev.vars.example`，列出所有 Cloudflare Pages 所需的環境變數名稱（值填寫說明或空值）

## 6. 本機驗證

- [x] 6.1 執行 `npm run pages:build`，確認建置無錯誤
- [ ] 6.2 執行 `npm run pages:dev`（搭配 `.dev.vars`），確認三支 API routes 在本機 wrangler 環境中可正常呼叫
- [ ] 6.3 執行 `curl -X POST http://localhost:8788/api/trigger -H "x-trigger-secret: <secret>"`，確認回傳 `{"ok": true}`

## 7. Cloudflare Pages 部署（GitHub 整合）

- [ ] 7.1 在 Cloudflare Dashboard → Pages → **Create application** → **Connect to Git** 選擇 GitHub repo
- [ ] 7.2 設定 Build configuration：Build command = `npm run pages:build`，Output directory = `.vercel/output/static`
- [ ] 7.3 在 Pages project → Settings → **Environment variables** 設定所有 production secrets（參考 `.dev.vars.example`）
- [ ] 7.4 `git push main` 觸發首次自動部署，確認 Cloudflare Dashboard 顯示 build 成功
- [ ] 7.5 瀏覽 `https://logos72photo.pages.dev`，確認首頁正常顯示
- [ ] 7.6 以正確 secret 呼叫 `https://logos72photo.pages.dev/api/trigger`，確認 RTDB 觸發成功
