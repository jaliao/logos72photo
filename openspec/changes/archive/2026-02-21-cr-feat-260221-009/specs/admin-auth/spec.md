## ADDED Requirements

### Requirement: /admin 路由密碼保護
系統 SHALL 對所有 `/admin/**` 路由進行存取控制，未持有有效 session 的請求 MUST 重導向至登入頁面。

#### Scenario: 未登入使用者嘗試存取 /admin
- **WHEN** 使用者在未登入狀態下導覽至任何 `/admin/**` 路由
- **THEN** 系統重導向至 `/admin/login`

#### Scenario: 已登入使用者可正常存取 /admin
- **WHEN** 使用者持有有效的 `admin_session` cookie
- **THEN** 系統正常顯示所要求的 /admin 頁面，不重導向

#### Scenario: 無效 cookie 被拒絕
- **WHEN** `admin_session` cookie 內容不正確或已竄改
- **THEN** 系統重導向至 `/admin/login`，並清除無效 cookie

---

### Requirement: 管理員密碼登入
系統 SHALL 提供 `/admin/login` 頁面，讓管理員輸入密碼完成身分驗證。

#### Scenario: 輸入正確密碼後登入成功
- **WHEN** 管理員在登入頁輸入正確密碼並送出
- **THEN** 系統設定 HttpOnly `admin_session` cookie，並重導向至 `/admin/monitoring`

#### Scenario: 輸入錯誤密碼時顯示錯誤訊息
- **WHEN** 管理員輸入錯誤密碼並送出
- **THEN** 系統顯示「密碼錯誤」提示，不設定 cookie，不重導向

#### Scenario: 密碼來源為環境變數
- **GIVEN** 伺服器設定了 `ADMIN_PASSWORD` 環境變數
- **WHEN** 管理員輸入的密碼與 `ADMIN_PASSWORD` 相符
- **THEN** 驗證成功

---

### Requirement: 管理員登出
系統 SHALL 提供登出機制，清除 session cookie 並重導向至登入頁面。

#### Scenario: 管理員點擊登出
- **WHEN** 管理員在任何 /admin 頁面執行登出操作
- **THEN** 系統清除 `admin_session` cookie 並重導向至 `/admin/login`
