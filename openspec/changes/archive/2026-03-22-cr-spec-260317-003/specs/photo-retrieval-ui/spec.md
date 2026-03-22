## MODIFIED Requirements

### Requirement: 相簿首頁標題
所有相簿頁面（首頁、時段列表頁、照片預覽頁、個人相簿頁）的 `<h1>` SHALL 統一顯示「2026 不間斷讀經接力」作為品牌標題，並透過共用元件 `GalleryHeading` 渲染，確保顏色與樣式一致。大標題顏色 SHALL 為 `rgb(219, 175, 141)`，次標題顏色 SHALL 為 `rgb(62, 208, 195)`。登入頁不套用此元件。

#### Scenario: 首頁顯示品牌標題
- **WHEN** 訪客進入首頁（`/`）
- **THEN** 頁面頂部 SHALL 以 `rgb(219,175,141)` 顯示「2026 不間斷讀經接力」，次標題「讀經側拍相簿」以 `rgb(62,208,195)` 顯示

#### Scenario: 時段列表頁顯示品牌標題
- **WHEN** 訪客進入時段列表頁（`/gallery/[date]/[slot]`）
- **THEN** `<h1>` SHALL 以 `rgb(219,175,141)` 顯示「2026 不間斷讀經接力」，次標題 SHALL 以 `rgb(62,208,195)` 顯示日期與時段範圍

#### Scenario: 照片預覽頁顯示品牌標題
- **WHEN** 訪客進入照片預覽頁（`/gallery/[date]/[slot]/[album]`）
- **THEN** `<h1>` SHALL 以 `rgb(219,175,141)` 顯示「2026 不間斷讀經接力」，次標題 SHALL 以 `rgb(62,208,195)` 顯示日期與小時範圍

#### Scenario: 個人相簿頁顯示品牌標題
- **WHEN** 已登入來賓進入 `/album/[slotGroup]`
- **THEN** `<h1>` SHALL 以 `rgb(219,175,141)` 顯示「2026 不間斷讀經接力」，次標題 SHALL 以 `rgb(62,208,195)` 顯示時段說明

### Requirement: 子頁面標題排版對齊首頁
時段列表頁、照片預覽頁與個人相簿頁的 `<h1>` 排版 SHALL 與首頁一致：字級 `text-2xl`、顏色 `rgb(219,175,141)`、`textShadow: '0 1px 8px rgba(0,0,0,0.4)'`。次標題顏色 SHALL 使用 `rgb(62,208,195)`，字級 `text-sm`。所有相簿頁面 SHALL 使用 `GalleryHeading` 元件統一渲染（登入頁除外）。

#### Scenario: 子頁 h1 字級與顏色一致
- **WHEN** 訪客進入任意子相簿頁面（時段列表、照片預覽或個人相簿）
- **THEN** `<h1>` SHALL 以 `text-2xl font-bold` 搭配顏色 `rgb(219,175,141)` 與 `textShadow` 顯示

#### Scenario: 子頁次標題顏色一致
- **WHEN** 訪客進入任意子相簿頁面
- **THEN** 次標題 SHALL 以 `rgb(62,208,195)` 顯示上下文資訊
