## Context

相機自動拍照的完整鏈路：
```
Cloudflare Worker Cron（每 5 分鐘）
  → POST /api/trigger（帶 x-trigger-secret）
  → rtdbSet('trigger/last_shot', Date.now())
  → Firebase RTDB onValue 推送至 iPhone CameraClient
  → if (now - val < 10_000) → shoot()
```

目前已知兩個潛在問題導致觸發失效：

1. **監聽器重建問題**：`useEffect([shoot])` 依賴 `shoot`，而 `shoot` 依賴 `[deviceId, status]`。每次 status 狀態切換（idle → shooting → uploading → idle），shoot 函式參考改變，導致 RTDB 監聽器被拆除並重建，在重建期間若有觸發信號到達則被遺漏。

2. **10 秒新鮮度視窗過嚴**：以 `now - val < 10_000` 判斷是否為最新觸發，容易因 Firebase 推送延遲、iPhone 與伺服器時脈不同步而誤判為「過期訊號」，直接跳過拍照。

## Goals / Non-Goals

**Goals:**
- 修正 RTDB 監聽器因 `shoot` 依賴重建的不穩定問題
- 將觸發條件改為「RTDB 值遞增」而非「與本地時脈的差值」，根除時脈偏差問題
- 在相機頁面 UI 新增「最後 RTDB 觸發時間戳記」供現場除錯

**Non-Goals:**
- 不更動 Cloudflare Worker Cron 或 `/api/trigger` 的邏輯
- 不修改 Firebase RTDB 安全規則
- 不引入新的外部依賴

## Decisions

### 決策 1：以 `useRef` 穩定 RTDB 監聽器

**選項 A（採用）**：用 `shootRef = useRef(shoot)` 在每次 render 同步最新的 `shoot` 函式，RTDB `useEffect` 依賴改為 `[]`（只掛載一次），callback 內呼叫 `shootRef.current()`。

**選項 B**：將 `shoot` 的 `useCallback` 依賴改為 `[]`，在函式內透過 ref 讀取 status 判斷是否可拍照。
→ 放棄：需同時重構 shoot 內部邏輯，改動範圍更大。

**選項 A 理由**：改動最小，監聽器只建立一次，不受 status 狀態切換影響。

---

### 決策 2：改用「值遞增」作為觸發條件

**選項 A（採用）**：記錄上一次已處理的 RTDB 值 `lastProcessedTrigger`（`useRef`），當新值 `val > lastProcessedTrigger.current` 時才觸發拍照，並更新 ref。

**選項 B**：將新鮮度視窗從 10 秒放寬至 30 秒。
→ 放棄：仍有時脈偏差的潛在問題，只是縮小機率。

**選項 C**：改用 Firebase RTDB ServerTimestamp，在 client 比較 server 時間。
→ 放棄：需要修改 RTDB 資料結構與 `/api/trigger`，改動範圍大。

**選項 A 理由**：完全不依賴時脈，只比較「新舊值大小」，對所有情境都安全。

---

### 決策 3：UI 新增 RTDB 原始觸發時間顯示

在狀態列新增一欄「RTDB 最後觸發：HH:MM:SS」，直接顯示從 Firebase 收到的 `val`（timestamp），讓現場人員能快速判斷問題出在 Cron/API 端還是 iPhone 監聽端。

## Risks / Trade-offs

- **遞增條件的邊界**：若 RTDB 值因某種原因被重設為較小的值（例如手動寫入舊時間戳記），新邏輯不會觸發拍照。→ 接受此限制：正常流程下 `Date.now()` 單調遞增，風險極低。
- **首次載入**：`lastProcessedTrigger` 初始值為 `0`，頁面載入時若 RTDB 已有舊值（> 0），第一次 `onValue` 回呼會觸發拍照。→ 初始值改為 `Date.now()`（頁面載入時間），只處理載入後的新觸發。
