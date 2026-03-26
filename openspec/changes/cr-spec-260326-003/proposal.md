## Why

後台相簿的下載按鈕在 iOS 上會觸發系統分享對話視窗（Web Share API），且工具列存在「複製分享連結」按鈕，這兩個行為對管理員操作不友善——管理員需要的是直接取得原圖檔案，不需要分享功能。

## What Changes

- 移除工具列的「複製分享連結」按鈕與 `handleShare()` 邏輯
- 移除 `showToast` 狀態與「已複製！」toast UI
- 下載行為改為所有平台統一使用 `<a download>` 下載原圖（`r2Url`），不再使用 iOS Web Share API
- 移除 `?photo=` query param 自動開啟幻燈片的 `useEffect`（分享連結功能的依賴）

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `admin-gallery`：後台相簿照片頁 SHALL 不提供分享連結功能；下載 SHALL 在所有平台直接下載原圖，不觸發 share dialog

## Impact

- `app/components/PhotoSlideshow.tsx`：移除分享邏輯、toast、`?photo=` effect；下載改為原圖直下
- 僅影響後台，此元件目前只在 `app/admin/gallery/[date]/[slot]/[album]/page.tsx` 使用
