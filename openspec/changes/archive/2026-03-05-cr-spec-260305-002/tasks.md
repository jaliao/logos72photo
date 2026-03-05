## 1. 建立 GalleryBackground 元件

- [x] 1.1 新增 `app/components/GalleryBackground.tsx`，標記 `"use client"`
- [x] 1.2 實作 `useState<number | null>(null)` 儲存隨機圖片編號，`useEffect` mount 後執行 `Math.floor(Math.random() * 10) + 1` 設值
- [x] 1.3 實作背景圖層：`position: fixed`，全視窗覆蓋，`background-image: url(/bg/${n}.png)`，`background-size: cover`，`background-position: center`，`z-index: 0`
- [x] 1.4 實作漸層覆蓋層：絕對定位覆蓋父層，`opacity: 0.7`，套用 `dayNightCycle` CSS animation

## 2. 實作 CSS Keyframe 動畫

- [x] 2.1 在元件內以 `<style>` 標籤定義 `@keyframes dayNightCycle`，共 5 個 keyframe（0%、25%、50%、75%、100%）
- [x] 2.2 設定各 keyframe 的 `background`（`linear-gradient(to bottom left, <日色>, <夜色>)`）
  - 0%/100%：`#fde68a`（右上）→ `#1e3a5f`（左下）
  - 25%：`#fed7aa` → `#312e81`
  - 50%：`#e0f2fe` → `#0f172a`
  - 75%：`#fde68a` → `#1e3a5f`
- [x] 2.3 設定覆蓋層 `animation: dayNightCycle 10s ease-in-out infinite`

## 3. 修改 app/page.tsx

- [x] 3.1 移除 `<main>` 的 `style={{ backgroundImage: "url('/bg/1.png')" }}`
- [x] 3.2 在 `<main>` 最前面插入 `<GalleryBackground />`，確保 `<main>` 有 `position: relative`，`z-index` 使內容層疊於背景之上
- [x] 3.3 確認日期卡片列表文字在各動畫狀態下仍清晰可讀（卡片有白色背景，不需額外處理）

## 4. 驗證

- [x] 4.1 本地 `npm run dev` 確認動畫正常循環，opacity 半透明，背景圖透出
- [x] 4.2 確認重新整理後背景圖隨機切換
- [x] 4.3 確認 console 無 hydration warning
- [x] 4.4 `npm run build` 通過，無 TypeScript 錯誤
