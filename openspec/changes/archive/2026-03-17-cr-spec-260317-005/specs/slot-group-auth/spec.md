## MODIFIED Requirements

### Requirement: 來賓時段相簿登入頁
系統 SHALL 提供 `/album/login` 頁面，讓來賓輸入分組號碼（帳號）與 8 碼數字密碼完成身分驗證，登入成功後導向 `/album/[slotGroup]`。密碼欄位 SHALL 預設以明文顯示（`type="text"`），並提供切換按鈕讓來賓隱藏輸入內容。

#### Scenario: 輸入正確帳密後登入成功
- **WHEN** 來賓在 `/album/login` 輸入有效 `slotGroup` 與對應密碼並送出
- **THEN** 系統 SHALL 設定 `album_session` HttpOnly cookie（`Max-Age: 86400`），並重導向至 `/album/{slotGroup}`

#### Scenario: 輸入錯誤密碼時顯示錯誤
- **WHEN** 來賓輸入的密碼與 HMAC 派生密碼不符
- **THEN** 系統 SHALL 回傳錯誤提示「帳號或密碼錯誤」，不設定 cookie，不重導向

#### Scenario: 輸入無效格式的分組號碼時顯示錯誤
- **WHEN** 來賓輸入的分組號碼不符合 8 位數字格式
- **THEN** 系統 SHALL 顯示「帳號格式錯誤」提示，不執行密碼驗證

#### Scenario: 密碼預設明文顯示
- **WHEN** 來賓進入 `/album/login`
- **THEN** 密碼欄位 SHALL 預設以 `type="text"` 顯示輸入內容

#### Scenario: 點擊切換按鈕隱藏密碼
- **WHEN** 來賓點擊密碼欄位旁的切換按鈕
- **THEN** 密碼欄位 SHALL 切換為 `type="password"`（隱藏），再次點擊恢復明文顯示
