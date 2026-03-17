## Why

個人時段相簿（`/album/[slotGroup]`）目前無存取限制，任何人知道分組號碼即可瀏覽。需要帳密保護，讓來賓憑時段號碼與專屬密碼登入，確保只有被分配到該時段的人才能查看照片。同時攝影師後台需能查詢並下載所有帳密資料供現場發放。

## What Changes

- 新增來賓登入頁面 `/album/login`，輸入 8 碼分組號碼（帳號）與 8 碼數字密碼
- 密碼以 HMAC-SHA256 派生：`password = HMAC(secret, slotGroup).slice(→ 8 位數字)`，無需資料庫儲存，密鑰存環境變數 `SLOT_PASSWORD_SECRET`
- 密碼涵蓋所有 slotGroup：2026/03/15 00:00 ～ 2026/03/30 23:59（1,536 組）
- 登入成功後設定 `album_session` HttpOnly cookie（內含 slotGroup，有效期 24 小時），導向 `/album/[slotGroup]`
- `/album/**` 路由受 Middleware 保護，無效 session 重導向 `/album/login`
- 後台新增帳密查詢頁：輸入分組號碼即顯示對應密碼
- 後台新增下載所有帳密 PDF 功能（列印版，含 slotGroup / 時段說明 / 密碼三欄）

## Capabilities

### New Capabilities
- `slot-group-auth`: 來賓時段相簿帳密登入機制，含登入頁、session 管理、Middleware 保護
- `admin-slot-passwords`: 後台帳密查詢與 PDF 下載

### Modified Capabilities
- `slot-group-album`: `/album/**` 路由加入 session 保護

## Impact

- **環境變數**：新增 `SLOT_PASSWORD_SECRET`（32 字元隨機字串，Vercel 設定）
- **Middleware**：擴充現有 middleware 保護 `/album/**`（排除 `/album/login`）
- **路由**：新增 `/album/login`、`/api/album/login`（POST）、`/api/album/logout`（POST）
- **後台**：新增 `/admin/slot-passwords` 查詢頁與 PDF 下載 API
- **非目標**：不實作密碼修改；不實作跨 slotGroup 切換；不支援管理員以來賓身份登入
