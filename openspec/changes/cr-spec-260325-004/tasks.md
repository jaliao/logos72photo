## 1. Firestore 資料層

- [x] 1.1 在 `lib/firebase-rest.ts` 新增 `getDoc(collection, docId)` 輔助函式，回傳文件欄位或 `null`（文件不存在）
- [x] 1.2 確認 `setDoc` 支援 `devices` collection 寫入（應可直接複用）
- [x] 1.3 版本號 +1（`config/version.json` patch）

## 2. 上傳 API：裝置啟用驗證

- [x] 2.1 在 `app/api/upload/route.ts` 上傳邏輯最前端呼叫 `getDoc('devices', deviceId)`
- [x] 2.2 若 `enabled === false` 回傳 `403 { error: '裝置已停用' }`，不執行 R2 上傳或 Firestore 寫入
- [x] 2.3 讀取失敗（try/catch）時 fail open，繼續正常上傳流程

## 3. 後台裝置管理 API

- [x] 3.1 建立 `app/api/admin/devices/route.ts`：`GET` 列出 `iphone-1`、`iphone-2` 的啟用狀態（讀 Firestore，文件不存在時預設 `enabled: true`）
- [x] 3.2 建立 `app/api/admin/devices/[deviceId]/route.ts`：`PATCH` 接收 `{ enabled: boolean }`，呼叫 `setDoc('devices', deviceId, { enabled })` 更新狀態
- [x] 3.3 兩支 API 均加入 `admin_session` cookie 驗證，未登入回傳 `401`

## 4. 後台裝置管理頁面

- [x] 4.1 建立 `app/admin/devices/page.tsx`（Edge Server Component），載入時呼叫 `GET /api/admin/devices` 取得初始狀態
- [x] 4.2 建立 Client Component（`DeviceToggle`），顯示裝置卡片與啟用/停用切換按鈕，呼叫 `PATCH` API 後更新本地 state
- [x] 4.3 在 `app/admin/page.tsx` 或後台 layout 加入「裝置管理」連結導向 `/admin/devices`

## 5. 相機頁面：Server Component 預取裝置狀態

- [x] 5.1 在 `app/camera1/page.tsx` 呼叫 `getDoc('devices', 'iphone-1')`，取得 `initialEnabled`（讀取失敗預設 `true`）
- [x] 5.2 將 `initialEnabled` prop 傳入 `<CameraClient>`（同樣處理 `app/camera2/page.tsx`）

## 6. 相機 Client Component：裝置下線顯示

- [x] 6.1 在 `CameraClient.tsx` 新增 `initialEnabled: boolean` prop
- [x] 6.2 若 `initialEnabled === false`，渲染「裝置已下線，請聯繫管理員」畫面（類似 `InstallGuide` 元件），不執行任何 `useEffect` 中的相機初始化邏輯

## 7. 相機 Client Component：Stream 暖機保護

- [x] 7.1 新增 `streamReadyAt = useRef<number>(0)`
- [x] 7.2 在 `getUserMedia` resolve 後設定 `streamReadyAt.current = Date.now()`
- [x] 7.3 在 `shoot()` 開始處，計算 `elapsed = Date.now() - streamReadyAt.current`，若 `streamReadyAt.current === 0` 則直接返回；若 `elapsed < 1500` 則 `await sleep(1500 - elapsed)`

## 8. 相機 Client Component：黑圖偵測與重拍

- [x] 8.1 新增 `sampleLuminance(canvas, ctx): number` 輔助函式，取 canvas 中心 64×64 px，回傳平均亮度（`ctx.getImageData` + `0.299R + 0.587G + 0.114B`）
- [x] 8.2 在 `shoot()` 的 `drawImage` 之後（`toBlob` 之前）呼叫 `sampleLuminance`
- [x] 8.3 實作重拍迴圈：最多 3 次重試，每次等待 500ms 後重新 `drawImage` + 取樣
- [x] 8.4 3 次仍黑：呼叫 `logError(deviceId, 'camera:black-frame', '連續 4 次偵測到黑圖，跳過本次觸發')`，`setStatus('idle')`，返回不上傳

## 9. 驗證與收尾

- [ ] 9.1 確認停用 `iphone-1` 後上傳請求回傳 403，相機頁面顯示下線畫面
- [ ] 9.2 確認後台 `/admin/devices` 可切換啟用/停用，UI 即時更新
- [x] 9.3 更新 `README-AI.md`（依 `.ai-rules.md` 規則）
