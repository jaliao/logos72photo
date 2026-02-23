## Context

`CameraClient.tsx` 是接力相機的核心 Client Component，負責相機串流、RTDB 監聽觸發拍照、心跳上報。目前有兩個待補功能：

1. **鏡頭切換**：硬編為 `facingMode: 'environment'`，無法切換前鏡頭
2. **拍照倒數**：收到 RTDB 觸發後直接拍照，無視覺倒數特效（程式碼內有 TODO 標記）

所有變更集中於單一檔案，無跨模組影響。

## Goals / Non-Goals

**Goals:**
- 新增鏡頭切換按鈕（前 ↔ 後），重新取得 MediaStream
- 收到 RTDB 觸發後先倒數 15 秒，再執行 `shoot()`
- 倒數期間畫面中央顯示大型數字，搭配縮放動畫與暗色光暈
- 狀態列新增「即將拍照」閃爍提示（`status === 'countdown'`）
- 清除現有 TODO 備註（心跳綠點、時間顯示）

**Non-Goals:**
- 不修改任何 API 路由或 Firestore schema
- 不處理多裝置同步倒數
- 不實作可配置倒數秒數（固定 15 秒）

## Decisions

### 1. 倒數實作：`setInterval` vs `setTimeout` 鍊

**選擇：`setInterval` + `useRef` 計數器**

每秒遞減 `countdownRef.current`，驅動 `countdown` state 更新 UI，結束時清除 interval 並呼叫 `shoot()`。

相較於遞迴 `setTimeout`，`setInterval` 在 React 中搭配 `useRef` 清除更直觀，且不需擔心閉包過期問題。

### 2. `status` 新增 `'countdown'` 狀態

**選擇：擴充現有 `status` union type**

```ts
'idle' | 'countdown' | 'shooting' | 'uploading' | 'error'
```

倒數期間 `shoot()` guard 邏輯需擋住重複觸發，直接在現有 `status` 加入 `'countdown'` 最省改動，不需另開 ref。

### 3. 鏡頭切換：停止舊 stream → 重新 getUserMedia

**選擇：`facingMode` state + `useEffect` 依賴重啟**

新增 `facingMode: 'environment' | 'user'` state，當切換時觸發相機啟動 `useEffect`（依賴 `facingMode`），先停止舊 stream 再重新取得新串流。這樣能重用現有的 stream 啟動邏輯，改動最小。

### 4. 倒數視覺特效：純 Tailwind CSS

**選擇：`animate-ping` + `scale` transform，不引入外部動畫庫**

中央數字以絕對定位疊加於 video 上，搭配 Tailwind `animate-pulse` 或自定義 keyframe。保持零依賴原則。

## Risks / Trade-offs

- **倒數中途被新觸發打斷**：若 RTDB 在倒數 15 秒內再次觸發，`status === 'countdown'` guard 會忽略第二次觸發。這是預期行為（避免重複倒數），但若 Admin 多次點擊可能造成困惑 → 可在狀態列顯示倒數剩餘秒數作為緩解。
- **鏡頭切換延遲**：`getUserMedia` 在低階裝置需 1–2 秒，切換期間 video 會黑畫面 → 可加 loading overlay，但屬錦上添花，不在此次 scope。
- **iOS `facingMode: 'user'` 權限**：部分 iOS 版本切換前鏡頭需重新授權 → 無解，交由系統彈窗處理。
