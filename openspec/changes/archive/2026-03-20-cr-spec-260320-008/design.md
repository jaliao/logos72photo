## Context

`AlbumPhotoViewer.tsx` 展開模式目前有三個 UI 問題：
1. 提示區塊背景為純白（`bg-white`），視覺層次薄弱
2. 返回按鈕文字「← 返回列表」含冗餘箭頭符號
3. 刪除確認以 inline 按鈕切換實作，視覺警示不足

本 change 為純前端樣式與互動調整，不涉及 API 或資料模型。

## Goals / Non-Goals

**Goals:**
- 提示區塊背景改為 `bg-white/70`，文字改為 `font-semibold text-black`
- 返回按鈕文字由「← 返回列表」改為「返回列表」
- 刪除確認改為 modal overlay（全螢幕半透明遮罩 + 白色對話框），包含確認文案與「確定刪除」／「取消」按鈕

**Non-Goals:**
- 不修改 API 或 Firestore 邏輯
- 不重構元件結構
- 不新增動畫或過場效果

## Decisions

**Modal 實作方式：純 Tailwind + React state（不用 `<dialog>` 元素）**
- 以 `fixed inset-0 z-50` overlay div + 居中白色卡片實作
- 理由：不引入新依賴，與專案現有風格一致；`<dialog>` 在 iOS Safari 支援度較低

**Modal 確認文案：**
「確定要刪除這張照片嗎？刪除後無法復原。」（封面同理）

**Modal 按鈕順序：** 取消（左，`bg-zinc-300`）、確定刪除（右，`bg-red-600`）

## Risks / Trade-offs

- `bg-white/70` 在深色背景下對比度需確認 → 接受，設計要求即為半透明
- Modal 遮罩會蓋住整個畫面，但因刪除為高風險操作，此為預期行為
