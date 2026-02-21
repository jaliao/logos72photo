## 1. CameraClient 重構

- [x] 1.1 修改 `CameraClient` 函式簽名，新增 `deviceId: string` prop，移除 `process.env.NEXT_PUBLIC_DEVICE_ID` 直接讀取
- [x] 1.2 新增 `isStandalone` state（`null | boolean`），在 `useEffect` 中以 `window.matchMedia('(display-mode: standalone)')` 與 `navigator.standalone` OR 合併偵測
- [x] 1.3 新增 `InstallGuide` 元件，顯示裝置 ID 與加入主畫面操作說明（分享圖示 → 加入主畫面）
- [x] 1.4 在所有相機功能的 `useEffect`（攝影機串流、NoSleep、RTDB 監聽、心跳、超時警告）加入 `if (!isStandalone) return` 守衛
- [x] 1.5 `isStandalone === null` 時回傳 `null`（SSR/偵測中空白），`false` 時回傳 `<InstallGuide>`，`true` 時回傳相機主畫面

## 2. 新增路由頁面

- [x] 2.1 建立 `app/camera1/` 目錄，新增 `page.tsx`，設定 PWA metadata（title: `接力相機 1`），傳入 `deviceId="iphone-1"` 給 `CameraClient`
- [x] 2.2 建立 `app/camera2/` 目錄，新增 `page.tsx`，設定 PWA metadata（title: `接力相機 2`），傳入 `deviceId="iphone-2"` 給 `CameraClient`
- [x] 2.3 更新 `app/camera/page.tsx`，改為傳入 `deviceId={process.env.NEXT_PUBLIC_DEVICE_ID ?? 'iphone-unknown'}` prop（向下相容）

## 3. 文件更新

- [x] 3.1 更新 `README.md` iPhone 開機步驟：相機網址改為 `/camera1`（iphone-1）與 `/camera2`（iphone-2），說明重複加入防護機制

## 4. 部署與驗證

- [ ] 4.1 部署新 build 至 Cloudflare Pages（`git push origin main`）
- [ ] 4.2 iPhone 1：Safari 開啟 `https://logos72photo.pages.dev/camera1` → 確認顯示安裝引導 → 加入主畫面為「接力相機 1」
- [ ] 4.3 iPhone 2：Safari 開啟 `https://logos72photo.pages.dev/camera2` → 確認顯示安裝引導 → 加入主畫面為「接力相機 2」
- [ ] 4.4 兩台 iPhone 從主畫面圖示開啟 → 確認各自進入相機模式，狀態列顯示 `iphone-1` / `iphone-2`
- [ ] 4.5 開啟監控儀表板 `https://logos72photo.pages.dev/admin/monitoring` → 確認同時顯示 `iphone-1` 與 `iphone-2` 兩張裝置卡片，均為「連線中」
