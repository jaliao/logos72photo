## Why

`app/layout.tsx` 仍使用 Next.js 預設佔位文字（`"Create Next App"`），favicon 也未設定，導致瀏覽器分頁與搜尋引擎顯示錯誤名稱，不符合正式上線需求。

## What Changes

- `app/layout.tsx`：
  - `metadata.title` 改為 `72 小時不間斷讀經接力自動拍照系統`
  - `metadata.description` 改為對應的繁體中文說明
  - `<html lang="en">` 改為 `lang="zh-TW"`
  - 設定 `metadata.icons` 指向 `app/favicon.png`

## Non-goals

- 不調整頁面內容或任何 UI 元件
- 不新增 Open Graph / Twitter Card meta tag（留待後續）
- 不變更字型或樣式

## Capabilities

### New Capabilities
- `seo-metadata`：全站 HTML title、description、lang 屬性與 favicon 的基礎 SEO 設定

### Modified Capabilities
<!-- 無 -->

## Impact

- `app/layout.tsx`：更新 metadata 與 lang 屬性
- `app/favicon.png`：既有檔案，透過 metadata.icons 正式啟用
