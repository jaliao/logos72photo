## Why

目前 logos72photo 僅在本機可執行，尚未部署至任何公開環境。需要將 Next.js 應用程式部署至 Cloudflare Pages，使活動期間相機頁面（PWA）、照片瀏覽、管理儀表板均可透過公開 URL 存取。

## What Changes

- 安裝並設定 `@cloudflare/next-on-pages` 作為 Cloudflare Pages 的 Next.js 適配器
- 更新 `next.config.ts` 加入 Cloudflare Pages 所需設定
- 將所有 API routes 標記為 `runtime = 'edge'`（Edge Runtime 相容）
- 調整 `firebase-admin` 使用方式以相容 Edge Runtime（或改用 REST API）
- 新增 `package.json` 的 `pages:build` 與 `pages:deploy` 指令
- 加入 `.dev.vars` 範本供 Wrangler 本機開發使用

## Capabilities

### New Capabilities
- `cloudflare-pages-deploy`: 將 Next.js 應用程式透過 `@cloudflare/next-on-pages` 部署至 Cloudflare Pages，包含 build pipeline 設定與 Edge Runtime 相容調整

### Modified Capabilities
（無既有 spec 需要變更需求）

## Impact

- **`package.json`**：新增 `pages:build`、`pages:deploy` script
- **`next.config.ts`**：加入 `@cloudflare/next-on-pages` plugin
- **`app/api/trigger/route.ts`**：加入 `export const runtime = 'edge'`
- **`app/api/upload/route.ts`**：加入 `export const runtime = 'edge'`，調整 `firebase-admin` 相容性
- **`app/api/heartbeat/route.ts`**（若存在）：同上
- **`.dev.vars`**：新增 Wrangler 本機開發環境變數範本
- **`wrangler.toml`**（可能）：確認 Pages 部署不與 Worker 設定衝突
