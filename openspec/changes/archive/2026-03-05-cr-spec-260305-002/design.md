## Context

相簿首頁（`app/page.tsx`）目前為 Server Component，背景以靜態 inline style `backgroundImage: "url('/bg/1.png')"` 寫死。需改為動態背景：隨機選取 `public/bg/1.png–10.png` 其中一張，並套用白天↔黑夜漸層動畫覆蓋層（opacity 0.6–0.8）。

由於隨機數（`Math.random()`）必須在 client 端執行（避免 hydration mismatch），且 CSS animation 的控制也在 client，需要一個獨立的 Client Component。

## Goals / Non-Goals

**Goals:**
- `GalleryBackground` Client Component：mount 後隨機選取背景圖、套用動畫漸層覆蓋層
- 動畫：右上白天 → 左下黑夜，5 keyframe，每段 2 秒，10 秒週期，`infinite` 循環
- 漸層覆蓋層 opacity 0.6–0.8，讓背景圖適度透出
- `app/page.tsx` 保持 Server Component，僅移除靜態 backgroundImage，插入 `<GalleryBackground>`

**Non-Goals:**
- 不依實際時間決定動畫起始狀態
- 不在子頁面（`/gallery/*`）套用
- 不提供使用者控制動畫的 UI

## Decisions

### 1. 獨立 Client Component 而非在 page.tsx 加 `"use client"`

**選擇：** 新增 `app/components/GalleryBackground.tsx`（`"use client"`）
**理由：** `app/page.tsx` 有 Firestore 資料查詢（Server Component 的核心價值）。若整頁改為 Client Component，資料取得需移至 API route 或 SWR，增加複雜度。獨立元件讓 Server/Client 邊界清晰。

### 2. 漸層動畫實作：CSS Keyframes via Tailwind arbitrary + inline style

**選擇：** 使用 `<style>` 標籤注入 `@keyframes` + `animation` inline style
**理由：** 動畫的 keyframe 顏色為 hardcoded 設計值，不需要 Tailwind class 動態生成。用 `<style>` 標籤直接定義最簡潔，不依賴 Tailwind plugin 或 `safelist`。
**替代方案：** Tailwind `animate-*` custom → 需修改 `tailwind.config`，較繁瑣。

### 3. 背景圖層結構：絕對定位雙層

```
<div> ← 相對定位容器（fixed full screen）
  <div> ← 背景圖層（background-image, bg-cover）
  <div> ← 漸層動畫覆蓋層（animated gradient, opacity 0.7）
```

**理由：** 分離背景圖與漸層層，各自獨立控制樣式，不互相干擾。

### 4. 漸層 5 keyframe 色彩設計

| Keyframe | 右上（白天） | 左下（黑夜） | 語意 |
|---|---|---|---|
| 0% | `#fde68a`（黃） | `#1e3a5f`（深藍） | 清晨 |
| 25% | `#fed7aa`（橙） | `#312e81`（靛紫） | 日落 |
| 50% | `#e0f2fe`（天藍） | `#0f172a`（深夜） | 正午→深夜 |
| 75% | `#fde68a`（黃） | `#1e3a5f`（深藍） | 黎明 |
| 100% | `#fde68a`（黃） | `#1e3a5f`（深藍） | 回到起點（seamless loop） |

### 5. 隨機圖片：`useState` 初始化為 null，`useEffect` 設值

**理由：** SSR 時 state 為 null，背景圖層不渲染，避免 server/client HTML 不一致造成 hydration error。mount 後 `useEffect` 執行 `Math.random()` 設定圖片編號。

## Risks / Trade-offs

- **首次 render 閃爍**：SSR 無背景圖，hydration 後才出現。→ 可接受，首頁非 LCP 關鍵路徑。
- **動畫 CPU 使用**：低階裝置持續執行 CSS animation 可能消耗電量。→ 動畫純 CSS，瀏覽器會 GPU 加速，影響極小。
- **10 張圖片初次載入**：只載入隨機選中的 1 張，其餘不載入。→ 無問題。

## Migration Plan

1. 新增 `app/components/GalleryBackground.tsx`
2. 修改 `app/page.tsx`：移除 `style={{ backgroundImage: ... }}`，在 `<main>` 內加入 `<GalleryBackground />`
3. 確認 `public/bg/1.png–10.png` 已上傳
4. **Rollback**：還原 `app/page.tsx` 的 style，刪除 GalleryBackground 即可

## Open Questions

- 漸層 opacity 最終值：0.6 或 0.8？→ 實作後視覺確認，預設使用 0.7（中間值）
