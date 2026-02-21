## 1. 基礎常數與版本

- [x] 1.1 新增 `lib/constants.ts`，定義 `HEARTBEAT_INTERVAL_MS = 15_000` 與 `OFFLINE_THRESHOLD_MS = HEARTBEAT_INTERVAL_MS * 3`
- [x] 1.2 將 `config/version.json` patch 版號 +1

## 2. 心跳間隔調整（CameraClient）

- [x] 2.1 修改 `app/camera/CameraClient.tsx`：引入 `HEARTBEAT_INTERVAL_MS`，將 `setInterval(sendHeartbeat, 30_000)` 改為使用常數
- [ ] 2.2 【手動】驗證相機頁面心跳仍正常發送（開啟相機頁，觀察 Network tab 每 15 秒有 POST /api/heartbeat）

## 3. Admin 路由保護（Middleware + 登入頁）

- [x] 3.1 新增或修改 `middleware.ts`：攔截 `/admin/**`，無有效 `admin_session` cookie 時重導向 `/admin/login`；`/admin/login` 本身不攔截
- [x] 3.2 新增 `app/admin/login/page.tsx`：密碼輸入表單（Server Component wrapper + `"use client"` 表單元件）
- [x] 3.3 新增 `app/admin/login/actions.ts`：Server Action `loginAction`，比對 `process.env.ADMIN_PASSWORD`，成功時以 `cookies().set()` 設定 HttpOnly `admin_session` cookie，失敗時回傳錯誤訊息
- [x] 3.4 在 `app/admin/login/actions.ts` 新增 `logoutAction` Server Action，清除 `admin_session` cookie 並重導向 `/admin/login`
- [x] 3.5 在監控儀表板加入「登出」按鈕，呼叫 `logoutAction`
- [x] 3.6 【手動】在 Cloudflare Pages Dashboard → Settings → Environment variables 設定 `ADMIN_PASSWORD`；本機補上 `.env.local`
- [ ] 3.7 【手動】驗證：未登入時存取 `/admin/monitoring` 被導向 `/admin/login`；登入後可正常存取；登出後再次被導向

## 4. 監控儀表板即時化（Client Component + onSnapshot）

- [x] 4.1 重構 `app/admin/monitoring/page.tsx`：加入 `"use client"`，移除 `export const runtime = 'edge'` 與 `export const dynamic`
- [x] 4.2 在頁面中以 `useEffect` 初始化 Firestore `onSnapshot`，監聽 `devices` 集合，以 `useState<DeviceDoc[]>` 儲存裝置清單
- [x] 4.3 新增 `useState<number>` 儲存 `now`，以 `setInterval(1000)` 每秒更新，供 HeartbeatStatus、倒數顯示、離線判斷使用
- [x] 4.4 修改 `HeartbeatStatus` 元件：離線閾值改用 `OFFLINE_THRESHOLD_MS`（取代原本 `5 * 60_000`）
- [x] 4.5 新增「下次心跳倒數」顯示：`Math.max(0, Math.round((last_heartbeat + HEARTBEAT_INTERVAL_MS - now) / 1000))` 秒，離線時顯示 `—`
- [x] 4.6 新增離線警告 Badge：當 `now - last_heartbeat > OFFLINE_THRESHOLD_MS` 時在裝置卡標題列顯示紅色「失聯」Badge
- [x] 4.7 移除頁面底部「此頁面每次重整更新資料」的提示文字

## 5. Firestore Security Rules

- [x] 5.1 【確認】Firestore Rules 已有 `devices` 集合 `allow read: if true`，無需變更
- [x] 5.2 【手動】部署 Rules 後，確認 client-side `onSnapshot` 可正常取得 `devices` 資料（無 permission-denied 錯誤）

## 6. 整合驗證

- [x] 6.1 【手動】開啟相機頁與監控儀表板各一視窗，確認心跳到達後儀表板在 1 秒內自動更新電量與連線狀態
- [x] 6.2 【手動】拍照後確認儀表板縮圖在 1 秒內自動刷新
- [x] 6.3 【手動】停止相機心跳 30 秒，確認儀表板顯示紅色「失聯」Badge
- [x] 6.4 【手動】重新恢復心跳，確認 Badge 消失並恢復「連線中」
- [ ] 6.5 【跳過】更新 `README-AI.md`（`.ai-rules.md` 不存在，略過）
