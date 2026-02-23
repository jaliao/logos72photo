## ADDED Requirements

### Requirement: 前後鏡頭切換按鈕
相機頁面 SHALL 提供一個切換按鈕，讓使用者在前鏡頭（`facingMode: 'user'`）與後鏡頭（`facingMode: 'environment'`）之間切換。切換時，系統 SHALL 先停止當前 MediaStream 的所有 track，再以新的 `facingMode` 重新呼叫 `getUserMedia`，並更新 video 元素的 `srcObject`。預設鏡頭為後鏡頭（`facingMode: 'environment'`）。

#### Scenario: 切換至前鏡頭成功
- **WHEN** 使用者點擊鏡頭切換按鈕，當前 `facingMode` 為 `'environment'`
- **THEN** 系統 SHALL 停止現有串流、以 `facingMode: 'user'` 重新取得 MediaStream，並更新 video 畫面

#### Scenario: 切換至後鏡頭成功
- **WHEN** 使用者點擊鏡頭切換按鈕，當前 `facingMode` 為 `'user'`
- **THEN** 系統 SHALL 停止現有串流、以 `facingMode: 'environment'` 重新取得 MediaStream，並更新 video 畫面

#### Scenario: 倒數或拍照期間不允許切換
- **WHEN** 使用者點擊鏡頭切換按鈕，且 `status` 為 `'countdown'`、`'shooting'` 或 `'uploading'`
- **THEN** 切換按鈕 SHALL 不可點擊（disabled），系統 SHALL NOT 重新取得 MediaStream

#### Scenario: 切換後保持 RTDB 監聽不中斷
- **WHEN** 使用者切換鏡頭
- **THEN** RTDB 監聽器 SHALL 維持運作不重建，觸發信號不遺失
