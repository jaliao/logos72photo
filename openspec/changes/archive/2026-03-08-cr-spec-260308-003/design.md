## Context

`PhotoLightbox.tsx` 縮圖 grid 現況：
- `grid-cols-2 gap-3 sm:grid-cols-3`
- 每張縮圖：`h-40 w-full object-cover`（固定 160px 高，橫式裁切）

iPhone 相機拍攝的照片為直式（portrait），比例約 4:3（寬：高 = 3:4）。以固定 `h-40` 呈現會把照片頂部或底部裁去，且手機螢幕寬約 390px → 兩欄各約 185px → 縮圖尺寸約 185×160（偏橫式），與原圖比例差距大。

## Goals / Non-Goals

**Goals:**
- 縮圖以直式比例（4:3 portrait）完整呈現，不截裁主體
- 手機版單欄顯示，每張照片有足夠寬度
- Lightbox 全螢幕圖片在手機 viewport 內完整顯示（不溢出）

**Non-Goals:**
- 不更動 Lightbox 開啟/關閉邏輯、ESC 鍵、背景鎖定
- 不更動下載功能
- 不支援橫式（landscape）照片的特殊處理（全以直式規格設計）

## Decisions

### 決策 1：縮圖使用 `aspect-[3/4]` 取代固定 `h-40`

- **選項 A（現況）**：`h-40 w-full object-cover` — 橫式截裁，直式主體流失
- **選項 B（選定）**：`aspect-[3/4] w-full object-cover` — 維持 3:4 直式比例，Tailwind 原生支援

`aspect-[3/4]` 讓圖片高度隨欄寬自適應：手機單欄寬 ≈ 350px → 高 ≈ 467px，比例正確。

### 決策 2：grid 欄數 `grid-cols-1 sm:grid-cols-2`

- **選項 A**：維持 `grid-cols-2`（手機兩欄）— 直式圖片太窄，不易點擊
- **選項 B（選定）**：`grid-cols-1 sm:grid-cols-2` — 手機單欄完整顯示，≥640px 雙欄

雙欄（`sm:grid-cols-2`）在 iPad/桌機可同時比較兩張，三欄已不需要（直式大圖已清楚）。

### 決策 3：Lightbox 圖片 `max-h` 調整

現況 `max-h-[75vh]` 在手機直式（圖片高 > 寬）可能被剪裁。改為 `max-h-[85vh]` 並確保 `max-w-[95vw]`，讓直式照片在手機 Safari 能完整顯示（100vh 含瀏覽器工具列，85vh 留安全邊距）。

## Risks / Trade-offs

- **手機單欄頁面捲動較長**：若某小時有 10+ 張照片，需滾動較多。可接受，因清晰度提升。
- **`aspect-[3/4]` 對橫式照片不適用**：若未來有橫式照片，會顯示為窄橫條（object-cover 截裁）。目前活動全為直式，可接受；未來可依需求改用 `aspect-auto`。
