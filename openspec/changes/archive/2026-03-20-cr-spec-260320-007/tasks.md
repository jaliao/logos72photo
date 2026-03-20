## 1. 提示區塊

- [x] 1.1 將說明文字改為黃底提示區塊（`bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900`）
- [x] 1.2 文案更新為「本照片用於活動行銷宣傳，如不同意請點「刪除」自行移除。」
- [x] 1.3 封面展開模式也顯示相同提示區塊（移除原本封面不顯示說明的邏輯）

## 2. iOS 下載

- [x] 2.1 新增 iOS 偵測函式（`/iPhone|iPad|iPod/.test(navigator.userAgent)`）
- [x] 2.2 iOS 上：按鈕文字改為「開啟照片」，點擊呼叫 `window.open(r2Url, '_blank')`
- [x] 2.3 iOS 下載後顯示說明文字「開啟後長按圖片 → 選擇「儲存影像」即可存入相簿」
- [x] 2.4 非 iOS 維持原有 `fetch → blob → <a download>` 行為

## 3. 刪除二次確認

- [x] 3.1 新增 `confirmingDelete` boolean state
- [x] 3.2 點「刪除」→ 設 `confirmingDelete = true`，按鈕列切換為「確定刪除」+「取消」
- [x] 3.3 點「確定刪除」→ 執行刪除 API；點「取消」→ 恢復原按鈕列
- [x] 3.4 刪除完成或錯誤後重設 `confirmingDelete = false`

## 4. 版本與文件

- [x] 4.1 更新 `config/version.json` patch +1
- [x] 4.2 更新 `README-AI.md`

## 5. 迭代修正

- [x] 5.1 頁碼點點加上 `cursor-pointer` 游標樣式
- [x] 5.2 提示區塊改為白底黑框（`border border-black bg-white`）
- [x] 5.3 iOS 提示文案改為「iPhone 儲存照片：點「開啟照片」→ 在新頁長按圖片 → 選擇「儲存影像」」
- [x] 5.4 點點移至照片下方、說明文字上方
- [x] 5.5 「返回列表」移至最下方，樣式與「下載」按鈕一致（`bg-zinc-800 text-white`）
- [x] 5.6 時段標籤格式改為 `MM/DD HH:mm`，採用 `rounded-full bg-white/20` 標籤樣式
