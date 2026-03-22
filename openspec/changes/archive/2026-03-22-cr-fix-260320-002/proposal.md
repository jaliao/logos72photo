## Why

iOS Safari 在點擊 `font-size < 16px` 的輸入欄位時會自動放大頁面（auto-zoom），導致手機登入時頁面縮放並出現橫向捲軸，影響來賓操作體驗。目前 `/album/login` 與 `/admin/login` 的 `<input>` 皆使用 `text-sm`（14px），觸發此行為。

## What Changes

- 將 `app/album/login/page.tsx` 所有 `<input>` 的字體大小從 `text-sm` 改為 `text-base`（16px）
- 將 `app/admin/login/page.tsx` 的 `<input>` 字體大小從 `text-sm` 改為 `text-base`（16px）
- 在 `app/globals.css` 加入全域 `input, select, textarea { font-size: 16px }` 保護，防止日後新增欄位再次踩到同一問題

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `slot-group-auth`：登入頁 `<input>` 視覺樣式調整（font-size 從 14px → 16px），不影響驗證邏輯與 API 行為

## Impact

- `app/album/login/page.tsx`：兩個 input 的 className
- `app/admin/login/page.tsx`：一個 input 的 className
- `app/globals.css`：新增全域 input font-size rule
- 無 API、資料庫、cookie 邏輯異動
