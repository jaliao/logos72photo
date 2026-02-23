## 1. 型別與 State 擴充

- [x] 1.1 將 `'countdown'` 加入 `status` union type（`'idle' | 'countdown' | 'shooting' | 'uploading' | 'error'`）
- [x] 1.2 新增 `facingMode` state（`'environment' | 'user'`，預設 `'environment'`）
- [x] 1.3 新增 `countdown` state（`number`，初始值 `0`）
- [x] 1.4 新增 `countdownRef` useRef 儲存 `setInterval` 回傳的 interval ID

## 2. 鏡頭切換（camera-flip）

- [x] 2.1 修改相機啟動 useEffect：依賴陣列加入 `facingMode`，啟動新串流前先停止舊 stream 所有 track
- [x] 2.2 新增 `flipCamera()` 函式：切換 `facingMode`（`'environment'` ↔ `'user'`）
- [x] 2.3 新增鏡頭切換按鈕 UI：`status !== 'idle'` 時設為 `disabled`，不可點擊

## 3. 拍照倒數機制（countdown-shutter）

- [x] 3.1 修改 RTDB 觸發 handler：收到觸發且 `status === 'idle'` 時，設 `status: 'countdown'`、`countdown: 15`，啟動 `setInterval`（每 1000ms 遞減）
- [x] 3.2 interval callback：每秒將 `countdown` 遞減 1；當遞減至 `0` 時清除 interval（`clearInterval(countdownRef.current)`）並呼叫 `shoot()`
- [x] 3.3 確認 shoot guard 條件：`status !== 'idle'` 已涵蓋 `'countdown'`、`'shooting'`、`'uploading'`，不需另外判斷
- [x] 3.4 在相機啟動 useEffect 的 cleanup function 中加入 `clearInterval(countdownRef.current)` 防止 memory leak

## 4. 倒數視覺特效

- [x] 4.1 新增倒數覆蓋層：`status === 'countdown'` 時渲染，以 `absolute inset-0` 定位於 video 之上，背景使用 `bg-black/60`
- [x] 4.2 覆蓋層中央顯示 `countdown` 數字，使用大號字體（`text-9xl font-bold text-white`）並套用 `animate-pulse`
- [x] 4.3 狀態列：`status === 'countdown'` 時將狀態文字改為「即將拍照」並套用 `animate-pulse`

## 5. 修正現有 TODO

- [x] 5.1 心跳指示點：移除 TODO，改以 `lastHeartbeat` 時間戳判斷在線（距今 ≤ 30 秒 → 綠色，否則灰色）
- [x] 5.2 狀態列時間顯示：移除 TODO，新增 `currentTime` state（`string`），useEffect 每秒呼叫 `new Date().toLocaleTimeString('zh-TW', { hour12: false })` 更新，cleanup 時清除 interval

## 6. 版本與文件

- [x] 6.1 更新 `config/version.json`：patch 版號 +1
- [ ] 6.2 依 `.ai-rules.md` 更新 `README-AI.md`，反映新功能（鏡頭切換、拍照倒數）
