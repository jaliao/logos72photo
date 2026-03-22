## 1. 全域 CSS 保護

- [x] 1.1 在 `app/globals.css` 加入 `input, select, textarea { font-size: max(16px, 1em); }`，防止全站輸入欄位觸發 iOS auto-zoom

## 2. 來賓登入頁修正（/album/login）

- [x] 2.1 將 `app/album/login/page.tsx` 帳號 `<input>` 的 `text-sm` 改為 `text-base`
- [x] 2.2 將 `app/album/login/page.tsx` 密碼 `<input>` 的 `text-sm` 改為 `text-base`

## 3. 管理員登入頁修正（/admin/login）

- [x] 3.1 將 `app/admin/login/page.tsx` 密碼 `<input>` 的 `text-sm` 改為 `text-base`

## 4. 版本與文件更新

- [x] 4.1 將 `config/version.json` 的 `patch` 版號 +1
- [x] 4.2 依 `.ai-rules.md` 重新產生 `README-AI.md`
