## Context

`PhotoSlideshow.tsx` 是後台相簿唯一使用的幻燈片元件（僅 `app/admin/gallery/[date]/[slot]/[album]/page.tsx` import）。
目前工具列有兩個按鈕：「複製分享連結」和「下載照片」。下載邏輯會偵測 iOS Web Share API，若支援則呼叫 `navigator.share()`（彈出系統分享視窗），否則才以 `<a download>` 下載原圖。

管理員在電腦上操作後台，期待按下載就能直接存檔，不需要分享對話框。分享連結功能對後台操作也無實際用途。

## Goals / Non-Goals

**Goals:**
- 移除分享連結按鈕與相關狀態（`handleShare`, `showToast`, toast UI）
- 移除 `?photo=` query param 自動開啟幻燈片的 `useEffect`（此功能依賴分享連結）
- 下載統一改為直接下載 `r2Url` 原圖，所有平台行為一致
- 移除 iOS Web Share API 分支（`iosCapable` 判斷、`slideUrl` 用於分享的邏輯）

**Non-Goals:**
- 不修改縮圖 grid、幻燈片導覽、鍵盤快捷鍵等其他功能
- 不修改 `SlideshowPhoto` 介面的 `slideUrl` 欄位（仍用於幻燈片主畫面顯示與模糊背景）
- 不影響 guest 端的 `AlbumPhotoViewer.tsx`

## Decisions

### 1. 直接修改 PhotoSlideshow.tsx，不拆分 admin/guest 版本

此元件目前只有後台使用，不需要透過 props 或條件渲染保留舊行為。直接刪除分享相關程式碼更乾淨。

### 2. 下載改用 blob fetch + `<a download>`，保持與現有非 iOS 路徑一致

原非 iOS 路徑已是此做法（fetch `r2Url` → blob → `<a download>`），移除 iOS 分支後邏輯保持不變，減少改動範圍。

**替代方案：** 改用 `<a href={r2Url} download>` 直連 R2——但 R2 可能未設定 CORS/download header，blob 方式更可靠。

### 3. `isDownloading` 狀態保留

下載原圖需要 fetch，保留 loading 狀態可防止重複點擊。

## Risks / Trade-offs

- **分享連結移除後書籤失效** → `?photo=` 參數本來就是由分享連結產生，移除後不再有人會用此 URL，影響極小

## Migration Plan

1. 修改 `PhotoSlideshow.tsx`
2. 部署後確認後台幻燈片下載正常，分享按鈕消失
3. 無 rollback 需求（純 UI/行為調整，無資料異動）

## Open Questions

- 無
