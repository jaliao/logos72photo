## MODIFIED Requirements

### Requirement: 展開模式操作提示區塊
展開模式 SHALL 以明顯提示區塊（`bg-amber-50 border border-amber-200 rounded-lg`）顯示照片使用說明，文案為「本照片用於活動行銷宣傳，如不同意請點「刪除」自行移除。」封面與一般照片均顯示相同提示。

#### Scenario: 一般照片展開顯示提示區塊
- **WHEN** 一般照片展開卡片顯示
- **THEN** 卡片 SHALL 顯示黃底提示區塊，文案為「本照片用於活動行銷宣傳，如不同意請點「刪除」自行移除。」

#### Scenario: 封面展開顯示提示區塊
- **WHEN** 封面展開卡片顯示
- **THEN** 卡片 SHALL 顯示相同黃底提示區塊

### Requirement: iOS 下載行為與提示
非 iOS 裝置 SHALL 使用 `fetch → blob → <a download>` 下載；iOS 裝置 SHALL 改為 `window.open(r2Url, '_blank')` 開啟原圖，並在按鈕下方顯示操作說明「開啟後長按圖片 → 選擇「儲存影像」即可存入相簿」。

#### Scenario: 非 iOS 點擊下載
- **WHEN** 非 iOS 訪客點擊下載按鈕
- **THEN** 系統 SHALL 以 `<a download>` 方式下載檔案，不顯示額外說明

#### Scenario: iOS 點擊下載
- **WHEN** iOS 訪客點擊下載按鈕（文字改為「開啟照片」）
- **THEN** 系統 SHALL 以 `window.open` 開啟原圖新頁，並顯示說明「開啟後長按圖片 → 選擇「儲存影像」即可存入相簿」

### Requirement: 刪除 inline 二次確認
刪除操作 SHALL 改為 inline 兩段式確認：點「刪除」後按鈕列切換為「確定刪除」+ 「取消」，不使用瀏覽器原生 `confirm()`。

#### Scenario: 點擊刪除進入確認狀態
- **WHEN** 訪客點擊「刪除」按鈕
- **THEN** 按鈕列 SHALL 切換為「確定刪除」（紅色）與「取消」（灰色）兩顆按鈕

#### Scenario: 確認刪除執行刪除
- **WHEN** 訪客點擊「確定刪除」
- **THEN** 系統 SHALL 呼叫對應刪除 API，成功後移除並返回列表

#### Scenario: 取消恢復按鈕列
- **WHEN** 訪客點擊「取消」
- **THEN** 按鈕列 SHALL 恢復為「下載」與「刪除」
