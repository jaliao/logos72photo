## ADDED Requirements

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

### Requirement: HMAC 密碼派生
系統 SHALL 以 `SLOT_PASSWORD_SECRET` 環境變數為密鑰，`slotGroup`（8 碼字串）為訊息，使用 HMAC-SHA256 派生 8 位數字密碼。派生邏輯 SHALL 為：取摘要前 10 位十六進位字元轉 BigInt，模除 100,000,000 後以 8 碼零填補。

#### Scenario: 相同 slotGroup 每次派生結果一致
- **WHEN** 以相同 `SLOT_PASSWORD_SECRET` 和 `slotGroup` 呼叫派生函式兩次
- **THEN** 兩次回傳值 SHALL 完全相同（確定性）

#### Scenario: 不同 slotGroup 派生出不同密碼
- **WHEN** 以 `slotGroup = "03150001"` 和 `slotGroup = "03150002"` 分別派生
- **THEN** 兩個密碼 SHALL 不同

### Requirement: album_session cookie 格式與驗證
`album_session` cookie 值 SHALL 為 `{slotGroup}:{HMAC(slotGroup).slice(0,16)}`，Middleware SHALL 分割後重新計算 HMAC 比對；不符或格式錯誤時清除 cookie 並重導向至 `/album/login`。

#### Scenario: 有效 cookie 通過 Middleware
- **WHEN** 來賓持有有效 `album_session` cookie 存取 `/album/03150001`
- **THEN** Middleware SHALL 放行請求，不重導向

#### Scenario: 竄改 cookie 被拒絕
- **WHEN** 來賓持有格式正確但 HMAC 比對失敗的 `album_session` cookie
- **THEN** Middleware SHALL 清除 cookie 並重導向至 `/album/login`

#### Scenario: 無 cookie 時重導向登入頁
- **WHEN** 來賓在無 `album_session` cookie 的情況下存取任意 `/album/**`（排除 `/album/login`）
- **THEN** Middleware SHALL 重導向至 `/album/login`

### Requirement: 登入後只能存取自己的 slotGroup 相簿
來賓登入後，`album_session` 綁定的 slotGroup SHALL 與存取的 `/album/[slotGroup]` 路徑一致；不一致時 SHALL 重導向至自己的相簿。

#### Scenario: 存取他人相簿時重導向
- **WHEN** 來賓 session 的 slotGroup 為 `"03150001"`，嘗試存取 `/album/03150002`
- **THEN** Middleware SHALL 重導向至 `/album/03150001`

### Requirement: 登入頁輸入欄位不觸發手機自動縮放
`/album/login` 頁面所有 `<input>` 欄位的 `font-size` SHALL 不小於 16px，確保 iOS Safari 在使用者點擊輸入欄位時不觸發頁面自動放大（auto-zoom），手機軟鍵盤出現時頁面寬度 SHALL 維持在視窗範圍內，不產生橫向捲軸。

#### Scenario: 點擊帳號欄位時頁面不放大
- **WHEN** 使用者在 iOS Safari 手機上點擊 `/album/login` 的帳號輸入欄位
- **THEN** 頁面 SHALL 維持原縮放比例，不自動放大，不出現橫向捲軸

#### Scenario: 點擊密碼欄位時頁面不放大
- **WHEN** 使用者在 iOS Safari 手機上點擊 `/album/login` 的密碼輸入欄位
- **THEN** 頁面 SHALL 維持原縮放比例，不自動放大，不出現橫向捲軸

#### Scenario: 軟鍵盤收起後頁面恢復正常
- **WHEN** 使用者完成輸入並關閉手機軟鍵盤
- **THEN** 頁面 SHALL 恢復至原始縮放比例，橫向捲軸 SHALL 不存在

### Requirement: 登入視窗不透明白色背景
`/album/login` 登入卡片容器 SHALL 使用完全不透明白色背景（`bg-white`），不使用半透明樣式（如 `bg-white/50`），確保輸入欄位文字在任何背景圖下均清晰可讀。

#### Scenario: 登入卡片背景不透明
- **WHEN** 使用者進入 `/album/login`
- **THEN** 登入卡片 SHALL 以不透明白色背景顯示，不透出後方背景圖
