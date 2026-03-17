## MODIFIED Requirements

### Requirement: 個人時段相簿頁面
系統 SHALL 提供 `/album/[slotGroup]` 獨立頁面，依 8 碼分組編號（MMDDHHSS）從 Firestore `photos` 集合查詢並展示照片，頁面顯示分組編號作為識別資訊。存取 `/album/**` 路由 SHALL 需持有有效 `album_session` cookie；未登入來賓 SHALL 被重導向至 `/album/login`。

#### Scenario: 有效 slotGroup 顯示照片列表
- **WHEN** 已登入來賓進入 `/album/03130101`，且 Firestore 有 `slotGroup == "03130101"` 的照片
- **THEN** 頁面 SHALL 依 `createdAt` 升冪顯示該分組所有照片縮圖

#### Scenario: 無照片時顯示空狀態
- **WHEN** 已登入來賓進入有效格式的 `/album/[slotGroup]`，但無對應照片記錄
- **THEN** 頁面 SHALL 顯示「此時段尚無照片」提示，不顯示空白或錯誤畫面

#### Scenario: 無效格式 slotGroup 回傳 404
- **WHEN** 已登入來賓進入 `/album/abc`（非 8 位數字格式）
- **THEN** 系統 SHALL 回傳 404 頁面，不執行 Firestore 查詢

#### Scenario: 未登入來賓被重導向
- **WHEN** 未持有有效 `album_session` cookie 的訪客進入任意 `/album/**`
- **THEN** Middleware SHALL 重導向至 `/album/login`
