## ADDED Requirements

### Requirement: 封面存在 flag 寫入 Firestore
`generateCover` Cloud Function 封面上傳成功後，SHALL 在 Firestore `slotGroups/{slotGroup}` 文件寫入 `{ hasCover: true }`。

#### Scenario: 封面上傳成功寫入 flag
- **WHEN** `generateCover` 成功上傳 `covers/{slotGroup}.jpg` 至 R2
- **THEN** 系統 SHALL 在 Firestore `slotGroups/{slotGroup}` 寫入（merge）`{ hasCover: true }`

#### Scenario: flag 寫入失敗不影響主流程
- **WHEN** Firestore 寫入失敗
- **THEN** `generateCover` SHALL 記錄 warning 但不拋出例外

## MODIFIED Requirements

### Requirement: 個人時段相簿頁面
系統 SHALL 提供 `/album/[slotGroup]` 獨立頁面，依 8 碼分組編號（MMDDHHSS）從 Firestore `photos` 集合查詢並展示照片，頁面顯示分組編號作為識別資訊。存取 `/album/**` 路由 SHALL 需持有有效 `album_session` cookie；未登入來賓 SHALL 被重導向至 `/album/login`。

封面存在狀態 SHALL 從 Firestore `slotGroups/{slotGroup}.hasCover` 讀取，不發送 HEAD request 至 R2。

#### Scenario: 有效 slotGroup 顯示照片列表
- **WHEN** 已登入來賓進入 `/album/03130101`，且 Firestore 有 `slotGroup == "03130101"` 的照片
- **THEN** 頁面 SHALL 依 `createdAt` 升冪顯示該分組所有照片縮圖

#### Scenario: 封面存在時顯示封面
- **WHEN** Firestore `slotGroups/{slotGroup}.hasCover === true`
- **THEN** 頁面 SHALL 傳入 `coverUrl` 至 `AlbumPhotoViewer`，顯示封面圖

#### Scenario: 封面不存在時不發送 HEAD
- **WHEN** Firestore `slotGroups/{slotGroup}` 不存在或 `hasCover !== true`
- **THEN** 頁面 SHALL 不發送任何 HEAD request，`AlbumPhotoViewer` 不傳入 `coverUrl`

#### Scenario: 無照片時顯示空狀態
- **WHEN** 已登入來賓進入有效格式的 `/album/[slotGroup]`，但無對應照片記錄
- **THEN** 頁面 SHALL 顯示「此時段尚無照片」提示，不顯示空白或錯誤畫面

#### Scenario: 無效格式 slotGroup 回傳 404
- **WHEN** 已登入來賓進入 `/album/abc`（非 8 位數字格式）
- **THEN** 系統 SHALL 回傳 404 頁面，不執行 Firestore 查詢

#### Scenario: 未登入來賓被重導向
- **WHEN** 未持有有效 `album_session` cookie 的訪客進入任意 `/album/**`
- **THEN** Middleware SHALL 重導向至 `/album/login`

## ADDED Requirements

### Requirement: Grid 首圖優先載入
`AlbumPhotoViewer` grid 模式 SHALL 對第一張圖（index 0，含封面）加上 `priority` prop，讓瀏覽器優先載入首屏圖片。

#### Scenario: Grid 第一張圖優先載入
- **WHEN** AlbumPhotoViewer 以 grid 模式顯示
- **THEN** 第一張縮圖 SHALL 使用 `priority` prop，其餘縮圖不加
