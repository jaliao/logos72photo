## Why

相簿首頁背景目前為靜態圖片，視覺單調。本次加入白天到黑夜的動態漸層動畫背景，呼應「不間斷」主題，並以隨機背景圖增加每次瀏覽的新鮮感。

## What Changes

- **新增 Client Component `GalleryBackground`**：負責隨機選取背景圖（`/bg/1.png`–`/bg/10.png`）並套用漸層動畫
- **漸層方向**：右上角為白天（亮色），左下角為黑夜（深色），整體 opacity 約 0.6–0.8（半透明，讓背景圖透出）
- **動畫節奏**：每 2 秒切換一個漸層狀態，共 5 個 keyframe，循環不止（總週期 10 秒）
- **背景圖**：client 端 mount 後以 `Math.random()` 從 `/bg/1.png`–`/bg/10.png` 隨機選取一張，作為底圖疊加漸層覆蓋層
- **修改 `app/page.tsx`**：移除靜態 backgroundImage style，改用 `GalleryBackground` 元件

## Capabilities

### New Capabilities
- `gallery-animated-bg`：相簿首頁動態漸層背景，含隨機背景圖選取與白晝/黑夜 CSS keyframe 動畫

### Modified Capabilities
（無 spec 層級的行為變更）

## Non-goals

- 不依據實際時間決定起始白天或黑夜狀態（純循環動畫）
- 不在相簿子頁面（`/gallery/[date]/[slot]`）套用此背景
- 不提供關閉動畫的控制項

## Impact

- 新增：`app/components/GalleryBackground.tsx`（`"use client"`）
- 修改：`app/page.tsx`（引入 `GalleryBackground`，移除靜態 backgroundImage）
- 靜態資源：`public/bg/1.png`–`public/bg/10.png`（需確認已上傳）
