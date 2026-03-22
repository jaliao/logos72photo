## MODIFIED Requirements

### Requirement: 個人時段相簿照片縮圖格
相簿頁面的縮圖 grid SHALL 以直式比例（`aspect-[3/4]`）顯示，手機版單欄、桌面版雙欄，點擊縮圖開啟 `AlbumPhotoViewer` 展開卡片模式（取代 Lightbox 全螢幕 overlay）。

#### Scenario: 手機版單欄顯示
- **WHEN** 訪客在手機（viewport < 640px）進入 `/album/[slotGroup]`
- **THEN** 縮圖 grid SHALL 以單欄垂直排列

#### Scenario: 桌面版雙欄顯示
- **WHEN** 訪客在桌面（viewport ≥ 640px）進入 `/album/[slotGroup]`
- **THEN** 縮圖 grid SHALL 以雙欄並排

#### Scenario: 點擊縮圖開啟展開卡片
- **WHEN** 訪客點擊任意縮圖
- **THEN** 系統 SHALL 以 `AlbumPhotoViewer` 白色圓角卡片展開模式顯示該照片，不使用全螢幕 overlay
