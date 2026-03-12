## Why

現有的 Lightbox 僅能單張預覽，缺乏左右切換、分享與符合 iOS 存檔習慣的下載流程，訪客體驗與 Google 相簿差距明顯。透過仿 Google Photos 全螢幕幻燈片升級，讓訪客能夠連續瀏覽、下載並分享照片，提升相簿整體使用體驗。

## What Changes

- 點擊縮圖開啟全螢幕幻燈片（Google Photos 風格），取代現有簡易 Lightbox
- 新增左右箭頭（上一張 / 下一張）導覽，支援鍵盤方向鍵與觸控滑動（Swipe）
- 左上角改為「← 返回」按鈕，點擊關閉幻燈片並回到照片列表
- 右上角新增「下載」按鈕：觸發存檔對話窗，預設檔名 `IMG_{系統流水編號}`
- 右上角新增「分享」按鈕：複製該張照片的永久連結（URL）至剪貼簿，顯示「已複製！」提示
- iOS 下載方案：偵測 iOS Safari，改以長按提示引導使用者「長按照片 → 加入照片」；或使用 Web Share API（`navigator.share`）觸發系統分享選單，讓 iPhone 可直接存至相簿
- 移除現有 Lightbox 的點擊背景關閉行為（避免誤觸）；保留 Escape 鍵關閉

## Capabilities

### New Capabilities
（無新增獨立 capability，功能整合至現有 photo-lightbox）

### Modified Capabilities
- `photo-lightbox`：大幅升級為 Google Photos 風格幻燈片；新增左右導覽、返回按鈕、分享按鈕、iOS 存檔方案；下載行為改為存檔對話窗並預設檔名；移除點擊背景關閉

## Impact

- `components/PhotoLightbox`（或現有 Lightbox 元件）：全面重寫
- `/gallery/[date]/[slot]/[album]`：傳入照片陣列與當前 index 至 Lightbox
- 新增 iOS 偵測工具函式（`utils/isIOS`）或使用 `navigator.userAgent`
- 新增 Web Share API 或 Clipboard API 呼叫
- 照片流水編號（`seq` 或 `id` 欄位）需從 Firestore/R2 metadata 取得，作為預設檔名來源
