## MODIFIED Requirements

### Requirement: 隨機背景圖選取
系統 SHALL 在 `GalleryBackground` 元件渲染時，依裝置 viewport 寬度顯示對應背景圖：viewport 寬度 `< 640px` 時使用 `/bg/bg-mb-1.png`（手機版），`≥ 640px` 時使用 `/bg/bg-pc-1.png`（桌機版）。切換邏輯 SHALL 以 CSS `@media (min-width: 640px)` 實現，不使用 JavaScript 偵測，維持 Server Component 特性。背景圖層 SHALL 套用 `opacity: 0.1`，讓漸層動畫覆蓋層為主視覺，背景圖僅作為底紋。

#### Scenario: 手機寬度顯示手機版背景
- **WHEN** 使用者在 viewport 寬度 `< 640px` 的裝置進入相簿頁面，`GalleryBackground` 渲染
- **THEN** 系統 SHALL 顯示 `/bg/bg-mb-1.png` 作為全頁背景

#### Scenario: 桌機寬度顯示桌機版背景
- **WHEN** 使用者在 viewport 寬度 `≥ 640px` 的裝置進入相簿頁面，`GalleryBackground` 渲染
- **THEN** 系統 SHALL 顯示 `/bg/bg-pc-1.png` 作為全頁背景

#### Scenario: 調整視窗寬度時背景隨之切換
- **WHEN** 使用者將瀏覽器視窗寬度跨越 640px 斷點
- **THEN** 背景圖 SHALL 自動切換為對應版本，不需重新整理頁面

#### Scenario: 背景圖層以低透明度呈現
- **WHEN** `GalleryBackground` 渲染
- **THEN** 背景圖層 SHALL 以 `opacity: 0.1` 顯示，作為底紋而非主視覺
