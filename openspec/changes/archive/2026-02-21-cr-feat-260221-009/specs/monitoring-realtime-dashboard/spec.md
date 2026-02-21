## ADDED Requirements

### Requirement: 儀表板自動即時更新
監控儀表板 SHALL 使用 Firestore `onSnapshot` 監聽 `devices` 集合，裝置資料有變動時自動更新畫面，不需手動重整。

#### Scenario: 裝置心跳到達後儀表板自動更新
- **WHEN** 任一裝置送出心跳（更新 `last_heartbeat`、`battery_level`）
- **THEN** 儀表板在 1 秒內反映最新狀態，不需重整頁面

#### Scenario: 裝置上傳新照片後縮圖自動刷新
- **WHEN** 裝置送出心跳並更新 `last_photo_url`
- **THEN** 儀表板該裝置卡的縮圖在 1 秒內顯示新照片

#### Scenario: 初次載入顯示即時資料
- **WHEN** 管理員開啟 /admin/monitoring 頁面
- **THEN** 儀表板立即顯示所有裝置的最新資料，並持續監聽後續更新

---

### Requirement: 裝置離線警告 Badge
系統 SHALL 在裝置長時間未送出心跳時，在該裝置卡上顯示醒目的離線警告。

#### Scenario: 裝置超過閾值未心跳，顯示離線警告
- **WHEN** 目前時間 − `last_heartbeat` > `HEARTBEAT_INTERVAL_MS × 3`（即 45 秒）
- **THEN** 裝置卡顯示紅色「失聯」Badge，並取代原本的「連線中」狀態

#### Scenario: 裝置恢復心跳後警告消除
- **WHEN** 裝置在離線後重新送出心跳
- **THEN** 紅色 Badge 在 1 秒內消失，恢復顯示「連線中」狀態

#### Scenario: 初次載入時已離線的裝置
- **WHEN** 管理員開啟儀表板時，某裝置 `last_heartbeat` 已超過閾值
- **THEN** 該裝置卡立即顯示紅色「失聯」Badge（不需等待）

---

### Requirement: 下次心跳預計時間
儀表板 SHALL 在每張裝置卡上顯示「下次心跳預計時間」，讓管理員確認裝置是否正常運作。

#### Scenario: 顯示下次心跳倒數秒數
- **WHEN** 裝置處於連線中狀態
- **THEN** 裝置卡顯示「下次心跳：約 N 秒後」，N = `last_heartbeat + HEARTBEAT_INTERVAL_MS - now`，每秒更新

#### Scenario: 裝置已離線時不顯示倒數
- **WHEN** 裝置超過離線閾值
- **THEN** 下次心跳倒數欄位改為顯示「—」或隱藏
