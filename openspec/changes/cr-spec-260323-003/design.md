## Context

`GalleryBackground` 目前以 `bgSrc` prop 接收靜態圖片路徑，當傳入 `/bg/album/1.jpg` 時顯示該背景圖。相簿相關頁面（`/album/*`）與後台管理頁面（`/admin/*`）共 4 處使用此路徑。目標是以 CSS `linear-gradient` 取代圖片，顏色取自 `public/bg/album/1.png` 的實際色票（深藍→暖琥珀→深褐）。

## Goals / Non-Goals

**Goals:**
- `GalleryBackground` 新增 `gradient?: string` prop，傳入時以 CSS 漸層取代背景圖
- 4 個頁面改傳 `gradient`，移除 `bgSrc="/bg/album/1.jpg"`
- 漸層顏色忠實反映原圖色調：`#1a2d3d → #1e3345 → #c47a3a → #6b3318`（由上至下）

**Non-Goals:**
- 不動現有 `bgSrc` prop（向下相容，其他頁面不受影響）
- 不刪除 `public/bg/album/1.jpg`（保留以備回退）
- 不調整漸層動畫覆蓋層（overlay）的行為

## Decisions

**決策 1：新增 `gradient` prop 而非重用 `bgSrc`**
- 選擇：在 `GalleryBackground` 加入 `gradient?: string`，當此 prop 存在時以 `background: gradient` 取代 `backgroundImage: url(...)`
- 理由：`bgSrc` 語意明確為圖片路徑；混用 CSS 字串會造成型別混淆。分開 prop 讓呼叫端意圖清晰，也利於日後各別調整。
- 備選：直接讓 `bgSrc` 接受 `linear-gradient(...)` 字串 → 捨棄，因語意不符且可能破壞現有使用者。

**決策 2：漸層色票**
- 取自 `public/bg/album/1.png` 的視覺色彩分佈：
  ```
  linear-gradient(to bottom,
    #1a2d3d 0%,    /* 深藍天空頂部 */
    #1e3345 45%,   /* 中段過渡 */
    #c47a3a 80%,   /* 暖琥珀地平線 */
    #6b3318 100%   /* 深褐山底 */
  )
  ```
- 各頁面直接 hardcode 此字串，不另抽 constant（只有 4 處，抽象化過度工程）

**決策 3：component 邏輯**
- 優先順序：`gradient` > `bgSrc` > 響應式預設
- 當 `gradient` 傳入：`background: gradient`，`backgroundImage` 留空
- `bgSrc` 與 `gradient` 同時傳入時，`gradient` 優先（加 console.warn 提示誤用，但不 throw）

## Risks / Trade-offs

- **漸層與動畫 overlay 疊加效果**：`overlay` mix-blend-mode 覆蓋在純色漸層上效果可能與圖片時不同 → 視覺驗收後微調 overlay opacity（目前 0.7）
- **色票主觀判斷**：色碼取自目視分析，非 histogram 取樣 → 可接受誤差，實際渲染後調整
