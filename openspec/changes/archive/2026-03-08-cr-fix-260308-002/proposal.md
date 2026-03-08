## Why

TypeScript 嚴格型別檢查拒絕將 `Record<string, unknown>` 直接 cast 為 `PhotoIndexDoc`，因兩型別缺乏足夠重疊，導致 Cloudflare Pages / Vercel 建置失敗（exit code 1）。

## What Changes

- `lib/firebase-rest.ts` 第 478 行：改用雙重 cast（`as unknown as PhotoIndexDoc`）繞過 TypeScript 的結構相容性檢查，修復建置錯誤。

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
（無，僅型別 cast 修正，無 spec 層級行為變更）

## Non-goals

- 不重構 `parseFirestoreFields` 的回傳型別
- 不引入 runtime 型別驗證（zod 等）

## Impact

- `lib/firebase-rest.ts`：單行修改
- 建置：修復後 Cloudflare Pages 可正常完成 `npm run build`
