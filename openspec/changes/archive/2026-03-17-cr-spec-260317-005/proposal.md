## Why

`/album/login` 的密碼欄位目前以 `type="password"` 隱藏輸入內容，來賓無法確認是否輸入正確，容易登入失敗。加入密碼顯示/隱藏切換按鈕，提升輸入體驗。

## What Changes

- `app/album/login/page.tsx`（或其 Client Component）：密碼欄位旁加入眼睛圖示切換按鈕，點擊後在 `type="password"` 與 `type="text"` 間切換

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `slot-group-auth`：登入頁密碼欄位需支援顯示/隱藏切換

## Impact

- **修改：** `app/album/login/page.tsx`
- **依賴：** Tabler Icons（已使用，新增 `IconEye` / `IconEyeOff`）或原生 SVG
- **不影響：** 登入邏輯、session 機制、其他頁面

## Non-goals

- 不修改登入驗證邏輯
- 不修改其他頁面的輸入欄位
