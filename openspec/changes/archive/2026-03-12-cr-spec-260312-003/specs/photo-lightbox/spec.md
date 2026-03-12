## MODIFIED Requirements

### Requirement: 照片 Lightbox 全螢幕預覽
照片預覽頁（`/gallery/[date]/[slot]/[album]`）的每張縮圖 SHALL 可點擊，開啟全螢幕幻燈片（Google Photos 風格），顯示該照片的高解析縮圖（1280px WebP）。幻燈片背景 SHALL 顯示同一張照片的模糊版本（`blur + brightness-50`）填滿視窗，消除黑底。幻燈片 SHALL 接收整個相簿的照片陣列，並記錄當前顯示的 index，讓使用者可在相同幻燈片介面內切換照片。

前景照片呈現規則依裝置而異：
- **手機（viewport < 640px）**：照片以 `object-cover` 填滿整個手機畫面（全螢幕滿版）
- **桌機（viewport ≥ 640px）**：照片以 `3/4` 比例容器置中顯示，填滿視窗高度，兩側剩餘空間由模糊背景填補

#### Scenario: 點擊縮圖開啟幻燈片
- **WHEN** 訪客在照片預覽頁點擊任意縮圖
- **THEN** 系統 SHALL 開啟全螢幕幻燈片，顯示被點擊照片的 1280px 高解析縮圖，並記錄該張在陣列中的 index

#### Scenario: 手機版照片滿版顯示
- **WHEN** 訪客在手機（viewport < 640px）開啟幻燈片
- **THEN** 前景照片 SHALL 以 `object-cover` 填滿整個手機畫面，不留黑邊或模糊空間

#### Scenario: 桌機版照片維持 3/4 比例置中
- **WHEN** 訪客在桌機（viewport ≥ 640px）開啟幻燈片
- **THEN** 前景照片 SHALL 以 `3/4` 寬高比容器顯示，填滿視窗高度，水平置中；兩側空間由模糊背景填補，不出現黑底

#### Scenario: 幻燈片鎖定頁面捲動
- **WHEN** 幻燈片開啟
- **THEN** 背景頁面 SHALL 停止捲動（`overflow: hidden`），直到幻燈片關閉後恢復

### Requirement: 幻燈片關閉行為
幻燈片 SHALL 支援兩種關閉方式：點擊左上角「← 返回」按鈕、按下鍵盤 Escape 鍵。移除點擊黑色背景關閉及右上角 ✕ 關閉按鈕，防止誤觸。關閉後頁面恢復正常捲動狀態。

#### Scenario: 點擊返回按鈕關閉
- **WHEN** 幻燈片開啟中，訪客點擊左上角「← 返回」按鈕
- **THEN** 幻燈片 SHALL 關閉，返回照片格狀列表

#### Scenario: Escape 鍵關閉
- **WHEN** 幻燈片開啟中，訪客按下鍵盤 Escape 鍵
- **THEN** 幻燈片 SHALL 關閉

#### Scenario: 點擊黑色背景不關閉
- **WHEN** 幻燈片開啟中，訪客點擊照片外的黑色背景區域
- **THEN** 幻燈片 SHALL 維持開啟，不執行任何動作

### Requirement: 幻燈片下載按鈕
幻燈片右上角 SHALL 提供「下載」圖示按鈕。點擊後系統 SHALL 直接 `fetch(r2Url)` 取得原圖 Blob（R2 CORS 已開放），再依平台觸發對應存檔流程：iOS（支援 `navigator.canShare({ files })`）使用 Web Share API 開啟系統分享選單（可存至相簿）；其他平台動態建立 `<a download="IMG_XXXX.jpg">` 觸發存檔對話窗。預設檔名格式為 `IMG_{4位補零相簿順序號}.jpg`（例如 `IMG_0001.jpg`）。下載過程中按鈕 SHALL 顯示 loading 狀態。

#### Scenario: 桌面 / Android 點擊下載觸發存檔對話窗
- **WHEN** 訪客在不支援 `navigator.canShare({ files })` 的瀏覽器點擊下載按鈕
- **THEN** 系統 SHALL fetch 原圖 Blob，觸發瀏覽器存檔對話窗，預設檔名為 `IMG_XXXX.jpg`（XXXX 為該照片在相簿中的 4 位補零順序號）

