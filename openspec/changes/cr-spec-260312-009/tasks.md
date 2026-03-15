## 1. HMAC 密碼派生工具函式

- [x] 1.1 新增 `lib/slot-password.ts`，實作 `derivePassword(slotGroup: string): Promise<string>` — 使用 Web Crypto `HMAC-SHA256(SLOT_PASSWORD_SECRET, slotGroup)`，取摘要前 10 hex 字元轉 BigInt，模 100,000,000 後零填補 8 碼回傳
- [x] 1.2 同檔新增 `generateAllSlotGroups(startDate: string, endDate: string): string[]` — 列舉指定日期範圍（含）所有 MMDDHHSS 組號，每日 24h × 4 = 96 筆

## 2. 來賓登入 API

- [x] 2.1 新增 `app/api/album/login/route.ts`（edge runtime），`POST { slotGroup, password }` — 驗證格式、以 `derivePassword` 比對密碼，成功則設定 `album_session` cookie（`HttpOnly; Path=/album; Max-Age=86400`），值為 `{slotGroup}:{HMAC(slotGroup).slice(0,16)}`，回傳 `{ ok: true }`
- [x] 2.2 新增 `app/api/album/logout/route.ts`（edge runtime），`POST` — 清除 `album_session` cookie，回傳 `{ ok: true }`

## 3. Middleware 擴充

- [x] 3.1 修改 `middleware.ts`，`matcher` 新增 `/album/:path*`；登入頁 `/album/login` 直接放行
- [x] 3.2 `/album/**` 分支：讀取 `album_session` cookie，驗簽失敗則清除並重導向 `/album/login`；驗簽成功且 cookie 內 slotGroup 與路徑 `[slotGroup]` 不符時，重導向至 `/album/{cookieSlotGroup}`

## 4. 來賓登入頁

- [x] 4.1 新增 `app/album/login/page.tsx`（Client Component），表單含「分組號碼」與「密碼」欄位，送出呼叫 `POST /api/album/login`，成功後 `router.push(/album/${slotGroup})`，失敗顯示錯誤訊息
- [x] 4.2 登入頁使用 `GalleryBackground`，樣式與整體風格一致；不含返回連結

## 5. 後台帳密查詢頁

- [x] 5.1 新增 `app/admin/slot-passwords/page.tsx`（Client Component），含單筆查詢框（輸入 slotGroup → 呼叫 `GET /api/admin/slot-passwords?slotGroup=` 顯示密碼）
- [x] 5.2 同頁下方以分頁表格（每頁 48 筆）列出 2026/03/15–03/30 全部帳密，含「下載全部 PDF」按鈕

## 6. 後台帳密 API

- [x] 6.1 新增 `app/api/admin/slot-passwords/route.ts`（edge runtime），`GET ?slotGroup=` — 驗證 `admin_session`，呼叫 `derivePassword`，回傳 `{ slotGroup, password }`
- [x] 6.2 新增 `app/api/admin/slot-passwords/pdf/route.ts`（**nodejs runtime**），`GET` — 驗證 `admin_session`，以 `jsPDF` 產生三欄 PDF（分組號碼 | 時段說明 | 密碼），包含 1,536 筆，每頁 50 行，回傳 `application/pdf`
- [x] 6.3 執行 `npm install jspdf` 安裝相依套件

## 7. 版本更新

- [x] 7.1 `config/version.json` patch +1
