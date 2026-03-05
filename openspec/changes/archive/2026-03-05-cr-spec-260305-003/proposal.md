## Why

相簿首頁的日期卡片列表目前直接渲染，無任何進場退場動畫，視覺體驗生硬。加入淡入/淡出動畫可提升頁面切換的流暢感，與背景漸層動畫形成整體視覺一致性。

## What Changes

- **進場動畫**：頁面載入後，日期卡片依序以 staggered 淡入方式出現（每張卡片間隔延遲，由上而下漸次顯示）
- **退場動畫**：使用者點擊時段格（`Link`）後，所有卡片同步淡出，淡出完成後才執行頁面跳轉
- 由於動畫需要 client-side state 與事件攔截，日期卡片列表需封裝為 Client Component

## Capabilities

### New Capabilities
- `gallery-card-animation`：日期卡片淡入進場（staggered）與淡出退場（點擊攔截）動畫

### Modified Capabilities
（無 spec 層級的行為變更）

## Non-goals

- 不對標題、副標題做動畫
- 不做捲動觸發（Intersection Observer）動畫，只做初次載入進場
- 不對相簿子頁面（`/gallery/*`）套用進退場動畫
- 不使用第三方動畫函式庫（純 CSS + React state）

## Impact

- 新增：`app/components/GalleryDateList.tsx`（`"use client"`）
- 修改：`app/page.tsx`：將日期卡片列表段落移入 `GalleryDateList` 元件
