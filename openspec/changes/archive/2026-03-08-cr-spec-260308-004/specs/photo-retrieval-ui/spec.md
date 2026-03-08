## ADDED Requirements

### Requirement: 相簿子頁面返回連結文字陰影
時段列表頁與照片預覽頁的「← 返回」連結 SHALL 套用文字陰影（`textShadow: '0 1px 8px rgba(0,0,0,0.4)'`），確保在動態漸層背景的亮色區段仍保有足夠可讀性，視覺規格與 `<h1>` 對齊。

#### Scenario: 時段列表頁返回連結有陰影
- **WHEN** 訪客進入時段列表頁（`/gallery/[date]/[slot]`）
- **THEN** 「← 返回」連結 SHALL 顯示 `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`

#### Scenario: 照片預覽頁返回連結有陰影
- **WHEN** 訪客進入照片預覽頁（`/gallery/[date]/[slot]/[album]`）
- **THEN** 「← 返回」連結 SHALL 顯示 `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`
