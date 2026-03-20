## 1. 型別與資料層擴充

- [x] 1.1 在 `lib/types.ts` 新增 `PhotoDocWithId = PhotoDoc & { docId: string }`
- [x] 1.2 更新 `lib/firebase-rest.ts` 的 `getPhotosBySlotGroup()`：從 Firestore `document.name` 解析 docId，回傳 `PhotoDocWithId[]`

## 2. 刪除 API

- [x] 2.1 新增 `app/api/album/photos/route.ts`，實作 `DELETE` handler
- [x] 2.2 驗證 `album_session` cookie（使用 `verifyAlbumSession()`），未授權回傳 401
- [x] 2.3 以 `r2_url` 查詢 Firestore `photos` 集合取得文件，不存在回傳 404
- [x] 2.4 驗證文件 `slot_group` 與 session 的 `slotGroup` 一致，不符回傳 403
- [x] 2.5 執行 Firestore 文件刪除，成功回傳 200

## 3. AlbumPhotoViewer 元件

- [x] 3.1 新增 `app/components/AlbumPhotoViewer.tsx`（`"use client"`）
- [x] 3.2 實作 grid 模式：接受 `photos: PhotoDocWithId[]`，顯示縮圖網格（單欄/雙欄 RWD）
- [x] 3.3 實作展開模式：點擊縮圖切換至白色圓角卡片（`rounded-2xl bg-white/50`，無陰影），照片 `aspect-[3/4]` 全寬
- [x] 3.4 展開模式加入說明文字「本照片可能用於活動行銷，如不同意請點刪除」
- [x] 3.5 實作下載按鈕：`fetch(r2Url) → Blob → <a download>`，不使用 Web Share API
- [x] 3.6 實作刪除按鈕：呼叫 `DELETE /api/album/photos`，成功後從本地 state 移除並返回列表
- [x] 3.7 實作左右切換箭頭與「← 返回列表」按鈕

## 4. 相簿頁整合

- [x] 4.1 更新 `app/album/[slotGroup]/page.tsx`：改用 `AlbumPhotoViewer` 取代 `PhotoSlideshow`
- [x] 4.2 確認 `PhotoSlideshow` 元件本身未被修改（管理後台不受影響）

## 5. 版本與文件

- [x] 5.1 更新 `config/version.json` patch +1
- [x] 5.2 更新 `README-AI.md`
