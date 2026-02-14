## 1. 基礎設施與環境設定

- [ ] 1.1 初始化 Next.js 專案並配置 TypeScript 與 Tailwind CSS
- [ ] 1.2 在 Firebase Console 建立專案並啟用 Realtime Database 與 Firestore
- [ ] 1.3 在 Cloudflare Dashboard 建立 R2 Bucket
- [ ] 1.4 設定專案環境變數，包含 Firebase Config 與 Cloudflare R2 憑證

## 2. 資料架構與模型實作

- [ ] 2.1 建立 Firestore `participants` 集合，定義參與者報到資料結構
- [ ] 2.2 建立 Firestore `photos` 集合，定義照片 metadata 結構（含 R2 URL 與關聯 ID）
- [ ] 2.3 初始化 Firebase Realtime Database 節點 `trigger/last_shot` 用於拍照同步

## 3. 外部身分驗證與時段整合

- [ ] 3.1 實作 Next.js API Route `/api/auth/verify` 串接外部報到系統 API
- [ ] 3.2 實作登入頁面，支援輸入姓名與委身編號
- [ ] 3.3 處理外部 API 回傳的多時段 (Time Slots) 資料結構轉換
- [ ] 3.4 實作 Session 或 JWT 機制以維持參與者的驗證狀態

## 4. iPhone 相機控制端 (PWA)

- [ ] 4.1 建立專屬的相機拍照頁面，並設定 PWA 支援以利全螢幕運行
- [ ] 4.2 整合 `NoSleep.js` 確保 iPhone 在 72 小時運行期間不會自動休眠
- [ ] 4.3 實作 Firebase RTDB 監聽器，當 `trigger/last_shot` 變更時觸發拍照
- [ ] 4.4 使用瀏覽器 MediaDevices API 實作快門拍照功能並獲取 Image Blob

## 5. 照片上傳與雲端儲存

- [ ] 5.1 實作 Next.js API Route 或 Cloudflare Worker 接收照片上傳至 R2
- [ ] 5.2 實作拍照後的自動上傳流程，確保檔名包含裝置 ID 與時間戳記
- [ ] 5.3 上傳成功後，在 Firestore 的 `photos` 集合建立對應的連結紀錄

## 6. 照片查詢與多時段檢索介面

- [ ] 6.1 實作照片牆頁面，根據登入取得的時段清單查詢 Firestore
- [ ] 6.2 實作按時段分組的照片顯示邏輯
- [ ] 6.3 實作照片預覽與下載功能，支援高解析度圖檔下載至行動裝置

## 7. 自動化觸發與部署

- [ ] 7.1 建立一個安全的 API Endpoints 用於手動或自動更新 RTDB 時間戳記
- [ ] 7.2 配置 Vercel Cron 或 Cloudflare Workers Cron 每 5 分鐘呼叫一次觸發 API
- [ ] 7.3 部署專案至 Cloudflare Pages 並完成最終端對端測試

## 8. 系統監控與視覺回饋

- [ ] 8.1 在 iPhone 拍照頁面實作「心跳」機制，每分鐘同步電量與狀態至 Firestore
- [ ] 8.2 在 iPhone 拍照頁面實作拍照成功後的綠色邊框閃爍效果
- [ ] 8.3 實作中央監控儀表板頁面 (`/admin/monitoring`)，顯示各裝置狀態
- [ ] 8.4 在儀表板整合最新照片縮圖，方便工作人員遠端確認構圖是否正常
