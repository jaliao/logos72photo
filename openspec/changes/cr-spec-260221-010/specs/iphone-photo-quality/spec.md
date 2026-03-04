## ADDED Requirements

### Requirement: iPhone 裝置偵測
系統 SHALL 在相機頁面初始化時，以 `navigator.userAgent` 判斷當前裝置是否為 iPhone。偵測邏輯 SHALL 僅在客戶端執行（Client Component 內），不依賴伺服器端 User-Agent 解析。

#### Scenario: iPhone 裝置正確被偵測
- **WHEN** 相機頁面在 iPhone 上載入
- **THEN** `navigator.userAgent.includes('iPhone')` SHALL 回傳 `true`，系統進入高解析度串流模式

#### Scenario: 非 iPhone 裝置不受影響
- **WHEN** 相機頁面在非 iPhone 裝置（桌機、Android）上載入
- **THEN** `navigator.userAgent.includes('iPhone')` SHALL 回傳 `false`，系統維持原有 constraints（僅 `facingMode`）

### Requirement: iPhone 最大解析度串流
偵測到 iPhone 裝置時，`getUserMedia` 的 video constraints SHALL 加入 `width: { ideal: 9999 }` 與 `height: { ideal: 9999 }`，使瀏覽器自動選取該裝置硬體支援的最大串流解析度。

#### Scenario: iPhone 上取得最大解析度串流
- **WHEN** iPhone 相機頁面呼叫 `getUserMedia`
- **THEN** constraints SHALL 包含 `{ facingMode, width: { ideal: 9999 }, height: { ideal: 9999 } }`，瀏覽器 SHALL 回傳該裝置所能提供的最高解析度串流

#### Scenario: ideal 值超出硬體上限時不拋錯
- **WHEN** iPhone 硬體最大支援寬度小於 9999
- **THEN** 瀏覽器 SHALL 自動降至硬體上限值，`getUserMedia` SHALL NOT 拋出 `OverconstrainedError`

### Requirement: 拍照輸出與串流解析度一致
canvas 拍照輸出 SHALL 以串流實際解析度（`video.videoWidth` / `video.videoHeight`）為準，不做額外縮放或裁切，確保存檔影像完整保留串流畫素。

#### Scenario: canvas 尺寸跟隨串流解析度
- **WHEN** 系統執行拍照（`shoot()`）
- **THEN** `canvas.width` SHALL 等於 `video.videoWidth`，`canvas.height` SHALL 等於 `video.videoHeight`
