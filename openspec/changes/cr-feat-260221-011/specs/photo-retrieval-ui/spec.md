## MODIFIED Requirements

### Requirement: 相簿首頁標題
所有相簿頁面（首頁、時段列表頁、照片預覽頁）的 `<h1>` SHALL 統一顯示「不間斷讀經接力相簿」作為品牌標題，讓訪客在任何層級的頁面都能識別網站品牌。日期、時段、小時範圍等上下文資訊 SHALL 改以副標題（`<p>`）方式呈現於 h1 下方。

#### Scenario: 首頁顯示品牌標題
- **WHEN** 訪客進入首頁（`/`）
- **THEN** 頁面頂部 SHALL 顯示「不間斷讀經接力相簿」大標題，副標題顯示「從白天到黑夜不停的運行」

#### Scenario: 時段列表頁顯示品牌標題
- **WHEN** 訪客進入時段列表頁（`/gallery/[date]/[slot]`）
- **THEN** `<h1>` SHALL 顯示「不間斷讀經接力相簿」，副標題 SHALL 顯示日期與時段範圍（例：`2026-03-08 · 08:00 – 16:00`）

#### Scenario: 照片預覽頁顯示品牌標題
- **WHEN** 訪客進入照片預覽頁（`/gallery/[date]/[slot]/[album]`）
- **THEN** `<h1>` SHALL 顯示「不間斷讀經接力相簿」，副標題 SHALL 顯示日期與小時範圍（例：`2026-03-08 · 08:00 – 09:00`）

### Requirement: 子頁面標題排版對齊首頁
時段列表頁與照片預覽頁的 `<h1>` 排版 SHALL 與首頁一致：字級 `text-2xl`、顏色 `text-zinc-900`、`textShadow: '0 1px 8px rgba(0,0,0,0.4)'`。副標題（日期 + 時段資訊）顏色 SHALL 使用 `text-zinc-700`，字級 `text-sm`。

#### Scenario: 子頁 h1 字級與顏色一致
- **WHEN** 訪客進入任意子相簿頁面（時段列表或照片預覽）
- **THEN** `<h1>` SHALL 以 `text-2xl font-bold text-zinc-900` 搭配 `textShadow` 顯示「不間斷讀經接力相簿」

#### Scenario: 子頁副標題顯示上下文資訊
- **WHEN** 訪客進入任意子相簿頁面
- **THEN** 副標題 SHALL 以 `text-sm text-zinc-700` 顯示日期與時段上下文，取代原先的 h1 日期文字

## ADDED Requirements

### Requirement: 首頁日期卡片陰影加深
首頁日期卡片的 box-shadow SHALL 使用更深的陰影值（`0 8px 40px rgba(0,0,0,0.85)`），增強卡片在動態背景上的視覺層次感。

#### Scenario: 首頁日期卡片顯示深色陰影
- **WHEN** 訪客進入首頁，日期卡片載入完成
- **THEN** 每張日期卡片 SHALL 顯示 `0 8px 40px rgba(0,0,0,0.85)` box-shadow，視覺上明顯浮於背景之上
