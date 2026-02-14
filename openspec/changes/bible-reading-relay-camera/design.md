## Context

本專案旨在建立一個支援 72 小時不間斷讀經接力的自動化拍照系統。系統需要協調兩台 iPhone 每 5 分鐘拍照一次，並提供公開介面讓參與者按時段（8 小時大時段與 15 分鐘小子相簿）檢索並下載照片。

## Goals / Non-Goals

**Goals:**
- 使用 Firebase Realtime Database 實現兩台 iPhone 的秒級同步拍照。
- 建立基於時段（0-8, 8-16, 16-24）的公開照片瀏覽與下載系統。
- 每個大時段內細分為 15 分鐘一個相簿，便於使用者快速查找。
- 部署於 Cloudflare Pages 以利用其全球邊緣網路與 R2 儲存優勢。
- 確保 72 小時運行期間的系統穩定性。

**Non-Goals:**
- 開發參與者登入與身分驗證系統。
- 串接外部報到系統 API。
- 開發原生 iOS App。

## Decisions

### 1. 拍照觸發機制：Firebase Realtime Database
- **決策**：使用 Firebase Realtime Database 的監聽機制。
- **理由**：Firebase 提供原生的 WebSocket 封裝，能實現極低延遲的指令同步，且在行動裝置網頁端的支援非常穩定。
- **操作**：Cron Job 修改 `trigger/last_shot` 時間戳記，iPhone 頁面監聽此變動執行拍照。

### 2. 照片組織架構：層級化相簿 (Firestore)
- **決策**：在 Firestore 中按時間戳記管理照片，前端按邏輯分層展示。
- **大時段 (Collection)**：0-8, 8-16, 16-24。
- **小子相簿 (Album)**：每 15 分鐘為一組。
- **理由**：簡化使用者查找照片的成本，無需搜尋，只需點擊對應的時間段。

### 3. 公開存取介面 (Photo Retrieval UI)
- **決策**：完全公開，無需登入。
- **流程**：首頁選擇日期 -> 選擇 8 小時大時段 -> 進入 15 分鐘相簿列表 -> 瀏覽/下載照片。

### 4. 照片儲存：Cloudflare R2
- **決策**：照片實體儲存在 Cloudflare R2。
- **理由**：無外傳流量費用 (Egress Fees)，支援大量併發下載。

### 5. 部署平台：Cloudflare Pages
- **決策**：使用 Next.js 部署於 Cloudflare Pages。
- **理由**：整合 R2 與 Workers 方便。

### 6. 監控機制：Firestore Device Status
- **決策**：iPhone 每分鐘將狀態（電量、時間）寫入 Firestore `devices` 集合。
- **即時回饋**：拍照指令由 RTDB 下達後，iPhone 立即在前端執行視覺回饋（邊框閃爍）。

## Risks / Trade-offs

- **[Risk] 公開存取導致流量激增** → **Mitigation**: R2 成本極低且無外傳費用，前端可使用 CDN 快取。
- **[Risk] 隱私考量** → **Trade-off**: 讀經活動為公開性質，且不再綁定個人姓名與編號，風險可控。
- **[Risk] iPhone 螢幕休眠** → **Mitigation**: 使用 `NoSleep.js` 並將網頁設為 PWA，要求使用者保持螢幕開啟。