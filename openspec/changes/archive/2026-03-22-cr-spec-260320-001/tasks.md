## 1. 建立後台 Gallery 路由

- [x] 1.1 建立 `app/admin/gallery/[date]/[slot]/page.tsx`，內容複製自 `app/gallery/[date]/[slot]/page.tsx`，更新檔頭與內部連結路徑
- [x] 1.2 建立 `app/admin/gallery/[date]/[slot]/[album]/page.tsx`，內容複製自 `app/gallery/[date]/[slot]/[album]/page.tsx`，更新檔頭

## 2. 舊路徑 redirect

- [x] 2.1 建立 `app/gallery/[...slug]/page.tsx`，內容僅含 `redirect('/admin/login')`，取代現有 `[date]/[slot]` 子路由
- [x] 2.2 刪除 `app/gallery/[date]/` 目錄及其所有子路由（`[slot]/page.tsx`、`[slot]/[album]/page.tsx`）

## 3. 首頁連結更新

- [x] 3.1 修改 `app/page.tsx`（或對應的時段格元件），將時段格的 `href` 由 `/gallery/{date}/{slot}` 改為 `/admin/gallery/{date}/{slot}`

## 4. 版本與文件

- [x] 4.1 更新 `config/version.json` patch 版號 +1
- [x] 4.2 依 `.ai-rules.md` 重新產生 `README-AI.md`
