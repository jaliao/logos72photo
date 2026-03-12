## Context

`PhotoSlideshow.tsx` 目前切換照片時為瞬間替換 `current` state，無任何動畫；關閉幻燈片只有「← 返回」按鈕與 Escape 鍵兩個路徑。本次變更僅修改此單一元件。

## Goals / Non-Goals

**Goals:**
- 切換上一張 / 下一張時，前景照片以 translateX 動畫滑入 / 滑出
- 點擊前景照片容器以外的背景區域，關閉幻燈片

**Non-Goals:**
- 不加入淡入淡出（fade）或縮放（zoom）動畫
- 不修改幻燈片以外的任何元件

## Decisions

### 轉場方向控制

**決策**：新增 `direction` state（`'left' | 'right' | null`），在 `prev()` / `next()` 時設定，用於決定動畫方向。

**動畫實作**：使用 Tailwind `transition-transform duration-300` 搭配 CSS class 控制 `translateX`。切換時：
1. 設定 `direction` 與新 index
2. 新照片從畫面外（`translateX(100%)` 或 `-100%`）進入中心（`translateX(0)`）
3. 動畫時長 300ms，與 Google Photos 風格接近

**替代方案**：使用 `framer-motion` — 排除，避免引入新相依套件；純 CSS keyframe — 不如 state-driven 方案靈活且難以動態控制方向。

**為避免 race condition**：`direction` 在動畫開始時設定，動畫結束後（`onTransitionEnd`）清除，確保連續快速點擊不殘留舊方向。

### 點擊背景關閉

**決策**：在最外層 overlay `<div>` 加上 `onClick={close}`，在前景照片容器 `<div>` 加上 `onClick={(e) => e.stopPropagation()}`。

**替代方案**：偵測 `event.target === overlay` — 效果相同，但 stopPropagation 語意更清晰且對子元素更安全。

工具列按鈕（返回、分享、下載）、左右箭頭按鈕均已在 z-20 層，`stopPropagation` 可防止這些點擊意外觸發關閉。

## Risks / Trade-offs

- **快速連點**：若使用者在動畫未結束時再次點擊，`direction` 會被覆蓋，動畫從新位置重新開始。視覺上可接受，因動畫時長僅 300ms。
- **左右箭頭按鈕穿透**：箭頭按鈕需加上 `stopPropagation`，防止點擊箭頭時同時觸發 overlay `onClick` 關閉。→ 在按鈕 `onClick` handler 中呼叫 `e.stopPropagation()`（或包裝 `prev` / `next` 呼叫）。
- **Swipe 手勢衝突**：`swipeHandlers` 掛在 overlay 上，`onClick` 也在 overlay 上，在觸控裝置上 swipe 結束後可能觸發 `onClick`。→ swipe 完成後在 `useSwipe` 內 `preventDefault` 應已處理；若未處理，可在 overlay `onClick` 中判斷 swipe 距離。

## Migration Plan

- 無資料 migration，單純修改 UI 元件
- 部署後即生效，無需 feature flag
