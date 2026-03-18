## Why

後台 `/admin/slot-passwords` 目前只有帳密列印功能，缺少給參與者的實體明信片列印工具。需要能一次產生每個時段的密碼明信片，供現場發放，To 欄留白讓工作人員手寫。

## What Changes

- 在 `/admin/slot-passwords` 頁面的「匯出與列印」區塊新增「列印明信片」連結按鈕
- 新增 `/admin/slot-passwords/postcard` 列印頁
  - 以 `public/postcard/2.png`（1748×1240 px）為底圖
  - 每張明信片疊印：時段標籤、帳號、密碼
  - To 欄位保留空白
  - 工具列含「列印 / 儲存為 PDF」按鈕，列印時隱藏（同 `/print` 頁模式）
  - `@media print` 確保每頁一張（或依紙張尺寸排版）

## Capabilities

### New Capabilities
- `slot-password-postcard`: 時段密碼明信片列印頁，以底圖合成帳密資訊並支援瀏覽器列印轉 PDF

### Modified Capabilities
- `admin-slot-passwords`: 在「匯出與列印」區塊新增「列印明信片」入口連結

## Impact

- 新增檔案：`app/admin/slot-passwords/postcard/page.tsx`
- 修改檔案：`app/admin/slot-passwords/page.tsx`（新增入口按鈕）
- 靜態資源：`public/postcard/2.png`（底圖，已存在）
- 無新增 API 或外部相依；沿用既有 `derivePassword`、`generateAllSlotGroups`、`formatSlotGroupLabel`
