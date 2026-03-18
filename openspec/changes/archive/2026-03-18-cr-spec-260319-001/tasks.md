## 1. 明信片列印頁

- [x] 1.1 新增 `app/admin/slot-passwords/postcard/page.tsx`，設定 `runtime = 'edge'`、`dynamic = 'force-dynamic'`，批次計算所有時段密碼（沿用 print 頁邏輯）
- [x] 1.2 實作明信片容器 CSS：底圖 `public/postcard/2.png` 為背景，相對定位容器包裹絕對定位文字層
- [x] 1.3 疊印時段標籤、帳號、密碼（參考 `public/postcard/3.png` 確認文字位置）
- [x] 1.4 加入 `@media print` 樣式：工具列隱藏、每張明信片 `page-break-after: always`
- [x] 1.5 新增 `app/admin/slot-passwords/postcard/PrintButton.tsx`（`'use client'`，`window.print()`）

## 2. 後台入口

- [x] 2.1 在 `app/admin/slot-passwords/page.tsx`「匯出與列印」區塊新增「列印明信片」`<a>` 按鈕，`target="_blank"`，href 指向 `/admin/slot-passwords/postcard`

## 3. 版本與文件

- [x] 3.1 更新 `config/version.json` patch 版號 +1
- [x] 3.2 依 `.ai-rules.md` 重新產生 `README-AI.md`

## 4. 上線前

- [x] 4.1 移除 `app/admin/slot-passwords/postcard/page.tsx:33` 的 `.slice(0, 10)` debug 限縮
