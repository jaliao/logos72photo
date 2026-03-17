## Context

`/album/login` 已是 `'use client'` 元件，直接加入 `useState` 切換密碼顯示狀態即可，無需拆出新元件。

## Goals / Non-Goals

**Goals:**
- 密碼欄位右側加入眼睛圖示按鈕，預設 `type="text"`（可見），點擊切換為 `type="password"`（隱藏）

**Non-Goals:**
- 不修改登入邏輯或其他頁面

## Decisions

### 圖示：原生 SVG（不引入新依賴）

密碼欄位用 `relative` 包裹，右側 `absolute` 放置切換按鈕，使用內聯 SVG 眼睛圖示（open / closed），避免引入新 icon 套件。
