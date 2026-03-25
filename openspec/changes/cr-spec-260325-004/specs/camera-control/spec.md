## ADDED Requirements

### Requirement: 裝置下線狀態顯示
相機 Client Component 接收 `initialEnabled: boolean` prop（由 Server Component 從 Firestore 預取）。若 `initialEnabled === false`，SHALL 渲染裝置下線畫面，顯示「裝置已下線，請聯繫管理員」及裝置 ID，且 MUST NOT 執行 `getUserMedia`、RTDB 監聽或心跳送出。

#### Scenario: initialEnabled=false 顯示下線畫面
- **WHEN** Client Component 收到 `initialEnabled={false}`
- **THEN** 頁面 SHALL 渲染下線提示畫面，相機串流 MUST NOT 啟動，RTDB 監聽 MUST NOT 掛載

#### Scenario: initialEnabled=true 正常啟動
- **WHEN** Client Component 收到 `initialEnabled={true}`
- **THEN** 頁面 SHALL 依現有邏輯進行 standalone 偵測與相機初始化

### Requirement: Stream 暖機計時器
相機 Client Component SHALL 在 `getUserMedia` 的 Promise resolve 時，記錄 `streamReadyAt = Date.now()` 至 `useRef`。此時間戳記供 `shoot()` 函式判斷是否需要等待暖機完成。

#### Scenario: getUserMedia 成功後記錄時間
- **WHEN** `getUserMedia` Promise resolve，相機串流就緒
- **THEN** `streamReadyAt.current` SHALL 被設為當前時間戳記（毫秒）

#### Scenario: 頁面初始狀態
- **WHEN** 頁面載入，`getUserMedia` 尚未呼叫
- **THEN** `streamReadyAt.current` SHALL 為 `null` 或 `0`，`shoot()` 遇到此狀態時直接返回

### Requirement: 拍照流程整合黑圖偵測與暖機保護
`shoot()` 函式 SHALL 依序執行：（1）暖機等待、（2）`drawImage`、（3）黑圖亮度取樣、（4）若黑圖則重試（最多 3 次，每次等待 500ms）、（5）3 次仍黑則寫入 error log 並重設狀態為 `'idle'`，（6）通過偵測後執行 `toBlob` → 上傳。

#### Scenario: 正常拍照不受黑圖偵測影響
- **WHEN** 暖機完成，`drawImage` 後取樣亮度 ≥ 8
- **THEN** `shoot()` SHALL 直接執行 `toBlob` → 上傳，不引入額外延遲

#### Scenario: 黑圖重拍後成功
- **WHEN** 第一次 `drawImage` 後亮度 < 8，第二次重拍後亮度 ≥ 8
- **THEN** `shoot()` SHALL 使用第二次 canvas 內容執行 `toBlob` → 上傳

#### Scenario: 3 次重拍仍黑圖則重設 idle
- **WHEN** 4 次嘗試（原拍 + 3 次重拍）均亮度 < 8
- **THEN** `shoot()` SHALL 寫入 error log（`source: 'camera:black-frame'`）並將 `status` 設為 `'idle'`，不執行上傳
