## Context

個人時段相簿 `/album/[slotGroup]` 目前無存取控制。現有系統已有 `/admin/**` 密碼保護（Middleware + HttpOnly cookie），本次以相同模式為 `/album/**` 建立來賓登入機制。

密碼不儲存於資料庫，以 HMAC-SHA256 從環境變數密鑰即時派生，保持無狀態。後台需能查詢任意組號密碼並下載完整帳密 PDF。

## Goals / Non-Goals

**Goals:**
- HMAC 派生密碼，無資料庫依賴
- `/album/**` Middleware 保護（排除 `/album/login`）
- 24 小時 HttpOnly cookie session
- 後台帳密查詢與 PDF 下載（2026/03/15–03/30，共 1,536 組）

**Non-Goals:**
- 不實作密碼修改或重設
- 不支援跨 slotGroup 切換（每個 session 綁定單一 slotGroup）
- 不實作登入失敗次數限制

## Decisions

### 1. 密碼派生方式

**選擇：** HMAC-SHA256（環境變數 `SLOT_PASSWORD_SECRET` 為密鑰，slotGroup 為訊息）。取摘要的前 10 位十六進位字元，轉為十進位後取後 8 位數字，不足補零。

```
raw   = HMAC-SHA256(SLOT_PASSWORD_SECRET, slotGroup)  // hex string
num   = BigInt("0x" + raw.slice(0, 10))
password = String(num % 100_000_000n).padStart(8, "0")
```

範例：`slotGroup="03150001"` → `"47291836"`

**替代方案考慮：** 隨機產生後存 Firestore（棄用，增加寫入成本與管理複雜度；無狀態方案更簡潔）。

### 2. Session 機制

**選擇：** 與 admin 一致，使用 HttpOnly cookie `album_session`，值為 `slotGroup`（明文），在 Middleware 以 HMAC 驗簽確保未被竄改。

Cookie 格式：`{slotGroup}:{HMAC(slotGroup).slice(0,16)}`
- Middleware 分割後重新計算 HMAC 比對，不符即清除並重導向
- `Max-Age: 86400`（24 小時）

**替代方案考慮：** JWT（棄用，依賴外部套件；自製 cookie 格式已足夠且與現有 admin 模式一致）。

### 3. Middleware 擴充

**選擇：** 現有 `middleware.ts` 的 `matcher` 新增 `/album/:path*`，在同一個函式中依路徑前綴分叉：`/admin/**` 走 admin 驗證，`/album/**` 走 album 驗證。

### 4. PDF 產生方式

**選擇：** 後台 API `GET /api/admin/slot-passwords/pdf` 在 Node.js runtime（非 edge）產生 PDF。使用 `jsPDF`（純 JS，無 native binary 依賴）逐行輸出表格，直接 stream 回瀏覽器。

表格欄位：`分組號碼 | 時段說明 | 密碼`
每頁約 50 行，自動分頁。

**替代方案考慮：** Puppeteer HTML→PDF（棄用，Vercel 無法執行 headless Chrome）。

### 5. 後台查詢頁

**選擇：** `/admin/slot-passwords` 頁面，Client Component，輸入分組號碼後呼叫 `GET /api/admin/slot-passwords?slotGroup=MMDDHHSS` 取得密碼顯示。分頁瀏覽全部帳密（每頁 48 筆，依日期排列）。

## Risks / Trade-offs

- **密鑰洩漏** → 所有密碼可被重新計算。需確保 `SLOT_PASSWORD_SECRET` 僅存 Vercel 環境變數。接受此風險，因密碼僅保護個人相簿，無高度敏感資料。
- **Edge Runtime 限制** → Web Crypto API（`crypto.subtle.sign`）在 Edge Runtime 可用，但 `jsPDF` PDF 產生需 Node.js runtime，需在 `/api/admin/slot-passwords/pdf` route 明確設定 `export const runtime = 'nodejs'`。

## Migration Plan

1. Vercel 新增環境變數 `SLOT_PASSWORD_SECRET`
2. 部署 Middleware 擴充（`/album/**` 保護）
3. 部署登入頁 `/album/login` 與 API routes
4. 部署後台帳密查詢頁與 PDF API

## Open Questions

- 無
