## 1. 修改首頁

- [x] 1.1 在 `app/page.tsx` 最頂端讀取 `process.env.NEXT_PUBLIC_GALLERY_ENABLED`，若值不為 `'true'` 則呼叫 `redirect('/album/login')` 並 return（置於 Firestore 查詢之前）
- [x] 1.2 確認 redirect 發生時不執行 `queryPhotoIndex()`

## 2. 環境變數設定

- [ ] 2.1 在 Cloudflare Pages 環境變數中確認是否需要新增 `NEXT_PUBLIC_GALLERY_ENABLED`（活動進行中設 `true`，活動結束移除或留空）
- [x] 2.2 更新 `config/version.json` patch 版號 +1
- [x] 2.3 更新 `README-AI.md`
