## ADDED Requirements

### Requirement: 日期卡片進場淡入動畫
頁面載入後，日期卡片列表 SHALL 以 staggered 淡入方式進場，每張卡片依其排列順序（index）加上遞增延遲（`index × 80ms`），由不可見（opacity 0）漸變為完全可見（opacity 1），動畫時長 400ms。

#### Scenario: 首次載入卡片依序淡入
- **WHEN** 使用者進入相簿首頁，頁面 hydration 完成
- **THEN** 日期卡片 SHALL 由上而下依序淡入，第一張無延遲，後續每張延遲 80ms，動畫時長各 400ms

#### Scenario: 多張卡片 staggered 顯示
- **WHEN** 頁面有 N 張日期卡片（N > 1）
- **THEN** 第 k 張卡片（0-indexed）SHALL 在 `k × 80ms` 後開始淡入，形成由上而下的視覺波浪效果

#### Scenario: 無卡片時不觸發動畫
- **WHEN** Firestore 中無任何拍攝記錄
- **THEN** 空狀態提示文字 SHALL 正常顯示，不觸發卡片動畫

### Requirement: 日期卡片退場淡出動畫
使用者點擊任意時段格時，系統 SHALL 攔截頁面跳轉，先將所有日期卡片同步淡出（opacity 1→0，300ms），淡出完成後才執行路由跳轉。

#### Scenario: 點擊時段格觸發退場動畫
- **WHEN** 使用者點擊任意時段格
- **THEN** 所有日期卡片 SHALL 同步淡出，300ms 後系統 SHALL 跳轉至對應 `/gallery/{date}/{slot}` 路由

#### Scenario: 退場動畫期間禁止重複點擊
- **WHEN** 退場動畫正在播放中
- **THEN** 系統 SHALL 忽略後續點擊事件，不重複觸發跳轉或動畫

#### Scenario: 退場完成後完成跳轉
- **WHEN** 退場淡出動畫（300ms）播放結束
- **THEN** 系統 SHALL 以 `router.push()` 執行路由跳轉，離開首頁

### Requirement: Server Component 資料取得不受影響
動畫實作 SHALL 封裝於 `GalleryDateList` Client Component 內，`app/page.tsx` SHALL 保持 Server Component，Firestore 資料查詢 SHALL 繼續在 server 端執行，日期卡片資料 SHALL 以 prop 傳入 `GalleryDateList`。

#### Scenario: 資料仍由 server 取得
- **WHEN** 使用者進入相簿首頁
- **THEN** 日期卡片資料 SHALL 由 `app/page.tsx`（Server Component）從 Firestore 查詢後傳入 `GalleryDateList`，不透過 client-side fetch
