## Context

全站相簿 h1（「2026 不間斷讀經接力」）與次標題出現於首頁、gallery slot、gallery album、個人相簿共 4 處，各自重複撰寫相同結構。現行顏色規格為 `text-zinc-900` / `text-zinc-700`，與動態背景搭配對比不足。

## Goals / Non-Goals

**Goals:**
- 建立 `GalleryHeading` Server Component，props：`subtitle`、`headingClassName?`、`subtitleClassName?`
- 大標題固定顏色 `rgb(219, 175, 141)`、次標題固定顏色 `rgb(62, 208, 195)`
- 4 個頁面統一使用此元件

**Non-Goals:**
- 不改登入頁、後台頁面
- 不改字級、字重

## Decisions

### 1. Server Component（非 Client Component）

元件無互動邏輯，設計為 Server Component，避免不必要的 JS bundle。

### 2. Tailwind 任意值語法

使用 `text-[rgb(219,175,141)]` 與 `text-[rgb(62,208,195)]` 直接內嵌 RGB，不額外設定 Tailwind 主題色，避免增加設定複雜度。

### 3. headingClassName / subtitleClassName props

各頁面的 margin 不同（首頁 `mb-8 font-bold`、其他 `mb-6`；個人相簿 `mb-3`），以 props 傳入附加 class，預設值 `mb-6 text-sm`。

## Risks / Trade-offs

- **Tailwind purge** → 任意值 class 需實際出現在原始碼中才不被 purge，本元件直接寫死字串，無風險
