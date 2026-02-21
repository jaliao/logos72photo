## ADDED Requirements

### Requirement: 每台 iPhone 使用獨立路由綁定裝置 ID
系統 SHALL 為每台實體 iPhone 提供專屬 URL 路由，device_id 於路由層硬綁定，不依賴 build-time 環境變數或 URL query param。同一正式環境 build 下，不同路由對應不同 device_id，確保多台 iPhone 在監控儀表板中可被唯一識別。

#### Scenario: iPhone 1 訪問 /camera1 顯示正確裝置 ID
- **WHEN** 用戶訪問 `/camera1`
- **THEN** 相機頁面 SHALL 以 `iphone-1` 作為 device_id，所有心跳、上傳、Firestore 寫入均使用此 ID

#### Scenario: iPhone 2 訪問 /camera2 顯示正確裝置 ID
- **WHEN** 用戶訪問 `/camera2`
- **THEN** 相機頁面 SHALL 以 `iphone-2` 作為 device_id，所有心跳、上傳、Firestore 寫入均使用此 ID

#### Scenario: 監控儀表板同時顯示兩台裝置
- **WHEN** iphone-1 與 iphone-2 均已啟動並送出心跳
- **THEN** 監控儀表板 SHALL 顯示兩張獨立裝置卡片，分別標示 `iphone-1` 與 `iphone-2`

### Requirement: 非 standalone 模式顯示安裝引導，不啟動相機
系統 SHALL 偵測相機頁面是否以 PWA standalone 模式運行（從主畫面圖示開啟）。若非 standalone 模式（在 Safari 瀏覽器直接開啟），頁面 MUST 顯示安裝引導畫面，不得啟動相機串流、RTDB 監聽、心跳發送等任何相機功能，以防止多個瀏覽器視窗同時佔用同一 device_id。

#### Scenario: Safari 直接開啟相機路由
- **WHEN** 用戶在 Safari 中直接輸入 `https://logos72photo.pages.dev/camera1`（非 standalone 模式）
- **THEN** 頁面 SHALL 顯示安裝引導畫面，說明如何加入主畫面，且相機畫面 MUST NOT 出現

#### Scenario: 從主畫面圖示開啟（standalone 模式）
- **WHEN** 用戶點擊主畫面上的「接力相機 1」圖示開啟 app
- **THEN** 頁面 SHALL 直接進入全螢幕相機模式，不顯示安裝引導

#### Scenario: 安裝引導顯示正確裝置 ID
- **WHEN** 非 standalone 模式下顯示安裝引導頁
- **THEN** 引導頁 SHALL 顯示對應的 device_id（例如 `iphone-1`），便於確認操作的是正確設備
