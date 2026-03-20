## 1. 提示區塊樣式

- [x] 1.1 將提示區塊背景由 `bg-white` 改為 `bg-white/70`
- [x] 1.2 將提示文字樣式改為 `font-semibold text-black`
- [x] 1.3 iOS 說明區塊套用相同樣式（`bg-white/70 font-semibold text-black`）

## 2. 返回按鈕文字

- [x] 2.1 將「← 返回列表」改為「返回列表」（移除箭頭符號）

## 3. 刪除確認 Modal

- [x] 3.1 移除 `confirmingDelete` inline 按鈕切換邏輯
- [x] 3.2 新增 modal overlay（`fixed inset-0 z-50 flex items-center justify-center bg-black/50`）
- [x] 3.3 modal 內容：白色卡片（`rounded-2xl bg-white p-6 mx-4 max-w-sm w-full`）
- [x] 3.4 modal 文案：「確定要刪除這張照片嗎？刪除後無法復原。」
- [x] 3.5 modal 按鈕列：「取消」（`bg-zinc-300 text-zinc-800`）+ 「確定刪除」（`bg-red-600 text-white`），橫排等寬
- [x] 3.6 刪除失敗時於 modal 內顯示錯誤文字，不關閉 modal
- [x] 3.7 刪除成功或取消後關閉 modal，重設狀態

## 4. 版本與文件

- [x] 4.1 更新 `config/version.json` patch +1
- [x] 4.2 更新 `README-AI.md`
