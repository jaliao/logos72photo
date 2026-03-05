## Context

相簿首頁（`app/page.tsx`）是 Server Component，日期卡片列表直接以 JSX 渲染，無動畫。需要進場（淡入）與退場（淡出後跳轉）動畫，兩者都需要 client-side 能力（CSS animation timing + 事件攔截 + router）。

背景動畫（`GalleryBackground`）已於 cr-spec-260305-002 實作，本 CR 的動畫層獨立於背景層。

## Goals / Non-Goals

**Goals:**
- 頁面載入後，日期卡片以 staggered 淡入方式進場（每張延遲 80ms × index）
- 點擊時段 Link 時，攔截跳轉，先播放全體淡出，完成後再 `router.push()`
- Server Component `app/page.tsx` 保持不變，僅插入 `GalleryDateList` Client Component

**Non-Goals:**
- 標題、副標題不做動畫
- 不使用 Intersection Observer（只做初次 mount 進場）
- 不引入第三方動畫函式庫

## Decisions

### 1. 抽出 `GalleryDateList` Client Component

**選擇：** 新增 `app/components/GalleryDateList.tsx`（`"use client"`）
**理由：** 動畫需要 `useState`（控制退場狀態）、`useRouter`（跳轉）、CSS class 切換。若直接在 `page.tsx` 加 `"use client"` 會使整頁失去 Server Component 優勢（Firestore 查詢需移至 API route）。`GalleryDateList` 接收 `dateList` 作為 prop，資料仍由 server 取得。

### 2. 進場動畫：CSS `@keyframes fadeIn` + staggered delay

**選擇：** `<style>` 注入 `@keyframes fadeIn`（opacity 0→1），每張卡片以 `animationDelay: \`${index * 80}ms\`` 錯開
**理由：** 純 CSS，無 JS runtime，不阻塞渲染。staggered delay 讓卡片由上而下依序出現，視覺層次清晰。
**替代：** Framer Motion `staggerChildren` → 引入 >100 KB 依賴，過重。

### 3. 退場動畫：state 控制 + setTimeout + router.push

**流程：**
```
onClick(href) →
  setExiting(true) →           // 觸發 CSS fadeOut class
  setTimeout(300ms) →          // 等待動畫完成
  router.push(href)            // 執行跳轉
```

**選擇：** `useState<string | null>(null)` 儲存目標 href，`exiting` boolean 驅動 CSS class
**理由：** 最輕量的實作，不需要任何額外套件。300ms 對應淡出動畫時長，足夠流暢。

### 4. Link 改為 `<div>` + `onClick` 攔截

**選擇：** 將時段格的 `<Link>` 替換為 `<button>` 或帶 `role="link"` 的 `<div>`，在 onClick 內執行攔截邏輯
**理由：** `<Link>` 的跳轉無法直接攔截並延遲。改用 `onClick` + `router.push()` 可精確控制跳轉時機。保留 `cursor-pointer` 與 `aria` 屬性維持可及性。

### 5. 動畫時長

| 動畫 | 時長 | 說明 |
|---|---|---|
| 進場 fadeIn | 400ms | 每張卡片個別計算，含 stagger delay |
| 退場 fadeOut | 300ms | 所有卡片同步，300ms 後跳轉 |

## Risks / Trade-offs

- **退場動畫被跳過**：若使用者瀏覽器返回（back button）進入此頁，進場動畫會重新播放（屬預期行為）。
- **SSR/Hydration**：卡片初始 opacity 為 0（動畫起始值），server HTML 與 client hydration 後視覺一致，無閃爍問題。
- **多次點擊**：`exiting` 狀態期間應禁用點擊，避免重複觸發。→ onClick 檢查 `if (exiting) return`。
