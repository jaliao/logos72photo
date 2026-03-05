## 1. 建立 GalleryDateList Client Component

- [x] 1.1 新增 `app/components/GalleryDateList.tsx`，標記 `"use client"`
- [x] 1.2 定義 props：`dateList: Array<{ date: string; slots: Set<0 | 8 | 16> }>`
- [x] 1.3 實作 `useState<boolean>(false)` 控制退場狀態（`exiting`）
- [x] 1.4 注入 `<style>` 定義 `@keyframes fadeIn`（opacity 0→1）與 `@keyframes fadeOut`（opacity 1→0）

## 2. 實作進場淡入動畫

- [x] 2.1 日期卡片 `<div>` 加上 `fadeIn` animation style，時長 400ms
- [x] 2.2 每張卡片以 `animationDelay: \`${index * 80}ms\`` 設定 staggered delay
- [x] 2.3 卡片初始 opacity 為 0，動畫結束後保持 opacity 1（`animationFillMode: 'forwards'`）

## 3. 實作退場淡出動畫與跳轉

- [x] 3.1 引入 `useRouter` from `next/navigation`
- [x] 3.2 實作 `handleNavigate(href: string)` 函式：`if (exiting) return`、`setExiting(true)`、`setTimeout(() => router.push(href), 300)`
- [x] 3.3 `exiting` 為 true 時，所有卡片套用 `fadeOut` animation（300ms），取代 `fadeIn`
- [x] 3.4 將時段格的 `<Link>` 替換為 `<div role="link" tabIndex={0}>` 並綁定 `onClick={() => handleNavigate(href)}`，保留原有 className

## 4. 修改 app/page.tsx

- [x] 4.1 import `GalleryDateList`
- [x] 4.2 將日期卡片列表（`<div className="flex flex-col gap-4">` 及其內容）移除，改為 `<GalleryDateList dateList={dateList} />`

## 5. 驗證

- [x] 5.1 本地 `npm run dev` 確認進場 staggered 淡入正常
- [x] 5.2 點擊時段格確認淡出後跳轉，不提早跳轉
- [x] 5.3 快速連點確認不重複觸發
- [x] 5.4 `npm run build` 通過，無 TypeScript 錯誤
