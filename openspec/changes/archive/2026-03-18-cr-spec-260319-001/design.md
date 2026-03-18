## Context

`/admin/slot-passwords/print` 已有「帳密清單列印頁」的實作模式：Server Component 預先計算所有密碼、純 HTML/CSS `@media print`、`PrintButton`（`window.print()`）。本次新增明信片列印頁沿用相同模式，以 CSS 絕對定位在底圖上疊印帳密資訊。

底圖規格：`public/postcard/2.png`，1748×1240 px（橫向 A5 比例）。

## Goals / Non-Goals

**Goals:**
- 新增 `/admin/slot-passwords/postcard` 頁面，每頁一張明信片
- 底圖疊印時段標籤、帳號、密碼；To 欄留白
- 工具列含「列印 / 儲存為 PDF」按鈕，列印時隱藏
- 在 `/admin/slot-passwords` 頁面新增入口連結

**Non-Goals:**
- 不做 Canvas / Server-side 影像合成（避免引入 sharp 依賴於 Next.js 端）
- 不做動態選日期範圍（固定與 print 頁相同範圍）
- 不需要寄件人 / 收件人名字

## Decisions

### 1. CSS 絕對定位疊印，而非 Canvas 或 Server 合成
- **採用**：`<img>` 底圖 + `position: absolute` 文字層
- **原因**：與既有 print 頁一致；瀏覽器列印直接輸出 PDF，不需額外依賴
- **替代方案**：Canvas 合成（需 `'use client'`、複雜序列化）、sharp（Cloud Function 環境，非 Next.js）

### 2. 每頁一張明信片（`@media print` page-break）
- **採用**：每個 `.postcard` 容器加 `page-break-after: always`（CSS）
- **原因**：符合實體明信片一頁一張的發放需求
- **替代方案**：多張排版（省紙，但裁切麻煩）

### 3. 文字位置以底圖百分比定位
- **採用**：`position: absolute; top: X%; left: Y%`（相對於底圖容器）
- **原因**：縮放時文字位置保持相對穩定；`3.png`（範本）作為對齊參考
- **替代方案**：固定像素（解析度變化時偏移）

### 4. Server Component + edge runtime（與 print 頁一致）
- **採用**：`export const runtime = 'edge'`，伺服器端批次計算密碼
- **原因**：密碼衍生為純計算，不需 DB；edge 冷啟動快

## Risks / Trade-offs

- [文字位置偏移] 印表機縮放比例不同 → 提供「符合頁面」列印提示，或在 toolbar 加說明
- [明信片張數多時頁面載入慢] 密碼批次計算 → 沿用 print 頁 BATCH=96 分批 `Promise.all`
