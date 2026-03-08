## ADDED Requirements

### Requirement: 照片預覽頁縮圖直式比例與行動裝置排版
照片預覽頁（`/gallery/[date]/[slot]/[album]`）的縮圖 grid SHALL 以直式比例（`aspect-[3/4]`）顯示，對應 iPhone 直式拍攝照片（4:3 portrait），不以固定高度截裁。手機版（viewport < 640px）SHALL 採單欄排列，確保照片有足夠寬度；桌面版（viewport ≥ 640px）SHALL 採雙欄排列。

#### Scenario: 手機版單欄顯示
- **WHEN** 訪客在手機（viewport 寬度 < 640px）進入照片預覽頁
- **THEN** 縮圖 grid SHALL 以單欄垂直排列，每張縮圖佔滿欄寬

#### Scenario: 桌面版雙欄顯示
- **WHEN** 訪客在桌面或平板（viewport 寬度 ≥ 640px）進入照片預覽頁
- **THEN** 縮圖 grid SHALL 以雙欄並排，每張縮圖佔半欄寬

#### Scenario: 縮圖保持直式比例
- **WHEN** 訪客查看縮圖 grid
- **THEN** 每張縮圖 SHALL 以 3:4 寬高比（直式）顯示，不因容器尺寸變化而截為橫式

#### Scenario: Lightbox 直式照片完整顯示
- **WHEN** 訪客點擊縮圖開啟全螢幕 Lightbox，且照片為直式
- **THEN** 照片 SHALL 在手機 viewport 內完整顯示（`max-h-[85vh] max-w-[95vw]`），不超出螢幕邊緣
