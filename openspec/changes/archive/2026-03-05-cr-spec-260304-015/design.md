## Context

目前拍照流程：RTDB 觸發 → 倒數 15 秒 → 拍照。觸發由伺服器端 cron job 在每 5 分鐘整點（xx:00）送出。相機狀態列時間格式固定為 HH:MM:SS（24 時制）。

本次調整屬於小範圍修改，涉及：
1. Client Component 的倒數初始值（`countdown-shutter`）
2. 時間格式化工具函式（`camera-control`）
3. 伺服器端觸發排程偏移（`/api/trigger` 或 cron 設定）

## Goals / Non-Goals

**Goals:**
- 倒數秒數從 15 改為 10
- 觸發排程提早 60 秒（`xx:04:00` 觸發，讓拍照落在 `xx:04:10`，接近 `xx:04:30` 或依需求調整）
- 狀態列時間顯示改為上午/下午 H:MM:SS 格式

**Non-Goals:**
- 不更改觸發間隔（仍為每 5 分鐘）
- 不更改 RTDB 節點結構或觸發邏輯
- 不更改監控儀表板時間顯示

## Decisions

### 決策 1：倒數初始值修改位置

**選擇：** 直接修改 `CameraClient`（或同等組件）中 `countdown` state 的初始化值。

**理由：** 倒數初始值為單一常數，無需提取為環境變數或設定檔。直接改 component 內的 magic number 最簡單。

### 決策 2：時間格式化方式

**選擇：** 使用 JavaScript `Date` 物件搭配 `toLocaleTimeString('zh-TW', { hour12: true, ... })` 或自行格式化為「上午/下午 H:MM:SS」。

**理由：**
- `toLocaleTimeString` 在不同裝置（iOS Safari）的輸出格式不一定穩定
- 採用**手動格式化**：`const hours = date.getHours(); const period = hours < 12 ? '上午' : '下午'; const h = hours % 12 || 12;` 確保輸出格式固定為「上午/下午 H:MM:SS」

**替代方案考量：** `Intl.DateTimeFormat` 格式同樣有跨裝置差異風險，排除。

### 決策 3：觸發排程偏移實作位置

**選擇：** 調整 cron job 觸發時間（由 `0 */5 * * * *` 改為 `0 4 */5 * * *` 或等效設定），或在 cron job 呼叫 `/api/trigger` 時不變，改由 **Cloudflare Workers cron trigger** 的排程表達式調整。

**理由：** 排程偏移屬於基礎設施層，不應混入 API 邏輯。修改 cron 表達式最乾淨，不影響 `/api/trigger` 本身行為。

**待確認：** 目前觸發 cron 的具體實作位置（Cloudflare Workers / Vercel Cron / 外部 cron），需在 tasks 階段確認實際檔案路徑。

## Risks / Trade-offs

- **時間格式跨裝置一致性**：手動格式化可確保輸出穩定，但需注意午夜 12 點（`12:00:00 AM` → 「上午 12:00:00」）與正午（「下午 12:00:00」）的邊界處理。→ 使用 `hours % 12 || 12` 處理。
- **觸發時間提早 60 秒的影響**：若現場人員依賴「整點觸發」判斷拍照節奏，提早 60 秒可能造成困惑。→ 需更新操作文件或現場說明。
- **倒數縮短至 10 秒**：現場人員有較少時間準備。→ 屬於預期行為調整，已由用戶確認。
