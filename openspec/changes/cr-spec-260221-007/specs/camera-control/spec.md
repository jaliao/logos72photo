## MODIFIED Requirements

### Requirement: 同步拍照觸發
系統必須利用 Firebase Realtime Database 實現指令同步，每 5 分鐘由伺服器更新時間戳記，觸發所有連接的 iPhone 進行拍照。觸發條件以「RTDB 值遞增」為準，而非比對本地時脈差值，以避免時脈偏差導致遺漏觸發。RTDB 監聽器 SHALL 僅在頁面載入時掛載一次，不隨相機狀態（idle/shooting/uploading）重建。**相機功能（含 RTDB 監聽）SHALL 只在 standalone PWA 模式下啟動**，非 standalone 模式不得掛載任何監聽器。

#### Scenario: 同步觸發成功
- **WHEN** 伺服器端更新 Firebase 中的 `trigger/last_shot` 為新的時間戳記（數值大於上一次已處理的值）
- **THEN** 所有正在運行拍照頁面的 iPhone 必須在 1 秒內收到通知並執行相機快門

#### Scenario: 頁面載入時不重播舊觸發
- **WHEN** iPhone 相機頁面載入，RTDB `trigger/last_shot` 已存在舊值（早於頁面載入時間）
- **THEN** 系統 SHALL NOT 觸發拍照（初始基準值設為頁面載入時間，只處理載入後的新觸發）

#### Scenario: 上傳中收到新觸發不遺漏
- **WHEN** iPhone 正在上傳前一張照片期間收到新的 RTDB 觸發信號
- **THEN** 新觸發 SHALL 被記錄為已收到，且在上傳完成後不因監聽器重建而遺失監聽

#### Scenario: 非 standalone 模式不掛載 RTDB 監聽
- **WHEN** 相機頁面在 Safari 瀏覽器中直接開啟（非 standalone 模式）
- **THEN** RTDB 監聽器 MUST NOT 建立，不得觸發任何拍照動作
