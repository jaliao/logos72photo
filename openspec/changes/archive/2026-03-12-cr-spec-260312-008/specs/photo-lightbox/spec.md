## ADDED Requirements

### Requirement: 幻燈片切換轉場動畫
切換上一張 / 下一張照片時，前景照片 SHALL 以水平 `translateX` 動畫滑入，方向對應切換方向：切換至下一張時從右側（`translateX(100%)`）滑入，切換至上一張時從左側（`translateX(-100%)`）滑入。動畫時長 SHALL 為 300ms（`transition-transform duration-300`）。動畫期間 `direction` state 記錄方向，動畫結束（`onTransitionEnd`）後清除。

#### Scenario: 切換下一張時照片從右側滑入
- **WHEN** 幻燈片開啟中，使用者點擊右箭頭、按下 → 鍵，或向左 Swipe
- **THEN** 新照片 SHALL 從畫面右側（`translateX(100%)`）滑入中心（`translateX(0)`），動畫時長 300ms

#### Scenario: 切換上一張時照片從左側滑入
- **WHEN** 幻燈片開啟中，使用者點擊左箭頭、按下 ← 鍵，或向右 Swipe
- **THEN** 新照片 SHALL 從畫面左側（`translateX(-100%)`）滑入中心（`translateX(0)`），動畫時長 300ms

#### Scenario: 動畫結束後清除方向 state
- **WHEN** 切換動畫播放完畢（`onTransitionEnd` 觸發）
- **THEN** `direction` state SHALL 重設為 `null`，確保下次切換可正確設定新方向

### Requirement: 點擊背景關閉幻燈片
點擊前景照片容器以外的背景區域（模糊背景）SHALL 關閉幻燈片，效果等同點擊「← 返回」按鈕。前景照片容器、工具列、左右箭頭按鈕的點擊 SHALL 不觸發關閉（各自加上 `stopPropagation`）。

#### Scenario: 點擊模糊背景關閉幻燈片
- **WHEN** 幻燈片開啟中，使用者點擊前景照片容器以外的模糊背景區域
- **THEN** 幻燈片 SHALL 關閉，返回照片縮圖列表

#### Scenario: 點擊照片本體不關閉
- **WHEN** 幻燈片開啟中，使用者點擊前景照片容器（照片本體）
- **THEN** 幻燈片 SHALL 維持開啟，不觸發關閉

#### Scenario: 點擊工具列或箭頭按鈕不關閉
- **WHEN** 幻燈片開啟中，使用者點擊頂部工具列（返回、分享、下載按鈕）或左右箭頭按鈕
- **THEN** 幻燈片 SHALL 執行對應動作（關閉 / 分享 / 下載 / 切換），不同時觸發背景關閉
