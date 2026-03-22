## MODIFIED Requirements

### Requirement: 隨機背景圖選取
`GalleryBackground` 元件 SHALL 接受可選 `bgSrc?: string` prop：
- **未傳入 `bgSrc`**（預設）：依裝置 viewport 寬度顯示對應背景圖，`< 640px` 使用 `/bg/bg-mb-1.png`，`≥ 640px` 使用 `/bg/bg-pc-1.png`，以 CSS `@media (min-width: 640px)` 切換。
- **傳入 `bgSrc`**：直接使用該路徑作為背景圖，不套用 media query 響應式切換。

背景圖層 SHALL 以完整不透明度（`opacity: 1`）顯示，不套用 `opacity: 0.1`。

#### Scenario: 未傳入 bgSrc 時依 viewport 切換背景
- **WHEN** 呼叫端未傳入 `bgSrc`，使用者在 viewport `< 640px` 裝置進入頁面
- **THEN** 系統 SHALL 顯示 `/bg/bg-mb-1.png`

#### Scenario: 未傳入 bgSrc 時桌機顯示桌機背景
- **WHEN** 呼叫端未傳入 `bgSrc`，使用者在 viewport `≥ 640px` 裝置進入頁面
- **THEN** 系統 SHALL 顯示 `/bg/bg-pc-1.png`

#### Scenario: 傳入 bgSrc 時使用指定背景
- **WHEN** 呼叫端傳入 `bgSrc="/bg/album/1.png"`
- **THEN** 系統 SHALL 顯示 `/bg/album/1.png`，不受 viewport 寬度影響

#### Scenario: 背景圖層完整不透明顯示
- **WHEN** `GalleryBackground` 渲染（無論是否傳入 `bgSrc`）
- **THEN** 背景圖層 SHALL 以完整不透明度顯示（不套用 `opacity: 0.1`）
