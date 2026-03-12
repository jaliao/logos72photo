## MODIFIED Requirements

### Requirement: 照片 Lightbox 全螢幕預覽
照片預覽頁（`/gallery/[date]/[slot]/[album]`）的每張縮圖 SHALL 可點擊，開啟全螢幕幻燈片（Google Photos 風格），顯示該照片的高解析縮圖（1280px WebP）。幻燈片背景 SHALL 顯示同一張照片的模糊版本（`blur + brightness-50`）填滿視窗，消除黑底。幻燈片 SHALL 接收整個相簿的照片陣列，並記錄當前顯示的 index，讓使用者可在相同幻燈片介面內切換照片。

前景照片呈現規則依裝置而異：
- **手機（viewport < 640px）**：照片以 `object-cover` 填滿整個手機畫面（全螢幕滿版）
- **桌機（viewport ≥ 640px）**：前景照片容器高度 SHALL 不超過瀏覽器視窗高度（`max-h-screen`），維持 `3/4` 寬高比，照片以 `object-cover` 填滿容器，容器水平置中；兩側剩餘空間由模糊背景填補

#### Scenario: 點擊縮圖開啟幻燈片
- **WHEN** 訪客在照片預覽頁點擊任意縮圖
- **THEN** 系統 SHALL 開啟全螢幕幻燈片，顯示被點擊照片的 1280px 高解析縮圖，並記錄該張在陣列中的 index

#### Scenario: 手機版照片滿版顯示
- **WHEN** 訪客在手機（viewport < 640px）開啟幻燈片
- **THEN** 前景照片 SHALL 以 `object-cover` 填滿整個手機畫面，不留黑邊或模糊空間

#### Scenario: 桌機版照片容器不超過視窗高度
- **WHEN** 訪客在桌機（viewport ≥ 640px）開啟幻燈片
- **THEN** 前景照片容器高度 SHALL 不超過瀏覽器視窗高度，維持 `3/4` 寬高比（portrait），照片以 `object-cover` 填滿容器，容器水平置中；兩側空間由模糊背景填補，不出現黑底

#### Scenario: 幻燈片開啟時隱藏縮圖列表
- **WHEN** 幻燈片開啟
- **THEN** 照片縮圖 Grid SHALL 隱藏（`hidden`），關閉幻燈片後恢復顯示

#### Scenario: 幻燈片鎖定頁面捲動
- **WHEN** 幻燈片開啟
- **THEN** 背景頁面 SHALL 停止捲動（`overflow: hidden`），直到幻燈片關閉後恢復
