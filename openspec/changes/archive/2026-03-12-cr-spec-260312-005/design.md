## Context

`PhotoSlideshow.tsx` 是唯一實作幻燈片的元件。目前桌機版（`sm:+`）前景照片容器使用 `sm:h-full`，高度等於 overlay 的 100%（即 `100vh`），再加上 `sm:aspect-[3/4]` 決定寬度。但若瀏覽器視窗很高，照片容器本身沒有問題；問題在於若視窗比例不符 3/4，或 CSS 計算時出現溢出，照片無法正確填滿容器。

更根本的問題是：overlay 本身是 `fixed inset-0`（全螢幕），桌機版前景容器應該是「限制在視窗高度內的 3/4 比例方塊，置中於 overlay」，但目前實作的容器用 `sm:h-full` 會撐到 overlay 高度，而 `sm:w-auto` + `sm:aspect-[3/4]` 雖然理論上正確，但缺少明確的 `max-h-screen` 約束。

## Goals / Non-Goals

**Goals:**
- 桌機版：前景照片容器高度 ≤ `100vh`，維持 `aspect-[3/4]`，照片 `object-cover` 填滿
- 手機版：前景照片容器 `inset-0` 填滿全螢幕，照片 `object-cover` 填滿
- 模糊背景層維持不動（已正確填滿整個 overlay）

**Non-Goals:**
- 不更動導覽按鈕、工具列、下載 / 分享功能
- 不支援橫向（landscape）照片的特殊處理
- 不新增動畫或過場效果

## Decisions

### 決策：使用 `max-h-screen` + `aspect-[3/4]` 取代 `h-full`

**選擇：**
桌機版容器改為 `sm:max-h-screen sm:w-auto sm:aspect-[3/4]`，使容器高度最大為視窗高度，寬度依比例自動計算。

**理由：**
- `h-full` 在 `fixed inset-0` 的 overlay 下等同 `100vh`，但語意較不明確，且無法表達「不超過」的意圖
- `max-h-screen` 明確表達高度上限，若照片內容比視窗矮也能自然收縮
- `aspect-[3/4]` 搭配 `w-auto` 確保寬度由高度推算（portrait 比例）

**替代方案考慮：**
- `sm:h-screen sm:w-auto`：高度固定為視窗高，無法收縮，不採用
- 使用 JavaScript 動態計算尺寸：引入非必要複雜度，Tailwind CSS 已足夠，不採用

## Risks / Trade-offs

- **極寬螢幕（ultrawide）**：容器寬度 = `100vh * 3/4`，在 4K 寬螢幕上可能顯得偏窄，但兩側模糊背景填補視覺空間，可接受
- **超短視窗（如分割畫面）**：`max-h-screen` 會讓容器很矮，照片 `object-cover` 裁切嚴重；此為使用者主動縮小視窗的邊緣情況，不處理
