## ADDED Requirements

### Requirement: 時段列表頁視覺風格與首頁統一
`/gallery/[date]/[slot]` 頁面 SHALL 使用與首頁相同的動態漸層背景（`GalleryBackground`），移除靜態 `bg-zinc-50` 背景色，並對標題與卡片套用 Glassmorphism 樣式。

#### Scenario: 時段列表頁顯示動態背景
- **WHEN** 訪客進入 `/gallery/{date}/{slot}`
- **THEN** 頁面 SHALL 顯示 `GalleryBackground` 動態漸層背景，覆蓋全頁

#### Scenario: 時段列表頁標題有 text-shadow
- **WHEN** 時段列表頁顯示日期與時段標題
- **THEN** `<h1>` SHALL 具有 `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`，確保在動態背景上清晰可讀

#### Scenario: 有照片小時卡片為半透明深色
- **WHEN** 某小時子相簿有照片
- **THEN** 對應卡片 SHALL 以 `bg-zinc-800/50` 半透明深色顯示

#### Scenario: 無照片小時卡片維持不透明淺色
- **WHEN** 某小時子相簿無照片
- **THEN** 對應卡片 SHALL 維持 `bg-zinc-100` 不透明淺灰色，確保「無照片」提示清晰可讀

#### Scenario: 時段列表頁返回連結在動態背景上可讀
- **WHEN** 時段列表頁顯示返回連結
- **THEN** 返回連結 SHALL 使用 `text-white/70 hover:text-white` 樣式，在各種背景色調下皆可讀

### Requirement: 照片預覽頁視覺風格與首頁統一
`/gallery/[date]/[slot]/[album]` 頁面 SHALL 使用與首頁相同的動態漸層背景（`GalleryBackground`），移除靜態 `bg-zinc-50` 背景色，標題加 `text-shadow`。

#### Scenario: 照片預覽頁顯示動態背景
- **WHEN** 訪客進入 `/gallery/{date}/{slot}/{album}`
- **THEN** 頁面 SHALL 顯示 `GalleryBackground` 動態漸層背景，覆蓋全頁

#### Scenario: 照片預覽頁標題有 text-shadow
- **WHEN** 照片預覽頁顯示日期與小時範圍標題
- **THEN** `<h1>` SHALL 具有 `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`

#### Scenario: 照片縮圖格樣式不受影響
- **WHEN** 照片預覽頁顯示縮圖格
- **THEN** 照片縮圖格（`rounded-xl bg-zinc-200`）SHALL 維持原有樣式，不套用半透明效果

#### Scenario: 照片預覽頁返回連結在動態背景上可讀
- **WHEN** 照片預覽頁顯示返回連結
- **THEN** 返回連結 SHALL 使用 `text-white/70 hover:text-white` 樣式
