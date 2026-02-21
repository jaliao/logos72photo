## 1. 基礎設施與環境設定

- [x] 1.1 初始化 Next.js 專案並配置 TypeScript 與 Tailwind CSS
- [x] 1.2 在 Firebase Console 建立專案並啟用 Realtime Database 與 Firestore
- [x] 1.3 在 Cloudflare Dashboard 建立 R2 Bucket
- [x] 1.4 設定專案環境變數，包含 Firebase Config 與 Cloudflare R2 憑證

## 2. 資料架構與模型實作

- [x] 2.1 建立 Firestore `photos` 集合，定義照片 metadata 結構（含 R2 URL、timestamp、device_id、slot_8h、slot_15m）
- [x] 2.2 初始化 Firebase Realtime Database 節點 `trigger/last_shot` 用於拍照同步

## 3. iPhone 相機控制端 (PWA)

- [x] 3.1 建立專屬的相機拍照頁面，並設定 PWA 支援以利全螢幕運行
- [x] 3.2 整合 `NoSleep.js` 確保 iPhone 在 72 小時運行期間不會自動休眠
- [x] 3.3 實作 Firebase RTDB 監聽器，當 `trigger/last_shot` 變更時觸發拍照
- [x] 3.4 使用瀏覽器 MediaDevices API 實作快門拍照功能並獲取 Image Blob

## 4. 照片上傳與雲端儲存

- [x] 4.1 實作 Next.js API Route 接收照片上傳至 R2，路徑格式：`YYYY-MM-DD/device_id_timestamp.jpg`
- [x] 4.2 實作拍照後的自動上傳流程，確保檔名包含裝置 ID 與時間戳記
- [x] 4.3 上傳成功後，在 Firestore 的 `photos` 集合建立對應的連結紀錄

## 5. 照片查詢與多時段檢索介面（公開存取）

- [x] 5.1 實作首頁，提供日期選擇器與三個 8 小時大時段按鈕（0-8, 8-16, 16-24），無需登入
- [x] 5.2 實作按時段分組的 15 分鐘子相簿列表頁面
- [x] 5.3 實作照片預覽與下載功能，支援高解析度圖檔下載至行動裝置

## 6. 自動化觸發與部署

- [x] 6.1 建立安全的 API Endpoint 用於手動或自動更新 RTDB 時間戳記（`/api/trigger`）
- [x] 6.2 配置 Cloudflare Workers Cron 每 5 分鐘呼叫一次觸發 API
- [x] 6.3 部署專案至 Cloudflare Pages 並完成最終端對端測試

## 7. 系統監控與視覺回饋

- [x] 7.1 在 iPhone 拍照頁面實作「心跳」機制，每分鐘同步電量與狀態至 Firestore
- [x] 7.2 在 iPhone 拍照頁面實作拍照成功後的綠色邊框閃爍效果
- [x] 7.3 實作中央監控儀表板頁面 (`/admin/monitoring`)，顯示各裝置狀態
- [x] 7.4 在儀表板整合最新照片縮圖，方便工作人員遠端確認構圖是否正常
