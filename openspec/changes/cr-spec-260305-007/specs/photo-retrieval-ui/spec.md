## ADDED Requirements

### Requirement: 時段列表頁 Glassmorphism 卡片容器
時段列表頁（`/gallery/[date]/[slot]`）的小時格 grid SHALL 外包一層 glassmorphism 卡片容器（`rounded-2xl bg-white/50 p-5`、`boxShadow: '0 4px 20px rgba(0,0,0,0.7)'`），視覺風格與首頁日期卡片一致。

#### Scenario: 時段列表頁顯示 glassmorphism 卡片
- **WHEN** 訪客進入時段列表頁（`/gallery/[date]/[slot]`）
- **THEN** 頁面 SHALL 在小時格 grid 外顯示半透明白色卡片容器（`bg-white/50`），帶有深色 box-shadow

#### Scenario: 卡片容器有進場動畫
- **WHEN** 時段列表頁載入完成
- **THEN** 卡片容器 SHALL 以 `fadeIn 300ms ease-out forwards` 進場，初始 opacity 為 0

### Requirement: 照片預覽頁 Glassmorphism 卡片容器
照片預覽頁（`/gallery/[date]/[slot]/[album]`）的照片 grid SHALL 外包一層 glassmorphism 卡片容器（`rounded-2xl bg-white/50 p-5`、`boxShadow: '0 4px 20px rgba(0,0,0,0.7)'`），視覺風格與首頁日期卡片一致。

#### Scenario: 照片預覽頁顯示 glassmorphism 卡片
- **WHEN** 訪客進入照片預覽頁（`/gallery/[date]/[slot]/[album]`）
- **THEN** 頁面 SHALL 在照片 grid 外顯示半透明白色卡片容器（`bg-white/50`），帶有深色 box-shadow

#### Scenario: 照片頁卡片容器有進場動畫
- **WHEN** 照片預覽頁載入完成
- **THEN** 卡片容器 SHALL 以 `fadeIn 300ms ease-out forwards` 進場，初始 opacity 為 0

### Requirement: 子頁面標題排版對齊首頁
時段列表頁與照片預覽頁的 `<h1>` 排版 SHALL 與首頁一致：字級 `text-2xl`、顏色 `text-zinc-900`、`textShadow: '0 1px 8px rgba(0,0,0,0.4)'`。subtitle（時段範圍、照片數量）顏色 SHALL 使用 `text-zinc-700`。

#### Scenario: 子頁 h1 字級與顏色一致
- **WHEN** 訪客進入任意子相簿頁面（時段列表或照片預覽）
- **THEN** `<h1>` SHALL 以 `text-2xl font-bold text-zinc-900` 搭配 `textShadow` 顯示

#### Scenario: 子頁 subtitle 顏色一致
- **WHEN** 訪客進入任意子相簿頁面
- **THEN** subtitle 文字（時段範圍、照片數量等）SHALL 以 `text-zinc-700` 顯示
