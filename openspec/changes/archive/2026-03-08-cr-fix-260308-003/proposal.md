## Why

相簿看不到剛拍的照片。根因：Cloudflare Workers edge runtime 在 `return NextResponse.json(...)` 送出回應後會立即終止 Worker，fire-and-forget 的 `updatePhotoIndex(...)` 尚未完成就被砍掉，導致 `photo_index` 永遠不更新，相簿主頁與時段頁找不到照片入口。本地 `next dev`（Node.js 程式持續存活）不會觸發此問題，因此測試時正常、部署後失效。

## What Changes

- `app/api/upload/route.ts`：`updatePhotoIndex` 改為 `await`，確保在回應送出前完成索引更新。錯誤仍只 `console.error` 不阻斷上傳主流程。

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
（無，純 bug fix，無 spec 層級行為變更）

## Non-goals

- 不實作 Cloudflare Workers `ctx.waitUntil()` 背景任務機制
- 不重構 `photo_index` 的更新策略（讀改寫競態問題留待另一個 CR）

## Impact

- `app/api/upload/route.ts`：約 +3 行（try/await 取代 .catch fire-and-forget）
- 上傳 API 回應時間增加約 100–300ms（Firestore PATCH RTT）
