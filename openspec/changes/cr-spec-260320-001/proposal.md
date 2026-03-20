## Why

目前 `/gallery` 相簿為公開路由，任何人皆可存取，實際上僅供攝影師／管理員操作使用。將其搬入後台（`/admin/gallery`），可確保瀏覽權限統一由 admin session 控管，並讓前台保持乾淨的訪客體驗。

## What Changes

- 將 `app/gallery/` 路由樹整體移植至 `app/admin/gallery/`（含 `[date]/[slot]` 與 `[date]/[slot]/[album]` 子頁面）
- 刪除原 `app/gallery/` 路由；外部存取 `/gallery/**` 改為 redirect 至 `/admin/login`（或直接 404）
- Admin middleware 已涵蓋 `/admin/**`，Gallery 頁面自動受 admin session 保護，無需額外 auth 邏輯
- 首頁（`app/page.tsx`）的 `NEXT_PUBLIC_GALLERY_ENABLED` 開關與導向邏輯隨之調整

## Capabilities

### New Capabilities
- `admin-gallery`：後台相簿瀏覽功能，路由為 `/admin/gallery/[date]/[slot]` 與 `/admin/gallery/[date]/[slot]/[album]`，需持有有效 admin session

### Modified Capabilities
- `photo-retrieval-ui`：Gallery 入口路徑由 `/gallery` 改為 `/admin/gallery`，首頁時段格連結需同步更新

## Impact

- `app/gallery/` 目錄：整體搬移並刪除原路由
- `app/page.tsx`：首頁時段格連結由 `/gallery/{date}/{slot}` 改為 `/admin/gallery/{date}/{slot}`
- `middleware.ts`：確認 `/gallery` 舊路徑加入 redirect 規則（→ `/admin/login` 或 404）
- 元件：`GalleryBackground`、`GalleryHeading`、`PhotoSlideshow` 共用元件不需搬移，維持在 `app/components/`
