## 1. 修改個人相簿頁面

- [x] 1.1 在 `app/album/[slotGroup]/page.tsx` 中，以 `Promise.all` 並行執行 Firestore 照片查詢與封面 HEAD 請求
- [x] 1.2 封面 URL 為 `{R2_PUBLIC_URL}/covers/{slotGroup}.jpg`（從 `process.env.R2_PUBLIC_URL` 取得）
- [x] 1.3 若 HEAD 請求回應 200，將封面作為第一個 `SlideshowPhoto` 插入 `slideshowPhotos` 陣列首位（r2Url/thumbUrl/slideUrl 皆指向封面 URL，alt 為「封面」，filename 為 `COVER.jpg`）
- [x] 1.4 若 HEAD 請求失敗或回應非 200，靜默跳過，不影響照片列表

## 2. 版號與文件

- [x] 2.1 更新 `config/version.json` patch 版號 +1
- [x] 2.2 更新 `README-AI.md`
