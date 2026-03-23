## MODIFIED Requirements

### Requirement: 隨機背景圖選取
`GalleryBackground` 元件 SHALL 接受可選 `bgSrc?: string` 與 `gradient?: string` prop：
- **未傳入任何 prop**（預設）：依裝置 viewport 寬度顯示對應背景圖，`< 640px` 使用 `/bg/bg-mb-1.png`，`≥ 640px` 使用 `/bg/bg-pc-1.png`，以 CSS `@media (min-width: 640px)` 切換。
- **傳入 `bgSrc`**：直接使用該路徑作為背景圖，不套用 media query 響應式切換。
- **傳入 `gradient`**：以 CSS `linear-gradient` 字串取代背景圖，不載入任何圖片。`gradient` 優先權高於 `bgSrc`（兩者同時傳入時 `gradient` 生效）。

背景圖層 SHALL 以完整不透明度（`opacity: 1`）顯示，不套用 `opacity: 0.1`。

#### Scenario: 未傳入 bgSrc 時依 viewport 切換背景
- **WHEN** 呼叫端未傳入 `bgSrc` 亦未傳入 `gradient`，使用者在 viewport `< 640px` 裝置進入頁面
- **THEN** 系統 SHALL 顯示 `/bg/bg-mb-1.png`

#### Scenario: 未傳入 bgSrc 時桌機顯示桌機背景
- **WHEN** 呼叫端未傳入 `bgSrc` 亦未傳入 `gradient`，使用者在 viewport `≥ 640px` 裝置進入頁面
- **THEN** 系統 SHALL 顯示 `/bg/bg-pc-1.png`

#### Scenario: 傳入 bgSrc 時使用指定背景圖
- **WHEN** 呼叫端傳入 `bgSrc`（未傳入 `gradient`）
- **THEN** 系統 SHALL 顯示該圖片路徑作為背景，不受 viewport 寬度影響

#### Scenario: 傳入 gradient 時使用 CSS 漸層
- **WHEN** 呼叫端傳入 `gradient="linear-gradient(to bottom, #1a2d3d 0%, #1e3345 45%, #c47a3a 80%, #6b3318 100%)"`
- **THEN** 系統 SHALL 以 CSS 漸層作為背景，不載入任何圖片檔案

#### Scenario: gradient 優先於 bgSrc
- **WHEN** 呼叫端同時傳入 `gradient` 與 `bgSrc`
- **THEN** 系統 SHALL 顯示 `gradient` 漸層，忽略 `bgSrc`

#### Scenario: 背景圖層完整不透明顯示
- **WHEN** `GalleryBackground` 渲染（無論傳入何種 prop）
- **THEN** 背景圖層 SHALL 以完整不透明度顯示（不套用 `opacity: 0.1`）
