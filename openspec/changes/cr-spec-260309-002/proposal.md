## Why

每個時段分組（slotGroup）有多張照片，目前缺乏視覺封面供分享或列印使用。需為每個 slotGroup 自動合成一張封面圖：以 `watermark2.png` 為底圖，將該分組第一張照片裁切後嵌入指定區塊，存回 R2 供後續取用。

## What Changes

- 新增本機執行腳本 `scripts/generate-covers.mjs`：
  - 讀取 Firestore，取得指定日期範圍內所有 slotGroup 的第一張照片 URL
  - 從 R2 下載原圖，以 `sharp` 將照片 **cover crop** 至 844×861
  - 合成至 `public/watermark2.png` 底圖，位置 x=117, y=229
  - 結果上傳 R2：路徑 `covers/{slotGroup}.jpg`
- 底圖尺寸：1080×1440，底圖置頂，照片嵌入

## Capabilities

### New Capabilities
- `slot-cover-generator`：slotGroup 封面圖批次合成腳本（本機 Node.js，非 edge）

### Modified Capabilities
（無）

## Impact

- **新增：** `scripts/generate-covers.mjs`
- **依賴：** `sharp`（Node.js 圖像處理）、`@aws-sdk/client-s3`（已有）
- **R2 新路徑：** `covers/{slotGroup}.jpg`
- **不影響現有任何頁面路由**，封面圖僅存 R2，由呼叫方自行決定如何使用

## Non-goals

- 不做封面圖的 API 端點或前端頁面（本次只產生並存 R2）
- 不做即時（on-demand）生成
- 不處理無照片的 slotGroup（跳過）
