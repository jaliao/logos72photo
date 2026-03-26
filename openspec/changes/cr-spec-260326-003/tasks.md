## 1. 移除分享功能

- [x] 1.1 刪除 `PhotoSlideshow.tsx` 中的 `handleShare` 函式與 `showToast` 狀態
- [x] 1.2 刪除工具列的「複製分享連結」按鈕（SVG icon + button）
- [x] 1.3 刪除底部「已複製！」toast UI 區塊
- [x] 1.4 刪除 `?photo=` query param 自動開啟幻燈片的 `useEffect`

## 2. 修改下載行為

- [x] 2.1 移除 `handleDownload` 中的 `iosCapable` 判斷與 iOS Web Share API 分支
- [x] 2.2 確認下載統一使用 `current.r2Url`（原圖），以 blob fetch + `<a download>` 下載

## 3. 驗證

- [ ] 3.1 確認後台相簿 Lightbox 工具列只剩「返回」和「下載」按鈕
- [ ] 3.2 在桌面瀏覽器點下載，確認直接存檔（不彈出分享視窗）
