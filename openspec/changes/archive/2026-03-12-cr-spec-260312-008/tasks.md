## 1. 點擊背景關閉幻燈片

- [x] 1.1 在最外層 overlay `<div>` 加上 `onClick={close}`
- [x] 1.2 在前景照片容器 `<div>` 加上 `onClick={(e) => e.stopPropagation()}`
- [x] 1.3 在左右箭頭按鈕的 `onClick` 中加上 `e.stopPropagation()`，防止點擊箭頭觸發 overlay 關閉

## 2. 切換轉場動畫

- [x] 2.1 新增 `direction` state（型別 `'left' | 'right' | null`，預設 `null`）
- [x] 2.2 修改 `prev()` 在切換 index 同時設定 `direction = 'left'`；修改 `next()` 設定 `direction = 'right'`
- [x] 2.3 前景照片容器加上 `transition-transform duration-300`，依 `direction` 設定初始 `translateX`（right → 從 `translate-x-full` 開始，left → 從 `-translate-x-full` 開始，null → `translate-x-0`）
- [x] 2.4 使用 `useEffect` + double `requestAnimationFrame` 在初始 off-screen render 後觸發滑入動畫

## 3. 版本與文件更新

- [x] 3.1 `config/version.json` patch +1（0.1.36 → 0.1.37）
- [x] 3.2 依 `.ai-rules.md` 重新產生 `README-AI.md`
