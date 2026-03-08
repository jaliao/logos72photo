## Context

相簿首頁（`/`）已套用完整視覺語言：`GalleryBackground` 動態背景、glassmorphism 日期卡片（`rounded-2xl bg-white/50 p-5 + boxShadow`）、進退場動畫。子頁面（時段列表、照片預覽）雖已加入 `GalleryBackground` 與標題 `textShadow`，但主要內容區塊（小時格 grid、照片 grid）缺少相同的卡片容器，視覺層次明顯不足。

## Goals / Non-Goals

**Goals:**
- 時段頁與照片頁的主要內容區塊加入 glassmorphism 卡片容器，與首頁日期卡片視覺一致
- 子頁標題排版（字級、顏色）對齊首頁
- 子頁加入進場 fadeIn 動畫

**Non-Goals:**
- 不修改 GalleryBackground 元件
- 不修改首頁任何樣式或行為
- 不重構路由或資料取得邏輯
- 不為子頁面加入退場動畫（點擊 back link 不攔截，仍使用 Next.js 原生導航）

## Decisions

### D1：不抽取共用 GlassCard 元件

直接在各 Server Component 頁面內聯 glassmorphism 樣式（`rounded-2xl bg-white/50 p-5` + `boxShadow`），不新增共用元件。

- **理由**：兩個頁面的卡片包裝方式略有差異（時段頁是一個大卡片包全 grid；照片頁同樣一個大卡片），內聯樣式保持 Server Component，避免引入額外 Client Component。若未來有第三個使用場景再抽取。
- **替代方案**：建立 `<GlassCard>` Server Component — 目前僅 2 處使用，過早抽象。

### D2：進場動畫使用內聯 CSS animation，不轉 Client Component

在 `<style>` 標籤定義 `@keyframes fadeIn`，並以 `style={{ animation: 'fadeIn ...' }}` 掛載。

- **理由**：子頁面為 Server Component，只需進場動畫（無互動狀態），不需要 `useState` / `useEffect`。內聯 CSS animation 可在 Server Component 執行，無需轉 Client Component。
- **替代方案**：將頁面包成 Client Component 使用 Framer Motion — 引入不必要的 bundle，且失去 Server Component 優勢。

### D3：照片頁 max-w 維持 max-w-2xl

照片預覽頁在桌面版需展示較多照片，保持 `max-w-2xl`，與首頁 `max-w-lg` 不同。時段頁維持 `max-w-lg`。

- **理由**：照片 grid `grid-cols-2 sm:grid-cols-3` 需要更寬的內容區才能充分展示縮圖；強制 `max-w-lg` 會使桌面版縮圖過小。
- **替代方案**：全部統一為 `max-w-lg` — 犧牲照片頁桌面體驗，不採用。

### D4：標題改為 text-2xl text-zinc-900，對齊首頁

子頁面 h1 從 `text-xl text-zinc-800` 改為 `text-2xl text-zinc-900`；subtitle 從 `text-zinc-600` 改為 `text-zinc-700`。

- **理由**：首頁 h1 使用 `text-2xl text-zinc-900`，子頁面改用相同規格可建立統一的文字層次。
- **替代方案**：維持 `text-xl`，以大小區分層級 — 但背景相同，不需要刻意降階。

## Risks / Trade-offs

- **CSS animation 初始 opacity: 0** → 需確保 `animation: fadeIn 300ms forwards` 在 SSR HTML 中正確套用，避免 FOUC。使用 `forwards` fill-mode 確保動畫結束後維持 `opacity: 1`。
- **boxShadow 在 Tailwind 以 style prop 傳入** → 與首頁 GalleryDateList 一致，使用 `style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.7)' }}`，不需新增 Tailwind arbitrary value。

## Migration Plan

1. 修改 `app/gallery/[date]/[slot]/page.tsx`：加 glassmorphism 卡片、調整 h1/subtitle、加 fadeIn
2. 修改 `app/gallery/[date]/[slot]/[album]/page.tsx`：加 glassmorphism 卡片、調整 h1/subtitle、加 fadeIn
3. 本地視覺確認（行動版 + 桌面版）
4. Rollback：git revert 即可，無資料或 API 變更
