## Context

兩個相簿子頁面的「← 返回」連結使用 `className` 控制顏色，但無陰影。動態漸層背景在亮色時段會讓白色文字難以辨識。`<h1>` 已有 `style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}`，返回連結應對齊。

## Goals / Non-Goals

**Goals:**
- 兩個頁面的「← 返回」連結加上與 h1 相同的 textShadow

**Non-Goals:**
- 不修改其他樣式屬性

## Decisions

直接在兩個 `<Link>` 元素加 `style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}`，與現有 h1 處理方式一致，無需新增 CSS 變數或共用元件（僅兩處）。
