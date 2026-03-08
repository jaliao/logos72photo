## 1. Firebase RTDB 設定

- [x] 1.1 更新 Firebase RTDB Security Rules：新增 `sync/server_time` 節點可匿名讀取（`.read: true`）
- [x] 1.2 確認 `trigger/last_shot` 舊節點仍保留（不刪除，供 rollback 使用）

## 2. 伺服器端 API 更新

- [x] 2.1 修改 `app/api/trigger/route.ts`：將 `rtdbSet` 寫入目標從 `trigger/last_shot` 改為 `sync/server_time`
- [x] 2.2 確認 `rtdbSet` 呼叫不含 Authorization header，以匿名方式寫入
- [ ] 2.3 本地測試 `/api/trigger`：確認回傳 HTTP 200 且 RTDB `sync/server_time` 有值

## 3. 移除 RTDB 觸發監聽

- [x] 3.1 在 `app/camera/CameraClient.tsx` 中移除監聽 `trigger/last_shot` 的 RTDB listener（`onValue` / `ref` 相關邏輯）
- [x] 3.2 移除與舊觸發相關的狀態變數（如 `lastTriggerTs`、`initialTriggerRef` 等）
- [x] 3.3 確認移除後頁面無 console error，相機串流正常啟動

## 4. 實作本地定時拍照

- [x] 4.1 新增 `scheduleNextShot()` 函式：計算距下一個整 5 分鐘的 `delay`（ms）
- [x] 4.2 實作「距整點不足 2 秒則跳過」邏輯，排程下一個整點
- [x] 4.3 在頁面載入（`useEffect` mount）後立即呼叫 `scheduleNextShot()`
- [x] 4.4 拍照完成、`status` 回到 `'idle'` 後，自動呼叫 `scheduleNextShot()` 排程下一次
- [x] 4.5 在 `useEffect` cleanup 中清除 `setTimeout`，避免記憶體洩漏

## 5. 實作 RTDB 時間同步監聽

- [x] 5.1 在 `CameraClient.tsx` 新增監聽 `sync/server_time` 節點的 RTDB listener
- [x] 5.2 收到新值後計算 `serverTime - Date.now()`，儲存至狀態變數 `timeDiffMs`
- [x] 5.3 在 `useEffect` cleanup 中取消訂閱時間同步 listener

## 6. 狀態列 UI 更新

- [x] 6.1 將狀態列「RTDB 觸發：」欄位改為「時差：」，顯示 `timeDiffMs`（格式 `+Xms` / `-Xms`）
- [x] 6.2 `timeDiffMs` 為 `null`（尚未收到）時顯示 `—`
- [x] 6.3 確認「現在時間」與「心跳」指示點顯示邏輯不受影響

## 7. 整合測試

- [x] 7.1 在 iPhone Safari 開啟相機頁面，確認整 5 分鐘時自動進入倒數並拍照
- [x] 7.2 關閉 Firebase RTDB 連線（或斷網），確認拍照仍在整點正常觸發
- [x] 7.3 確認狀態列「時差」欄位在收到 `/api/trigger` 後 5 秒內更新
- [x] 7.4 確認頁面重新載入後定時器正確重設，不在非整點時刻拍照
