## 1. R2 工具函式

- [x] 1.1 在 `lib/r2.ts` 新增 `deleteR2Object(key: string): Promise<void>`

## 2. 封面刪除 API

- [x] 2.1 新增 `app/api/album/cover/route.ts`，實作 `DELETE` handler
- [x] 2.2 驗證 `album_session` cookie（`verifyAlbumSession()`），未授權回傳 401
- [x] 2.3 從 session 解碼 slotGroup，組出 R2 key `covers/{slotGroup}.jpg`
- [x] 2.4 呼叫 `deleteR2Object()`，成功回傳 200

## 3. AlbumPhotoViewer 封面刪除

- [x] 3.1 將 `coverUrl` prop 改為元件內部 state（`useState<string | undefined>`）
- [x] 3.2 封面展開模式加入刪除按鈕，呼叫 `DELETE /api/album/cover`
- [x] 3.3 刪除成功後清除 cover state，返回 grid 模式
- [x] 3.4 刪除失敗顯示錯誤提示

## 4. 版本與文件

- [x] 4.1 更新 `config/version.json` patch +1
- [x] 4.2 更新 `README-AI.md`
