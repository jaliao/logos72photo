## 1. 建立 lib/image.ts

- [x] 1.1 新增 `lib/image.ts`，匯出 `toThumbUrl(r2Url, width, quality)`、`toThumb640(r2Url)`、`toThumb1280(r2Url)`

## 2. 更新 PhotoSlideshow 元件

- [x] 2.1 在 `SlideshowPhoto` interface 新增 `slideUrl: string` 欄位
- [x] 2.2 幻燈片主畫面（`<img src=...>`）改用 `photo.slideUrl` 取代 `photo.thumbUrl`
- [x] 2.3 `handleDownload` 中 iOS Web Share API 分支改為 `fetch(current.slideUrl)`，桌機 / Android 分支保持 `fetch(current.r2Url)`

## 3. 更新 app/gallery/[date]/[slot]/[album]/page.tsx

- [x] 3.1 移除檔案內的 `toThumbUrl` 函式定義，改 import `toThumb640`、`toThumb1280` 自 `lib/image`
- [x] 3.2 `thumbUrl` 改用 `toThumb640(photo.r2_url)`（原為 1280）
- [x] 3.3 新增 `slideUrl: toThumb1280(photo.r2_url)` 傳入 `SlideshowPhoto`

## 4. 更新 app/admin/monitoring/page.tsx

- [x] 4.1 移除檔案內的 `toThumbUrl` 函式定義，改 import `toThumb640` 自 `lib/image`
- [x] 4.2 監控縮圖呼叫改為 `toThumb640(device.last_photo_url)`

## 5. 版本與文件更新

- [x] 5.1 將 `config/version.json` 的 `patch` 版號 +1
- [x] 5.2 依照 `.ai-rules.md` 重新產生 `README-AI.md`，反映圖片 URL 集中管理改版
