## ADDED Requirements

### Requirement: 拍照倒數計時機制
系統收到 RTDB 觸發後，SHALL 先進入 15 秒倒數計時（`status: 'countdown'`），倒數結束後才執行拍照（`shoot()`）。倒數期間若再次收到 RTDB 觸發，SHALL 忽略後續觸發（guard 條件：`status !== 'idle'`）。倒數計時器 SHALL 使用 `setInterval`（每秒遞減）並搭配 `useRef` 追蹤 interval ID 以便正確清除。

#### Scenario: 收到 RTDB 觸發後開始倒數
- **WHEN** 收到新的 RTDB `trigger/last_shot` 觸發，且 `status` 為 `'idle'`
- **THEN** `status` SHALL 立即變更為 `'countdown'`，`countdown` state SHALL 設為 `15`，並啟動每秒遞減的 interval

#### Scenario: 倒數結束後自動拍照
- **WHEN** 倒數計時從 15 遞減至 0
- **THEN** 系統 SHALL 清除 interval，並呼叫 `shoot()` 執行拍照

#### Scenario: 倒數期間重複觸發被忽略
- **WHEN** 倒數進行中（`status === 'countdown'`）收到新的 RTDB 觸發
- **THEN** 系統 SHALL NOT 重設倒數或重複啟動拍照流程

#### Scenario: 組件卸載時清除計時器
- **WHEN** 相機頁面組件被卸載（unmount）
- **THEN** 系統 SHALL 清除所有進行中的 `setInterval`，不發生 memory leak

### Requirement: 倒數視覺特效
倒數進行期間，系統 SHALL 在 video 畫面中央以絕對定位疊加大型倒數數字，搭配縮放動畫（Tailwind `animate-pulse` 或自定義 keyframe）與半透明暗色光暈背景。狀態列 SHALL 顯示「即將拍照」閃爍提示文字（`animate-pulse`）。

#### Scenario: 倒數數字顯示於畫面中央
- **WHEN** `status === 'countdown'`
- **THEN** 畫面中央 SHALL 覆蓋一個大型數字（顯示剩餘秒數），背景有暗色半透明光暈，數字 SHALL 有動畫效果

#### Scenario: 倒數期間狀態列閃爍提示
- **WHEN** `status === 'countdown'`
- **THEN** 狀態列 SHALL 顯示「即將拍照」文字，並套用 `animate-pulse` 閃爍效果

#### Scenario: 倒數結束後視覺特效消除
- **WHEN** 倒數結束並呼叫 `shoot()`，`status` 變更為 `'shooting'`
- **THEN** 倒數覆蓋層 SHALL 立即消失，狀態列恢復正常顯示
