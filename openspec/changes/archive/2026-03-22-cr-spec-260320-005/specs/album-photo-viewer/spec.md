## ADDED Requirements

### Requirement: 單張照片展開卡片
`AlbumPhotoViewer` 元件 SHALL 提供「單頁展開」模式：點擊縮圖後，grid 隱藏，以白色圓角卡片（`rounded-2xl bg-white/50`，無陰影）顯示單張照片，卡片包含照片（`aspect-[3/4]` 全寬）、說明文字、下載與刪除按鈕（橫排等寬）、左右切換箭頭與「← 返回列表」。

#### Scenario: 點擊縮圖切換至展開模式
- **WHEN** 訪客點擊任意照片縮圖
- **THEN** grid 隱藏，顯示展開卡片，照片以 `aspect-[3/4]` 全寬呈現

#### Scenario: 展開卡片顯示說明文字
- **WHEN** 展開卡片顯示
- **THEN** 卡片 SHALL 顯示說明文字「本照片可能用於活動行銷，如不同意請點刪除」

#### Scenario: 展開卡片顯示下載與刪除按鈕
- **WHEN** 展開卡片顯示
- **THEN** 卡片 SHALL 顯示「下載」與「刪除」按鈕，橫排等寬，樣式明顯

#### Scenario: 左右切換照片
- **WHEN** 訪客點擊展開卡片的左箭頭或右箭頭
- **THEN** 系統 SHALL 切換至相鄰照片，無需返回列表

#### Scenario: 返回列表
- **WHEN** 訪客點擊「← 返回列表」
- **THEN** 展開卡片隱藏，grid 重新顯示

### Requirement: 展開卡片下載功能
`AlbumPhotoViewer` 的下載 SHALL 使用 `fetch(r2Url) → Blob → <a download>` 方式實作，不使用 `navigator.share` Web Share API。

#### Scenario: 點擊下載觸發檔案下載
- **WHEN** 訪客點擊「下載」按鈕
- **THEN** 系統 SHALL 下載照片檔案至裝置，不開啟系統分享選單

#### Scenario: 不顯示分享功能
- **WHEN** 展開卡片顯示
- **THEN** 卡片 SHALL 不顯示分享按鈕或複製連結功能

### Requirement: 刪除後本地狀態管理
刪除成功後，`AlbumPhotoViewer` SHALL 從本地 photos state 移除該項目並返回列表，不重新查詢 Firestore。

#### Scenario: 刪除成功後移除照片
- **WHEN** 訪客確認刪除且 API 回傳成功
- **THEN** 該照片 SHALL 從列表消失，系統返回 grid 模式

#### Scenario: 刪除失敗顯示錯誤
- **WHEN** API 回傳非 2xx 狀態
- **THEN** 系統 SHALL 顯示錯誤提示，照片不從列表移除