#### Scenario: iOS 點擊下載觸發系統分享選單
- **WHEN** 訪客在支援 `navigator.canShare({ files })` 的 iOS Safari 點擊下載按鈕
- **THEN** 系統 SHALL fetch 原圖 Blob，呼叫 `navigator.share({ files: [File] })`，開啟 iOS 系統分享選單，訪客可選擇「加入照片」存至相簿

#### Scenario: 下載中顯示 loading 狀態
- **WHEN** 訪客點擊下載按鈕，系統正在 fetch 原圖
- **THEN** 下載按鈕 SHALL 顯示 loading 指示器，且不可重複點擊，直到 fetch 完成

## ADDED Requirements

### Requirement: 幻燈片左右照片導覽
幻燈片 SHALL 在畫面左右側顯示上一張 / 下一張箭頭按鈕。同時支援鍵盤左右方向鍵切換，以及手機水平 Swipe 手勢（deltaX > 50px）切換。已為第一張時左箭頭 SHALL disabled 或隱藏；已為最後一張時右箭頭 SHALL disabled 或隱藏（不循環）。

#### Scenario: 點擊右箭頭顯示下一張
- **WHEN** 幻燈片開啟且當前不是最後一張，訪客點擊右側箭頭按鈕
- **THEN** 幻燈片 SHALL 切換至下一張照片

#### Scenario: 點擊左箭頭顯示上一張
- **WHEN** 幻燈片開啟且當前不是第一張，訪客點擊左側箭頭按鈕
- **THEN** 幻燈片 SHALL 切換至上一張照片

#### Scenario: 鍵盤方向鍵切換
- **WHEN** 幻燈片開啟中，訪客按下鍵盤 → 鍵（或 ← 鍵）
- **THEN** 幻燈片 SHALL 切換至下一張（或上一張）照片；已在首尾時無動作

#### Scenario: 手機水平 Swipe 切換
- **WHEN** 幻燈片開啟中，訪客在觸控螢幕向左 Swipe（水平位移 > 50px）
- **THEN** 幻燈片 SHALL 切換至下一張照片（向右 Swipe 則切換至上一張）

#### Scenario: 第一張時左箭頭不可用
- **WHEN** 幻燈片顯示第一張照片
- **THEN** 左側箭頭 SHALL 呈 disabled 或隱藏，無法觸發切換

#### Scenario: 最後一張時右箭頭不可用
- **WHEN** 幻燈片顯示最後一張照片
- **THEN** 右側箭頭 SHALL 呈 disabled 或隱藏，無法觸發切換

### Requirement: 幻燈片分享按鈕
幻燈片右上角 SHALL 提供「分享」圖示按鈕。點擊後系統 SHALL 將當前照片的永久連結（格式：當前頁面 URL + `?photo={index}`，index 為 0-based 相簿順序號）寫入剪貼簿（`navigator.clipboard.writeText`），並顯示「已複製！」Toast 提示（持續 2 秒後消失）。

#### Scenario: 點擊分享複製照片連結
- **WHEN** 訪客點擊幻燈片右上角分享按鈕
- **THEN** 系統 SHALL 將含 `?photo={index}` 的當前頁面 URL 寫入剪貼簿，並顯示「已複製！」Toast 提示

#### Scenario: Toast 提示自動消失
- **WHEN** 「已複製！」Toast 顯示後
- **THEN** Toast SHALL 於 2 秒後自動消失

### Requirement: 分享連結自動開啟幻燈片
照片預覽頁 SHALL 在載入時讀取 URL query param `?photo={index}`（0-based），若存在且 index 在相簿照片陣列範圍內，SHALL 自動開啟幻燈片並定位至該張照片。

#### Scenario: 帶 photo 參數的 URL 自動開啟幻燈片
- **WHEN** 訪客開啟帶有 `?photo=3` 的照片預覽頁 URL，且相簿有 10 張照片
- **THEN** 頁面載入後 SHALL 自動開啟幻燈片並顯示第 4 張照片（0-based index 3）

#### Scenario: photo 參數超出範圍時 fallback
- **WHEN** 訪客開啟 `?photo=999` 但相簿內只有 5 張照片
- **THEN** 頁面 SHALL 正常載入照片列表，不開啟幻燈片，不顯示錯誤

## REMOVED Requirements

### Requirement: Lightbox 下載按鈕
**Reason:** 替換為新的幻燈片下載按鈕（含 Blob fetch + Web Share API + 預設檔名）
**Migration:** 使用新的「幻燈片下載按鈕」Requirement，行為升級為 Blob 下載並支援 iOS 系統分享
