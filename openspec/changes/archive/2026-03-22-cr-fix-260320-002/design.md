## Context

iOS Safari（及部分 Android 瀏覽器）有一項行為：當使用者點擊 `font-size < 16px` 的輸入欄位時，瀏覽器會自動放大頁面（auto-zoom）以便閱讀，導致頁面寬度超出視窗，產生橫向捲軸。

目前狀態：
- `app/album/login/page.tsx`：兩個 `<input>` 皆套用 `text-sm`（Tailwind 對應 14px）
- `app/admin/login/page.tsx`：一個 `<input>` 套用 `text-sm`（14px）
- `app/globals.css`：無全域 input font-size 保護

## Goals / Non-Goals

**Goals:**
- 手機點擊登入頁輸入欄位時，頁面不放大、不產生橫向捲軸
- 防止日後新增 `<input>` 再次踩到同一問題

**Non-Goals:**
- 不修改輸入欄位的其他視覺樣式（顏色、圓角、padding 等）
- 不改動驗證邏輯、API 或 cookie 行為
- 不變更 admin 登入頁的整體設計

## Decisions

### 決策 1：提高 input font-size 至 16px，而非鎖定 viewport

**選擇：** 將 input 的 `text-sm` 改為 `text-base`（16px），並在 `globals.css` 加入全域保護。

**替代方案：** 在 `<head>` 加入 `<meta name="viewport" content="..., maximum-scale=1, user-scalable=no">`。

**理由：**
- `user-scalable=no` / `maximum-scale=1` 會完全停用使用者手動縮放，違反 WCAG 無障礙規範（視力不佳者無法放大）。
- 提高 font-size 是 iOS auto-zoom 的根本解法，副作用最小。

### 決策 2：同時修改 `globals.css` 全域保護

**選擇：** 在 `globals.css` 加入 `input, select, textarea { font-size: max(16px, 1em) }`。

**理由：**
- 單純修改兩個登入頁只解決當下問題，未來新增表單仍可能復發。
- 全域規則作為安全網，確保任何輸入元件預設不低於 16px。
- 使用 `max(16px, 1em)` 尊重元件自訂字體大小，只在小於 16px 時介入。

### 決策 3：login page 保留 `text-base`（不依賴全域規則）

**選擇：** 登入頁 input 的 className 明確改為 `text-base`，而非只依賴全域 CSS。

**理由：** 全域規則的優先級可能被 Tailwind utility 覆蓋（specificity），顯式 className 保證生效。

## Risks / Trade-offs

- **視覺尺寸微幅變大**：input 文字從 14px → 16px，在小螢幕上略大，但仍屬標準可讀範圍，不影響佈局。
- **globals.css 全域規則衝突**：若日後有元件刻意用 `text-xs`（12px），全域規則會強制拉高為 16px。→ 緩解：規則僅影響 `<input>/<select>/<textarea>`，非全部文字元素；且元件可用 `style={{ fontSize: '12px' }}` 覆蓋。
