### Requirement: 照片 Lightbox 全螢幕預覽
照片預覽頁（`/gallery/[date]/[slot]/[album]`）的每張縮圖 SHALL 可點擊，開啟全螢幕 Lightbox 覆蓋層，顯示該照片的高解析縮圖（1280px WebP）。Lightbox 背景 SHALL 為半透明黑色（`bg-black/90`），z-index 高於所有頁面元素。

#### Scenario: 點擊縮圖開啟 Lightbox
- **WHEN** 訪客在照片預覽頁點擊任意縮圖
- **THEN** 系統 SHALL 開啟全螢幕 Lightbox，顯示該照片的 1280px 高解析縮圖，背景為黑色覆蓋層

#### Scenario: Lightbox 鎖定頁面捲動
- **WHEN** Lightbox 開啟
- **THEN** 背景頁面 SHALL 停止捲動（`overflow: hidden`），直到 Lightbox 關閉後恢復

### Requirement: Lightbox 關閉行為
Lightbox SHALL 支援三種關閉方式：點擊黑色背景、點擊關閉按鈕（右上角 ✕）、按下鍵盤 Escape 鍵。關閉後頁面恢復正常狀態。

#### Scenario: 點擊背景關閉
- **WHEN** Lightbox 開啟中，訪客點擊照片外的黑色背景區域
- **THEN** Lightbox SHALL 關閉，返回照片格狀列表

#### Scenario: 點擊關閉按鈕關閉
- **WHEN** Lightbox 開啟中，訪客點擊右上角關閉按鈕（✕）
- **THEN** Lightbox SHALL 關閉

#### Scenario: Escape 鍵關閉
- **WHEN** Lightbox 開啟中，訪客按下鍵盤 Escape 鍵
- **THEN** Lightbox SHALL 關閉

### Requirement: Lightbox 下載按鈕
Lightbox 內 SHALL 提供明顯的「下載原圖」按鈕，連結至 R2 原圖 URL（`<a href={r2Url} download>`）。同時 SHALL 顯示輔助提示文字「iOS 請長按圖片 → 儲存到照片」，供 iOS Safari 使用者參考。

#### Scenario: 點擊下載按鈕觸發下載
- **WHEN** 訪客在 Lightbox 中點擊「下載原圖」按鈕
- **THEN** 瀏覽器 SHALL 觸發原圖下載（Android/桌面）或開啟原圖頁面（iOS）

#### Scenario: iOS 提示文字顯示
- **WHEN** Lightbox 開啟
- **THEN** 頁面 SHALL 顯示「iOS 請長按圖片 → 儲存到照片」輔助說明文字
