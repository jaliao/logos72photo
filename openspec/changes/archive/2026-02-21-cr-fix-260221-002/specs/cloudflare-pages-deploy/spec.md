## MODIFIED Requirements

### Requirement: 監控儀表板可在 Edge Runtime 讀取 Firestore 資料
監控儀表板頁面（`/admin/monitoring`）在 Cloudflare Workers Edge Runtime 中執行時，系統 SHALL 透過 Firestore REST API（而非 Firebase Client SDK）讀取 `devices` 集合的所有文件。

#### Scenario: 正常讀取裝置列表
- **WHEN** 使用者訪問 `/admin/monitoring`
- **THEN** 系統透過 Firestore REST API 取得所有裝置文件，並正常渲染監控儀表板

#### Scenario: Edge Runtime 中無 Firebase Client SDK 依賴
- **WHEN** 監控頁面在 Cloudflare Workers 中執行
- **THEN** 不載入 `firebase/firestore` 或 `lib/firebase`，避免 Error 1101

#### Scenario: Firestore 集合為空
- **WHEN** `devices` 集合尚無文件
- **THEN** 頁面顯示「尚無裝置資料」而非錯誤
