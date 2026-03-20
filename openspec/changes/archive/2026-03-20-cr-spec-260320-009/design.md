## Context

「此時段尚無照片」空白狀態目前為純文字 `<p className="text-center text-zinc-400">`，出現在兩處：
1. `AlbumPhotoViewer` grid 模式（照片列表為空時）
2. `app/album/[slotGroup]/page.tsx`（photos.length === 0 時）

本 change 為純前端樣式調整，不涉及 API 或資料邏輯。

## Goals / Non-Goals

**Goals:**
- 空白提示改為白底半透明（`bg-white/70`）圓角容器，文字 `font-semibold text-black`

**Non-Goals:**
- 不修改 admin 頁面（`app/admin/gallery/.../page.tsx`）的同類文字
- 不新增 icon 或其他視覺元素

## Decisions

**以 `<div>` 容器取代裸 `<p>`**
- 加上 `rounded-lg bg-white/70 px-4 py-3` 容器，內含 `font-semibold text-black text-center` 文字
- 與其他提示區塊（行銷說明、iOS 說明）視覺語言一致

## Risks / Trade-offs

- 無，純樣式修改，不影響功能
