## 1. 資料層：新增 firstPhotos 欄位

- [x] 1.1 在 `lib/firebase-rest.ts` 的 `PhotoIndexDoc` interface 新增 `firstPhotos?: Record<string, Record<string, string>>` 欄位
- [x] 1.2 更新 `getPhotoIndexByDate()` 回傳值，新增 `firstPhotos: Record<string, Record<string, string>>` 並從 `parsed.firstPhotos` 取值（不存在時回傳 `{}`）
- [x] 1.3 在 `updatePhotoIndex()` 中加入 first-write-wins 邏輯：若 `existing.firstPhotos?.[slotKey]?.[hourKey]` 尚未設定，則寫入目前照片的 `r2_url`
- [x] 1.4 確認 `updatePhotoIndex()` 的 PATCH body 包含 `firstPhotos` 欄位（加入 `updateMask.fieldPaths`）

## 2. Next.js 設定：允許 R2 圖片網域

- [x] 2.1 在 `next.config.ts` 的 `images.remotePatterns` 新增 R2 公開網域（`process.env.R2_PUBLIC_URL` 對應 hostname），確保 `<Image>` 元件可載入封面

## 3. UI：更新小時格渲染邏輯

- [x] 3.1 在 `app/gallery/[date]/[slot]/page.tsx` 中，從 `getPhotoIndexByDate()` 取出 `firstPhotos`，並提取對應 `slot8h` 的子物件
- [x] 3.2 將小時格渲染從單一 `<Link>` 改為條件渲染：有封面 URL 時渲染 `<Link>`（含 `<Image>` + 遮罩），無封面時渲染 `<div>`（灰色，不可點擊）
- [x] 3.3 有照片格子：在相對定位容器內放置 `<Image fill objectFit="cover">`，疊加 `<div className="absolute inset-0 bg-black/70">`，時間文字以 `<span className="relative z-10 text-white">` 顯示
- [x] 3.4 無照片格子：使用 `bg-zinc-500 cursor-default` 樣式，顯示白色時間文字，確保不含 `href`
- [x] 3.5 移除所有小時格的「N 張」照片張數顯示（刪除 `<span className="mt-1 text-xs text-zinc-300">`）

## 4. 版本與文件更新

- [x] 4.1 將 `config/version.json` 的 `patch` 版號 +1
- [x] 4.2 依照 `.ai-rules.md` 重新產生 `README-AI.md`，反映本次小時格視覺改版
