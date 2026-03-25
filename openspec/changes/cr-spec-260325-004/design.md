## Context

系統有 `iphone-1`（camera1）與 `iphone-2`（camera2）兩台裝置，透過 `/camera1`、`/camera2` 路由進入相機頁面（`CameraClient.tsx`），每 5 分鐘由 RTDB 觸發同步拍照後上傳至 R2，並寫入 Firestore `photos` 集合。

目前缺少：裝置啟停機制、黑圖防護、stream 暖機等待。

技術環境限制：
- Upload API 使用 Edge Runtime（`export const runtime = 'edge'`），Firestore 存取透過 REST API（`lib/firebase-rest.ts`）。
- Camera 頁面為 Client Component，無法在 server 端取得裝置即時狀態。
- 後台頁面皆為 Edge Runtime + Server Component。

## Goals / Non-Goals

**Goals:**
- 後台可切換個別裝置的啟用狀態，停用後立即阻止上傳。
- 相機頁面在裝置停用時顯示下線提示，不啟動相機。
- 拍照後偵測黑圖，自動重拍最多 3 次，仍黑則跳過並記錄 error log。
- Stream 啟動後有 1.5 秒暖機保護，避免拍到黑幀。

**Non-Goals:**
- 遠端關閉相機 stream。
- 自動刪除已上傳的黑圖。
- 超過 2 台裝置的擴充。

## Decisions

### 1. 裝置狀態儲存：Firestore `devices/{device_id}`

**選擇：** Firestore collection `devices`，文件 ID 為 `device_id`（如 `iphone-1`），欄位 `enabled: boolean`。

**為何不用 RTDB：** RTDB 已用於即時觸發（heartbeat、last_shot），加入管理設定會混淆職責。Firestore 適合持久化設定。

**向下相容：** 文件不存在（舊裝置未設定）→ 視為 `enabled: true`，不破壞現有行為。

**Admin API：** 新增 `GET /api/admin/devices`（列出所有裝置）與 `PATCH /api/admin/devices/[deviceId]`（切換啟用狀態）。

---

### 2. 停用裝置的雙層阻擋

**上傳 API（server-side enforcement）：**
- `firebase-rest.ts` 新增 `getDoc(collection, id)` 輔助函式。
- 上傳前讀取 `devices/{device_id}`，若 `enabled === false` 回傳 `403 Forbidden`。
- 讀取失敗（網路錯誤）→ 放行（fail open），不阻斷正常上傳。

**相機頁面（UX layer）：**
- `CameraClient.tsx` 在 `useEffect` 初始化時，透過 `fetch('/api/admin/devices/{deviceId}')` 讀取狀態。
- 停用 → 顯示「裝置已下線，請聯繫管理員」，不啟動 `getUserMedia`。
- 啟用 → 正常啟動相機。

**為何不在 Server Component 傳 prop：** camera1/camera2 的 `page.tsx` 已是 Edge Server Component，可在此讀取並傳 `initialEnabled` prop 給 Client Component，減少 client 端額外 fetch。✅ 採用此方案。

---

### 3. 黑圖偵測：canvas 像素取樣

**位置：** `canvas.drawImage(video, 0, 0)` 之後，`canvas.toBlob()` 之前。

**取樣策略：** 取 canvas 中心 64×64 px 區域（避免邊緣光暈影響），計算所有像素的平均亮度（`Y = 0.299R + 0.587G + 0.114B`）。

**閾值：** `avgLuminance < 8`（滿分 255）視為黑圖。

**重拍邏輯：**
```
for attempt in 1..3:
  drawImage → sample → if not black → proceed
  wait 500ms → drawImage again
if still black after 3: logError + return (skip upload)
```

**為何不重試整個 shoot()：** 避免狀態機複雜化；直接在 `drawImage` 層重試即可，不需重置 `status`。

---

### 4. Stream 暖機保護

在 `getUserMedia` resolve 時記錄 `streamReadyAt = Date.now()`（存入 `useRef`）。

`shoot()` 開始時：
```
const elapsed = Date.now() - streamReadyAt.current
if (elapsed < WARMUP_MS) await sleep(WARMUP_MS - elapsed)
```

`WARMUP_MS = 1500`（1.5 秒）。

**為何是 1.5 秒：** iOS 文件未說明 sensor warm-up 時間；實測 1–2 秒可覆蓋大多數 cold start 情況，且對 10 秒倒數影響微小。

---

### 5. Admin 裝置管理 UI

新頁面 `/admin/devices`（Server Component + 互動用 Client Action）：
- 列出已知裝置（`iphone-1`、`iphone-2`），顯示啟用狀態。
- 切換按鈕 → 呼叫 `PATCH /api/admin/devices/[deviceId]`。
- 裝置預設啟用，若 Firestore 文件不存在則即時建立。

## Risks / Trade-offs

| 風險 | 緩解 |
|------|------|
| getDoc 讀取延遲拖慢 upload API | 採 fail open：讀取超時 / 失敗時直接放行，不阻斷上傳 |
| 黑圖閾值 8/255 太嚴格（夜間真實暗景誤判） | 閾值可未來調整；目前場景（婚禮室內）平均亮度應遠高於 8 |
| warm-up 1.5s + 重拍 3×500ms = 最壞 3s 額外延遲 | 倒數 10 秒，影響可接受；upload 仍在正常時間窗內 |
| Admin toggle 與相機頁面有快取差異 | `initialEnabled` 在 Server Component fetch，每次頁面載入取最新值；無持久快取問題 |

## Migration Plan

1. 部署新版本（含 `getDoc` + upload 檢查 + admin 頁面）。
2. 兩台裝置預設 `enabled: true`（文件不存在時 fail open）。
3. 需停用 camera1 時，後台切換即生效；下次上傳觸發時 API 回 403。
4. 換機後，後台重新啟用即可。

**Rollback：** 若 `getDoc` 造成 upload 問題，直接移除檢查邏輯並重新部署；Firestore `devices` collection 留存不影響其他功能。

## Open Questions

- `WARMUP_MS` 是否需要可設定（env var）？目前硬編碼 1500ms。
- 黑圖 logError 的 `source` 欄位命名：`camera:black-frame` 或 `camera:black-photo`？
