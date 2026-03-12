## Why

時段列表頁（`/gallery/[date]/[slot]`）的小時格目前僅以深色色塊區分，無法讓訪客直覺判斷哪些時段有精彩內容。改用實際照片作為縮圖背景，可強化視覺吸引力並降低探索門檻。

## What Changes

- 有照片的小時格：以該小時第一張照片作為封面背景（`object-cover`），疊加 70% 黑色半透明遮罩，上方顯示白色時間文字
- 無照片的小時格：維持灰色背景，顯示白色時間文字，**不可點擊**（移除 `href`）
- **移除**小時格下方的照片張數資訊（「N 張」）

## Capabilities

### New Capabilities
無

### Modified Capabilities
- `photo-retrieval-ui`：時段列表頁小時格視覺邏輯變更——有照片時顯示封面照片背景＋遮罩，無照片時禁用點擊；移除張數顯示

## Impact

- `app/gallery/[date]/[slot]/page.tsx`（或對應 Server Component）：取得每小時第一張照片 URL
- `components/` 中小時格元件（HourSlot 或同等）：更新視覺與互動邏輯
- `openspec/specs/photo-retrieval-ui/spec.md`：更新相關 Requirement 與 Scenario
- 資料來源：已存在的 `photo_index/{date}` 中的 `firstPhoto` 欄位，或需新增該欄位
