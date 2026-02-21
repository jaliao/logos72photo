## ADDED Requirements

### Requirement: 同步拍照觸發
系統必須利用 Firebase Realtime Database 實現指令同步，每 5 分鐘由伺服器更新時間戳記，觸發所有連接的 iPhone 進行拍照。

#### Scenario: 同步觸發成功
- **WHEN** 伺服器端更新 Firebase 中的 `last_shot_time`
- **THEN** 所有正在運行拍照頁面的 iPhone 必須在 1 秒內收到通知並執行相機快門