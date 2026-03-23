## ADDED Requirements

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
- **WHEN** 呼叫端傳入 `bgSrc="/bg/album/1.jpg"`
- **THEN** 系統 SHALL 顯示 `/bg/album/1.jpg`，不受 viewport 寬度影響

#### Scenario: 背景圖層完整不透明顯示
- **WHEN** `GalleryBackground` 渲染（無論是否傳入 `bgSrc`）
- **THEN** 背景圖層 SHALL 以完整不透明度顯示（不套用 `opacity: 0.1`）

### Requirement: 白晝到黑夜漸層動畫覆蓋層
系統 SHALL 在背景圖上疊加半透明漸層覆蓋層，以 CSS `@keyframes` 動畫實現白晝↔黑夜來回效果。

實作方式：
- 漸層色帶：`linear-gradient(135deg, #fde68a, #7dd3fc, #fed7aa, #312e81, #0f172a, #020617)`（日出→天空→黃昏→靛紫→深夜→極夜，共 6 色）
- `backgroundSize: 400% 400%`（放大 4 倍，每次畫面只顯示色帶的一段）
- `@keyframes dayNightCycle`：僅動畫 `background-position`，從 `0% 50%`（白天端）到 `100% 50%`（黑夜端）
- `animation: dayNightCycle 15s ease-in-out infinite alternate`（`alternate` 讓動畫來回播放，自然呈現白天→黑夜→白天的不間斷循環）
- 覆蓋層 opacity SHALL 為 0.7，`pointer-events: none`（不遮擋使用者點擊）

#### Scenario: 動畫來回持續循環
- **WHEN** 使用者停留在相簿首頁
- **THEN** 漸層覆蓋層 SHALL 以 15 秒為半週期，透過 `alternate` 來回播放，不間斷循環白晝↔黑夜

#### Scenario: 白天色調顯示
- **WHEN** 動畫 position 在 0% 端
- **THEN** 漸層 SHALL 顯示暖黃、天藍等日間色調

#### Scenario: 黑夜色調顯示
- **WHEN** 動畫 position 在 100% 端
- **THEN** 漸層 SHALL 顯示靛紫、深夜藍等夜間色調

#### Scenario: 漸層半透明使背景圖透出
- **WHEN** 背景圖與漸層覆蓋層同時顯示
- **THEN** 覆蓋層 SHALL 以 opacity 0.7 疊加，背景圖 SHALL 透過覆蓋層可見

#### Scenario: 覆蓋層不攔截點擊事件
- **WHEN** 使用者點擊日期卡片
- **THEN** 覆蓋層 SHALL 不攔截滑鼠/觸控事件（`pointer-events: none`）

### Requirement: 全頁固定背景佈局
`GalleryBackground` SHALL 以固定定位（`position: fixed`）覆蓋全視窗，z-index 低於頁面內容，不影響日期卡片列表的互動與捲動。

#### Scenario: 背景不遮擋頁面內容
- **WHEN** 使用者捲動相簿首頁
- **THEN** 日期卡片列表 SHALL 正常顯示於背景之上，背景 SHALL 保持固定不隨內容捲動

#### Scenario: 背景元件不影響 Server Component 資料查詢
- **WHEN** `app/page.tsx` 渲染
- **THEN** `GalleryBackground`（Client Component）的存在 SHALL 不影響 Server Component 的 Firestore 資料查詢與渲染
