## Why

相簿子頁面的「← 返回」連結文字在動態漸層背景上可讀性不足，缺乏陰影讓文字在亮色背景區段難以辨識。與 `<h1>` 已有 `textShadow` 的處理保持視覺一致。

## What Changes

- 時段列表頁（`/gallery/[date]/[slot]`）「← 返回」連結加上 `textShadow`
- 照片預覽頁（`/gallery/[date]/[slot]/[album]`）「← 返回」連結加上 `textShadow`
- 陰影值與 h1 相同：`0 1px 8px rgba(0,0,0,0.4)`

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
- `photo-retrieval-ui`：返回連結文字陰影規格新增

## Impact

- `app/gallery/[date]/[slot]/page.tsx`
- `app/gallery/[date]/[slot]/[album]/page.tsx`

## Non-goals

- 不修改返回連結的顏色、字級或 hover 行為
- 不影響首頁
