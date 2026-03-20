## 1. Cloud Function：縮圖預熱

- [x] 1.1 `generateCover.ts`：新增 `warmThumbnails(r2Url)` 函式，以 `Promise.all` fire-and-forget 呼叫 Image Service 640w/80q 與 1280w/85q
- [x] 1.2 `r2_key` 推導：`r2Url.replace(process.env.R2_PUBLIC_URL + '/', '')`
- [x] 1.3 在 `uploadCover` 成功後呼叫 `warmThumbnails(r2Url).catch(...)` 不拋出例外
- [x] 1.4 Cloud Function 環境變數加入 `IMAGE_SERVICE_URL`（`.env` 或 Firebase secrets）

## 2. Cloud Function：封面 flag 寫入 Firestore

- [x] 2.1 `generateCover.ts`：新增 `setCoverFlag(slotGroup)` 函式，以 admin SDK `setDoc merge` 寫入 `slotGroups/{slotGroup}` `{ hasCover: true }`
- [x] 2.2 在 `uploadCover` 成功後呼叫 `setCoverFlag(slotGroup).catch(...)` 不拋出例外
- [x] 2.3 預熱與 flag 寫入可平行執行（`Promise.all([warmThumbnails, setCoverFlag]).catch(...)`）

## 3. Next.js：讀取封面 flag

- [x] 3.1 `lib/firebase-rest.ts`：新增 `getSlotGroupDoc(slotGroup)` 函式，以 Firestore REST GET 讀取 `slotGroups/{slotGroup}`，回傳 `{ hasCover: boolean }`；文件不存在（404）回傳 `{ hasCover: false }`
- [x] 3.2 `app/album/[slotGroup]/page.tsx`：以 `getSlotGroupDoc(slotGroup)` 取代 `fetch(coverUrl, { method: 'HEAD' })`，讀取 `hasCover` 決定是否傳入 `coverUrl`

## 4. Next.js：Grid 首圖 priority

- [x] 4.1 `AlbumPhotoViewer.tsx`：封面縮圖（index 0）加 `priority` prop
- [x] 4.2 一般照片第一張（`coverOffset === 0 && i === 0`，或 `coverOffset === 1 && i === 0`）加 `priority` prop

## 5. 版本與文件

- [x] 5.1 更新 `config/version.json` patch +1
- [x] 5.2 更新 `README-AI.md`
