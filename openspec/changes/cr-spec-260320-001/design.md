## Context

目前 `app/gallery/` 路由樹為公開頁面，任何人不需登入即可存取。整個相簿瀏覽功能（日期 → 時段 → 1 小時子相簿 → 照片）實際上只有攝影師與管理員需要使用，對一般訪客開放無任何業務價值。

現行 middleware 已對 `/admin/**` 一律強制驗證 `admin_session` cookie；將 gallery 路由移入 `/admin/gallery/` 後，auth 保護自動生效，無需額外程式碼。

## Goals / Non-Goals

**Goals:**
- 將 `app/gallery/` 整體移植至 `app/admin/gallery/`，讓相簿受 admin session 保護
- 舊路徑 `/gallery/**` 加 redirect，避免留下公開死連結
- 首頁時段格連結由 `/gallery/{date}/{slot}` 改為 `/admin/gallery/{date}/{slot}`

**Non-Goals:**
- 不修改 Gallery 頁面的 UI 或資料查詢邏輯
- 不調整 `/album/` 訪客相簿流程
- 不新增 Gallery 功能（搜尋、篩選、下載等）

## Decisions

### 決策 1：以 Next.js route `redirect()` 處理舊路徑
- `/gallery/**` 舊路徑不刪除路由檔，改以 `app/gallery/[...slug]/page.tsx` catch-all + `redirect('/admin/login')` 實作，確保 SEO 與書籤連結安全降落
- 替代方案：middleware matcher 加規則 → 可行但 matcher 已有兩段邏輯，為避免 pattern 膨脹，優先以 page-level redirect 處理

### 決策 2：元件不搬移
- `GalleryBackground`、`GalleryHeading`、`PhotoSlideshow` 維持在 `app/components/`，繼續以相對 import 共用
- 替代方案：搬到 `app/admin/components/` → 無必要，這些元件無 admin-specific 邏輯

### 決策 3：`NEXT_PUBLIC_GALLERY_ENABLED` 開關維持原意
- 開關控制首頁是否顯示 Gallery 入口；移至後台後，首頁時段格連結改指向 `/admin/gallery/**`
- 若 `GALLERY_ENABLED=false`，首頁仍 redirect 至 `/album/login`（訪客流程不受影響）

## Risks / Trade-offs

- **書籤失效**：管理員若有舊的 `/gallery/**` 書籤，點擊後會落在 `/admin/login` 登入頁，登入後需重新導覽 → 可接受，admin 本來就須登入
- **route 數量增加**：多一個 catch-all `/gallery/[...slug]/page.tsx` redirect 頁面 → 影響極小

## Migration Plan

1. 在 `app/admin/gallery/` 建立對應路由（複製現有 gallery pages）
2. 修改首頁 `app/page.tsx` 的時段格連結
3. 新增 `app/gallery/[...slug]/page.tsx`，內容僅含 `redirect('/admin/login')`
4. 確認 `middleware.ts` 的 matcher 不需變動（`/admin/:path*` 已涵蓋新路由）
5. 移除原 `app/gallery/[date]/` 子路由樹

## Open Questions

- 無
