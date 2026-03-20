## Why

單張相簿展開模式的 UI 細節需要調整：提示文字視覺層次不足、返回按鈕符號冗餘、刪除確認體驗不夠明確（inline 切換不夠警示）。

## What Changes

- 提示區塊背景改為 70% 半透明白（`bg-white/70`），文字改為 600 粗體黑（`font-semibold text-black`）
- 「← 返回列表」按鈕文字移除箭頭符號，改為「返回列表」
- 刪除確認改為 modal 對話框（`<dialog>` 或 overlay div），包含確認文案與確認／取消按鈕

## Capabilities

### New Capabilities
- 無

### Modified Capabilities
- `album-photo-viewer`：刪除確認改為 modal overlay，提示區塊樣式更新，返回按鈕文字調整

## Impact

- `app/components/AlbumPhotoViewer.tsx`：提示區塊 className、返回按鈕文字、刪除確認邏輯改為 modal
- 不影響 API、資料模型或其他頁面
