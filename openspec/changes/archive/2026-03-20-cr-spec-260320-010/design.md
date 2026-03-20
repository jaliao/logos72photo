## Context

Image Service Worker (`logos72photo-image.blockcode.workers.dev`) 已部署，提供 L1（Cloudflare Cache API）＋ L2（R2 `thumbnails/`）兩層快取。目前縮圖為按需產生：首次請求觸發 Photon WASM resize，寫入 L1 + L2 後後續才快。本 change 跨越三個模組：Cloud Function（預熱）、Firestore（封面 flag）、Next.js 前端（priority）。

## Goals / Non-Goals

**Goals:**
- Cloud Function `generateCover` 封面上傳成功後，立即呼叫 Image Service 預熱 640w/80q 與 1280w/85q，強制 L2 寫入
- 封面合成成功後寫入 Firestore `slotGroups/{slotGroup}` `{ hasCover: true, updatedAt: FieldValue.serverTimestamp() }`
- `app/album/[slotGroup]/page.tsx` 改以讀取 Firestore `slotGroups/{slotGroup}.hasCover` 判斷封面，移除 `fetch(HEAD)`
- `AlbumPhotoViewer` grid 模式第一張圖加 `priority`

**Non-Goals:**
- 不修改 Image Service Worker 程式碼
- 不預熱封面圖縮圖（covers/ 已是小圖，非瓶頸）
- 不修改 admin 頁面

## Decisions

**預熱方式：fetch GET 呼叫 Image Service，忽略回應**
- 直接 `fetch(imageServiceUrl/resizing/640/80/{r2_key})` 觸發 L2 寫入
- 不需等待回應（fire-and-forget）；若失敗不影響主流程
- 替代方案：寫入 R2 `thumbnails/` 直接用 sharp → 需額外依賴，且繞過 Cache API L1

**封面 flag collection：`slotGroups/{slotGroup}`**
- 輕量文件，只存 `hasCover: boolean`，未來可擴充時段 metadata
- 替代方案：在 `photos` collection 加欄位 → 語意不符，需額外 query

**`getSlotGroupDoc()` 讀取方式：firebase-rest GET 單一文件**
- 使用 Firestore REST `GET /documents/slotGroups/{slotGroup}`
- 文件不存在回 404 → 視為 `hasCover: false`

**`r2_key` 推導方式**
- `generateCover` 中的 `r2Url` 格式為 `{R2_PUBLIC_URL}/{date}/{filename}`
- key = `r2Url.replace(R2_PUBLIC_URL + '/', '')`
- 預熱 URL = `{IMAGE_SERVICE_URL}/resizing/{width}/{quality}/{r2_key}`

## Risks / Trade-offs

- [預熱 fetch 失敗] → fire-and-forget，不影響封面合成主流程；縮圖 cold miss 仍可降級
- [slotGroups 文件不存在（舊時段）] → `hasCover` 視為 false，頁面不顯示封面，行為與現有相同
- [Cloud Function 環境變數 IMAGE_SERVICE_URL 需新增] → 部署時需設定

## Migration Plan

1. 部署更新後的 Cloud Function（帶入 `IMAGE_SERVICE_URL` secret）
2. 舊時段封面已存在但 Firestore 無 flag → 不影響，HEAD 邏輯已移除；舊時段訪客看不到封面（可接受，或事後補寫 flag）
3. Next.js Cloudflare Pages 重新部署（`hasCover` 邏輯）

## Open Questions

- 舊時段封面補寫 flag：是否需要 backfill 腳本？（建議事後按需執行，本 change 不包含）
