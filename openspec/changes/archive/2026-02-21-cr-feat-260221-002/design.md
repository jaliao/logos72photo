## Context

logos72photo 是 Next.js 16 (App Router) 應用程式，目前僅可在本機執行。目標是部署至 Cloudflare Pages，使活動期間的相機 PWA、照片瀏覽、管理儀表板可透過公開 URL 存取。

現有架構使用 `firebase-admin` SDK 在 API routes 中寫入 Firestore 與 RTDB。**這是部署的核心障礙**：Cloudflare Pages（透過 `@cloudflare/next-on-pages`）所有 API routes 均執行於 **Workers Edge Runtime**，而 `firebase-admin` 依賴 Node.js 原生模組（`crypto`、`net`、`tls`），在 Edge Runtime 中無法運作。

## Goals / Non-Goals

**Goals:**
- 在 Cloudflare Pages 成功部署 Next.js 應用程式
- 所有 API routes（`/api/trigger`、`/api/upload`、`/api/heartbeat`）在 Edge Runtime 正常運作
- 環境變數（Firebase 憑證、R2 設定）在 Cloudflare Pages 中正確注入
- 本機開發流程維持不變（`npm run dev` 仍可用）

**Non-Goals:**
- 不處理 Cloudflare Worker Cron（`workers/cron-trigger.ts`）的部署，此為獨立 Worker
- 不更改前端 UI 或照片功能邏輯
- 不設定 Custom Domain（使用預設 `.pages.dev` 網域）
- 不建立 CI/CD pipeline（手動部署即可）

## Decisions

### D1：使用 `@cloudflare/next-on-pages` 適配器

**決策：** 採用官方 `@cloudflare/next-on-pages` + `wrangler` 進行建置與部署。

**理由：** 這是 Cloudflare 官方支援的 Next.js App Router 部署方案，提供 `next-on-pages` CLI 將 Next.js 輸出轉換為 Cloudflare Workers 相容格式。

**備選方案：**
- Vercel 部署：無法使用 Cloudflare R2 原生整合，且非需求
- 手動 Worker 包裝：工程量大，維護困難

### D2：以 Firebase REST API 取代 `firebase-admin` SDK

**決策：** 在三支 API routes 中，改用 **Firebase REST API + Service Account JWT** 取代 `firebase-admin`。

**理由：** `firebase-admin` 依賴 Node.js 原生模組，Edge Runtime 不支援。Firebase 提供完整 REST API，功能覆蓋目前使用的 Firestore 與 RTDB 操作。

**實作方式：**
- 建立 `lib/firebase-rest.ts`，封裝：
  - 以 Service Account 私鑰產生 JWT（Google OAuth2 access token），使用 `SubtleCrypto`（Web Crypto API，Edge Runtime 支援）
  - Firestore REST API：`https://firestore.googleapis.com/v1/projects/{project}/databases/(default)/documents`
  - RTDB REST API：`https://{db}.firebaseio.com/trigger/last_shot.json?auth=<token>`
- Token 快取於模組層級（每個 Worker instance 內），避免每 request 重新產生

**備選方案：**
- 改用 `firebase-admin` 的 `@google-cloud/firestore` REST-only 模式：仍有 Node.js 依賴
- 使用 Cloudflare D1 取代 Firestore：需大幅重構，超出本次範圍

### D3：新增獨立的 `wrangler.toml`（Pages 用）

**決策：** 現有 `wrangler.toml` 是給 Cron Worker 使用，**不修改**。改在 `package.json` 的 `pages:deploy` 指令中以 CLI flags 指定 Pages 設定，或新增 `wrangler.pages.toml`（若 wrangler 支援）。

**實際方案：** 使用 `wrangler pages deploy .vercel/output/static` 不需額外 toml。建置後以環境變數或 Cloudflare Dashboard 設定 secrets。

### D4：環境變數策略

**決策：**
- 本機開發：繼續使用 `.env.local`（Next.js 原生支援），另新增 `.dev.vars` 供 `wrangler pages dev` 使用
- 正式部署：透過 Cloudflare Pages Dashboard 手動設定 Environment Variables（Encrypted = secrets）

**理由：** Firebase private key 含換行符，透過 Dashboard 設定比 `wrangler secret put` 更容易處理。

## Risks / Trade-offs

- **JWT 產生複雜度** → 封裝至 `lib/firebase-rest.ts` 並加入完整錯誤處理；如遇時區問題可用已知可靠的 `jose` 套件（純 ESM，Edge 相容）
- **Token 快取失效** → Workers 為 stateless，每個 instance 重新初始化；可接受，每次 token 產生耗時 < 5ms
- **R2 上傳**（`@aws-sdk/client-s3`）需確認 Edge Runtime 相容性 → `@aws-sdk/client-s3` v3 支援 fetch-based transport，應可正常運作；若有問題可改用 `aws4fetch`
- **`Buffer` 在 Edge Runtime** → `upload/route.ts` 使用了 `Buffer.from()`，Edge Runtime 需改為 `Uint8Array`

## Migration Plan

1. 安裝 `@cloudflare/next-on-pages` 與 `wrangler`（devDependencies）
2. 新增 `next.config.ts` 的 `@cloudflare/next-on-pages` ESLint plugin（可選）
3. 建立 `lib/firebase-rest.ts`（Service Account JWT + Firestore + RTDB REST 封裝）
4. 修改三支 API routes：移除 `firebase-admin` 依賴，改用 `lib/firebase-rest.ts`
5. 修正 `upload/route.ts` 中的 `Buffer` → `Uint8Array`
6. 新增 `package.json` scripts：`pages:build`、`pages:dev`、`pages:deploy`
7. 新增 `.dev.vars.example` 範本
8. 本機執行 `npm run pages:build` 驗證建置成功
9. Cloudflare Dashboard 建立 Pages project，設定所有環境變數
10. 執行 `npm run pages:deploy` 完成首次部署

**Rollback：** Cloudflare Pages 保留每次部署歷史，可在 Dashboard 一鍵回滾至前版。

## Open Questions

- `wrangler` 版本與 `next-on-pages` 的版本配對需在建置時確認（目前 next-on-pages v1 對應 wrangler v3+）
- Cloudflare Pages 的 `FIREBASE_ADMIN_PRIVATE_KEY`（多行 PEM）需確認 Dashboard 是否正確保留換行；若不行改用 Base64 編碼後在程式碼解碼
