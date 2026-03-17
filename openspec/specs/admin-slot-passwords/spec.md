## ADDED Requirements

### Requirement: 後台帳密查詢頁
系統 SHALL 提供 `/admin/slot-passwords` 頁面，讓管理員輸入分組號碼後即時顯示對應密碼，並支援分頁瀏覽 2026/03/15–03/30 全部 1,536 組帳密（每頁 48 筆，依日期時間升冪排列）。

#### Scenario: 輸入有效分組號碼顯示密碼
- **WHEN** 管理員在查詢框輸入有效 8 碼分組號碼（如 `03150001`）並查詢
- **THEN** 頁面 SHALL 顯示該組號對應的 8 碼數字密碼

#### Scenario: 輸入無效格式不執行查詢
- **WHEN** 管理員輸入非 8 位數字字串
- **THEN** 頁面 SHALL 顯示格式錯誤提示，不呼叫後端 API

#### Scenario: 分頁瀏覽全部帳密
- **WHEN** 管理員進入 `/admin/slot-passwords`
- **THEN** 頁面 SHALL 顯示第一頁 48 筆帳密（分組號碼 + 時段說明 + 密碼），並提供翻頁控制

### Requirement: 帳密查詢 API
系統 SHALL 提供 `GET /api/admin/slot-passwords?slotGroup=MMDDHHSS` API，驗證管理員 session 後回傳指定 slotGroup 的密碼。

#### Scenario: 有效請求回傳密碼
- **WHEN** 管理員以有效 `admin_session` 呼叫 `GET /api/admin/slot-passwords?slotGroup=03150001`
- **THEN** API SHALL 回傳 `{ "slotGroup": "03150001", "password": "XXXXXXXX" }`

#### Scenario: 未授權請求回傳 401
- **WHEN** 請求不含有效 `admin_session` cookie
- **THEN** API SHALL 回傳 `401 Unauthorized`

### Requirement: 帳密 PDF 下載
系統 SHALL 提供 `GET /api/admin/slot-passwords/pdf` API，產生包含 2026/03/15–03/30 全部 1,536 組帳密的 PDF 並 stream 回瀏覽器，供管理員列印發放。PDF 每頁 50 行，三欄：分組號碼、時段說明（MM/DD HH:MM–HH:MM）、密碼。

#### Scenario: 下載 PDF 回傳正確 Content-Type
- **WHEN** 管理員以有效 `admin_session` 呼叫 `GET /api/admin/slot-passwords/pdf`
- **THEN** API SHALL 回傳 `Content-Type: application/pdf`，瀏覽器觸發下載

#### Scenario: PDF 未授權請求回傳 401
- **WHEN** 請求不含有效 `admin_session` cookie
- **THEN** API SHALL 回傳 `401 Unauthorized`

#### Scenario: PDF 包含全部 1,536 筆記錄
- **WHEN** 管理員下載 PDF
- **THEN** PDF SHALL 包含 2026/03/15 00:00 ～ 2026/03/30 23:45 的所有 slotGroup 對應密碼，依日期時間升冪排列
