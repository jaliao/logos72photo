## MODIFIED Requirements

### Requirement: iPhone 端狀態監控
拍照頁面必須即時顯示裝置狀態，以便工作人員現場確認。

#### Scenario: 顯示心跳狀態
- **GIVEN** iPhone 處於拍照頁面
- **THEN** 顯示「心跳燈」動畫，且每 **15 秒**更新一次「最後連線時間」
- **AND** 若超過 5 分鐘未收到拍照指令，介面背景應轉為紅色警告色
