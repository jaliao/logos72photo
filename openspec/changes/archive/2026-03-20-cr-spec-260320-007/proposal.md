## Why

`AlbumPhotoViewer` 展開模式的說明文字過小（`text-xs text-zinc-500`）、刪除僅用原生 `confirm()`、iOS 下載行為與桌面不同但無任何提示，導致訪客不清楚操作方式與照片使用政策。

## What Changes

- **說明文字重新設計**：明顯的提示區塊（有底色邊框），文案清楚傳達照片用途與刪除權利
- **iOS 下載提示**：偵測 iOS Safari，改為「在新頁開啟」並顯示「長按圖片 → 儲存影像」指引
- **刪除確認改為 inline 二次確認**：取代原生 `confirm()`，點擊刪除後按鈕列切換為「確定刪除」/ 「取消」
- **封面套用同樣設計**：封面展開模式一致體驗

**Non-goals：**
- 不修改 grid 模式
- 不修改後台 `PhotoSlideshow`
- 不變更 API 或資料層

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `album-photo-viewer`：展開模式 UX 重新設計（提示文案、下載行為、刪除確認）

## Impact

- 修改 `app/components/AlbumPhotoViewer.tsx`
