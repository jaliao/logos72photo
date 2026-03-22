## Context

個人相簿（`/album/[slotGroup]`）目前使用 `PhotoSlideshow`，單張照片為全螢幕黑底 overlay 體驗。管理後台 gallery 也使用同一元件，因此不能直接修改，需要建立獨立的 `AlbumPhotoViewer` 元件專供訪客相簿使用。

刪除功能需要後端 API，且需知道照片的 Firestore 文件 ID。現有 `getPhotosBySlotGroup()` 不回傳 docId，需擴充。

## Goals / Non-Goals

**Goals:**
- 建立 `AlbumPhotoViewer`（Client Component）：白色圓角卡片展開檢視，含下載、刪除、說明文字
- 擴充 `getPhotosBySlotGroup()` 回傳 docId
- 新增 `DELETE /api/album/photos` 刪除照片
- 訪客相簿頁改用新元件

**Non-Goals:**
- 不修改 `PhotoSlideshow`（管理後台不受影響）
- 不重建刪除後的封面
- 不刪除 R2 原圖（僅刪 Firestore，R2 孤立檔案影響有限）
- 不支援批次刪除

## Decisions

### 決策 1：AlbumPhotoViewer 使用「單頁展開」模式（非全螢幕 overlay）

點擊縮圖後，grid 隱藏，顯示單張照片展開卡片（`rounded-2xl bg-white/50`，無陰影），與列表白色卡片外觀一致。卡片內包含：
- 照片（`aspect-[3/4]` 全寬）
- 說明文字
- 下載 + 刪除按鈕（橫排，等寬，明顯）
- 左右切換箭頭 + 「← 返回列表」

**替代方案：** 保留 overlay 改成白底 → 仍是全螢幕蓋版，不符合「與列表相同」的設計要求，捨棄。

### 決策 2：下載不走 iOS Web Share API，改為直接 `<a download>`

移除 `navigator.share` 分支，統一使用 `fetch(r2Url) → Blob → <a download>`，行為一致且符合「取消分享」需求。

### 決策 3：刪除 API 以 r2_url 識別照片，後端查 docId

前端只傳 `r2Url`，後端用 `r2_url` 查 Firestore 取得 docId 後刪除，避免前端持有 docId（減少暴露面）。API 同時驗證照片的 `slot_group` 與 session 一致，防止越權刪除。

### 決策 4：刪除後前端 filter 本地 state，不重新查詢 Firestore

刪除成功後，`AlbumPhotoViewer` 的本地 photos state 移除該項目並返回列表，避免重新 fetch。

### 決策 5：`getPhotosBySlotGroup` 回傳 `PhotoDocWithId`（含 docId）

在 `lib/types.ts` 新增 `PhotoDocWithId = PhotoDoc & { docId: string }`；修改函式從 Firestore `document.name` 解析 docId 並回傳。

## Risks / Trade-offs

- **R2 孤立檔案**：刪除 Firestore 後 R2 原圖仍存在，但因查詢基於 Firestore，不會再出現在任何列表 → 可接受
- **刪除封面（covers/）**：封面使用 slotGroup 封面照片，刪除普通照片不影響封面，除非刪除的就是用來生成封面的照片 → 本次不處理，Non-goal

## Migration Plan

1. 更新 `lib/types.ts`：新增 `PhotoDocWithId`
2. 更新 `lib/firebase-rest.ts`：`getPhotosBySlotGroup` 回傳 `PhotoDocWithId[]`
3. 新增 `app/api/album/photos/route.ts`（DELETE）
4. 新增 `app/components/AlbumPhotoViewer.tsx`
5. 更新 `app/album/[slotGroup]/page.tsx`：改用 `AlbumPhotoViewer`

## Open Questions

- 無
