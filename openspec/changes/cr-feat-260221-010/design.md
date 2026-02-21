## Context

Next.js App Router 的全域 metadata 在 `app/layout.tsx` 的 `export const metadata` 物件定義。favicon 可透過 `metadata.icons` 指定路徑，Next.js 會自動生成對應的 `<link rel="icon">` tag。

## Goals / Non-Goals

**Goals:**
- 正確顯示網站名稱於瀏覽器分頁與搜尋引擎結果
- 啟用 `app/favicon.png` 作為網站圖示

**Non-Goals:**
- Open Graph / Twitter Card meta tag
- 多語系 metadata

## Decisions

### 決策：使用 Next.js metadata.icons 設定 favicon

`metadata.icons = { icon: '/favicon.png' }` — Next.js 自動處理 `<link rel="icon">`，不需手動在 `<head>` 加 tag。`app/favicon.png` 已存在，直接引用。

## Migration Plan

1. 更新 `app/layout.tsx` metadata 與 lang 屬性
2. build + push
