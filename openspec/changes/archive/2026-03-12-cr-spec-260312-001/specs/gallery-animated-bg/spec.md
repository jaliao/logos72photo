## MODIFIED Requirements

### Requirement: 隨機背景圖選取
系統 SHALL 在 `GalleryBackground` 元件渲染時，固定使用 `/bg/1.png` 作為背景圖。不再使用 `Math.random()` 隨機選取，移除 `bgIndex` state 與 `useEffect` 邏輯。SSR 與 CSR 均可確定地渲染同一張圖，不需要 null guard。

#### Scenario: 渲染時固定使用 1.png
- **WHEN** 使用者進入相簿首頁，`GalleryBackground` 渲染
- **THEN** 系統 SHALL 固定顯示 `/bg/1.png` 作為全頁背景，每次重新整理顯示相同圖片
