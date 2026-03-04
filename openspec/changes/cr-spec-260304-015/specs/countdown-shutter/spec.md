## MODIFIED Requirements

### Requirement: 拍照倒數計時機制
系統收到 RTDB 觸發後，SHALL 先進入 **10 秒**倒數計時（`status: 'countdown'`），倒數結束後才執行拍照（`shoot()`）。倒數期間若再次收到 RTDB 觸發，SHALL 忽略後續觸發（guard 條件：`status !== 'idle'`）。倒數計時器 SHALL 使用 `setInterval`（每秒遞減）並搭配 `useRef` 追蹤 interval ID 以便正確清除。

#### Scenario: 收到 RTDB 觸發後開始倒數
- **WHEN** 收到新的 RTDB `trigger/last_shot` 觸發，且 `status` 為 `'idle'`
- **THEN** `status` SHALL 立即變更為 `'countdown'`，`countdown` state SHALL 設為 `10`，並啟動每秒遞減的 interval

#### Scenario: 倒數結束後自動拍照
- **WHEN** 倒數計時從 10 遞減至 0
- **THEN** 系統 SHALL 清除 interval，並呼叫 `shoot()` 執行拍照

#### Scenario: 倒數期間重複觸發被忽略
- **WHEN** 倒數進行中（`status === 'countdown'`）收到新的 RTDB 觸發
- **THEN** 系統 SHALL NOT 重設倒數或重複啟動拍照流程

#### Scenario: 組件卸載時清除計時器
- **WHEN** 相機頁面組件被卸載（unmount）
- **THEN** 系統 SHALL 清除所有進行中的 `setInterval`，不發生 memory leak
