## Why

相機端（iPhone 拍照頁面）未在每 5 分鐘收到觸發指令，導致無法自動拍照。核心問題在於 Cloudflare Worker Cron → `/api/trigger` → Firebase RTDB → 相機端 的觸發鏈路存在斷點，需診斷並修復。

## What Changes

- 新增 `/api/trigger` 的 GET 無驗證端點（或調整驗證方式）以便手動測試觸發是否正常
- 調整相機端 RTDB 監聽邏輯：將 10 秒新鮮度視窗放寬，或改以「值是否比上次大」作為觸發條件，避免因時脈誤差導致遺漏觸發
- 修正 `useEffect` 依賴 `shoot` 導致 RTDB 監聽器頻繁重建的問題（透過 `useRef` 解耦）
- 在相機頁面新增「上次觸發時間戳記（RTDB 值）」顯示，方便現場確認 RTDB 是否有更新

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `camera-control`：調整觸發判斷邏輯（新鮮度視窗、監聽器穩定性）

## Impact

- `app/camera/CameraClient.tsx`：核心修改，RTDB 監聽邏輯與 UI 除錯資訊
- `app/api/trigger/route.ts`：可能需調整 GET 端點的驗證方式以支援手動測試
- 不影響照片上傳、Firestore 寫入、監控儀表板等其他模組
