## ADDED Requirements

### Requirement: 封面刪除 API
系統 SHALL 提供 `DELETE /api/album/cover` 端點，不需請求體，從 `album_session` cookie 解碼 `slotGroup` 後刪除 R2 `covers/{slotGroup}.jpg`。

#### Scenario: 成功刪除封面
- **WHEN** 已驗證的訪客發送 `DELETE /api/album/cover`
- **THEN** 系統 SHALL 刪除 R2 `covers/{slotGroup}.jpg`，回傳 `200 OK`

#### Scenario: 無有效 album_session
- **WHEN** 請求未帶有效 `album_session` cookie
- **THEN** 系統 SHALL 回傳 `401 Unauthorized`，不執行任何刪除

#### Scenario: 封面不存在時仍回傳成功
- **WHEN** R2 中 `covers/{slotGroup}.jpg` 不存在
- **THEN** 系統 SHALL 回傳 `200 OK`（DELETE 冪等，不視為錯誤）
