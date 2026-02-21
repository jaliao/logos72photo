## 1. 修正 RTDB 監聽器穩定性

- [x] 1.1 在 `CameraClient.tsx` 新增 `shootRef = useRef(shoot)`，並在每次 render 以 `useEffect` 同步最新的 `shoot` 至 ref
- [x] 1.2 將 RTDB `onValue` 的 `useEffect` 依賴改為 `[]`（只掛載一次），callback 內改呼叫 `shootRef.current()`

## 2. 修正觸發條件（改為遞增比較）

- [x] 2.1 新增 `lastProcessedTriggerRef = useRef<number>(Date.now())`，初始值為頁面載入時間
- [x] 2.2 在 `onValue` callback 中，將 `now - val < 10_000` 判斷改為 `val > lastProcessedTriggerRef.current`
- [x] 2.3 觸發拍照後立即更新 `lastProcessedTriggerRef.current = val`

## 3. UI 新增 RTDB 觸發時間顯示

- [x] 3.1 新增 state `lastRtdbTrigger: number | null`，在 `onValue` callback 中收到新值時更新
- [x] 3.2 在狀態列新增「RTDB 觸發：{formatTime(lastRtdbTrigger)}」欄位，未收到時顯示「—」

## 4. 更新 README

- [x] 4.1 在 `README.md` 新增「觸發鏈路除錯指南」章節，說明完整觸發流程（Cron → `/api/trigger` → RTDB → iPhone）
- [x] 4.2 列出各環節的檢查方式：Cloudflare Worker 日誌、手動呼叫 `/api/trigger`、觀察相機頁面「RTDB 觸發」欄位時間是否更新
- [x] 4.3 說明如何區分問題來源：若「RTDB 觸發」欄位未更新 → 問題在 Cron/API 端；若欄位有更新但未拍照 → 問題在 iPhone 監聽端
