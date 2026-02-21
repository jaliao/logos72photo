## 1. 相機 Hotfix（程式碼）

- [x] 1.1 修改 `app/camera/CameraClient.tsx`：注解 standalone 偵測邏輯，改為 `setIsStandalone(true)` 直接啟動相機

## 2. Firebase RTDB 設定

- [x] 2.1 Firebase Console → Realtime Database → 規則 → 設定 `trigger/last_shot` 公開讀取規則並發布
- [x] 2.2 確認 `NEXT_PUBLIC_FIREBASE_DATABASE_URL` 環境變數已設定於 Cloudflare Pages Production

## 3. Cloudflare Worker Cron 部署

- [x] 3.1 執行 `wrangler secret put TRIGGER_API_SECRET`，寫入與 Pages 相同的 secret 值
- [x] 3.2 執行 `wrangler deploy workers/cron-trigger.ts`，確認 Cron schedule `*/5 * * * *` 已啟動

## 4. 文件更新

- [x] 4.1 新增「Firebase RTDB 設定」章節至 `README.md`（啟用、規則、環境變數、驗證）
- [x] 4.2 新增「Cloudflare Worker Cron 部署」章節至 `README.md`

## 5. 端對端驗證

- [x] 5.1 手動執行 `curl -X POST https://logos72photo.pages.dev/api/trigger -H "x-trigger-secret: ..."` 確認回傳 `{"ok":true}`
- [x] 5.2 Firebase Console → Realtime Database → 確認 `trigger/last_shot` 節點有更新
- [x] 5.3 iPhone 相機頁面底部「RTDB 觸發：」欄位確認有接收到觸發時間
- [x] 5.4 等待下一個 5 分鐘整點，Cloudflare Worker Logs 確認 Cron 自動觸發成功
- [x] 5.5 監控儀表板 `https://logos72photo.pages.dev/admin/monitoring` 確認兩台裝置均顯示最新拍照縮圖
