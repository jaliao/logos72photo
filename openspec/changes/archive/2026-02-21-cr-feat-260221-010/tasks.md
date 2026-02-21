## 1. 更新 `app/layout.tsx`

- [x] 1.1 `metadata.title` 改為 `72 小時不間斷讀經接力自動拍照系統`
- [x] 1.2 `metadata.description` 改為繁體中文說明
- [x] 1.3 `metadata.icons` 設為 `{ icon: '/favicon.png' }`
- [x] 1.4 `<html lang="en">` 改為 `lang="zh-TW"`
- [x] 1.5 加入標準檔案 header 註解

## 2. 部署與驗證

- [x] 2.1 `npm run build` 確認無錯誤
- [x] 2.2 `git push origin main` 觸發 Cloudflare Pages 重新部署
- [x] 2.3 正式環境確認：瀏覽器分頁顯示正確標題與 favicon
