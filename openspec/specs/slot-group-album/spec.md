### Requirement: 個人時段相簿頁面
系統 SHALL 提供 `/album/[slotGroup]` 獨立頁面，依 8 碼分組編號（MMDDHHSS）從 Firestore `photos` 集合查詢並展示照片，頁面顯示分組編號作為識別資訊。

#### Scenario: 有效 slotGroup 顯示照片列表
- **WHEN** 訪客進入 `/album/03130101`，且 Firestore 有 `slotGroup == "03130101"` 的照片
- **THEN** 頁面 SHALL 依 `createdAt` 升冪顯示該分組所有照片縮圖

#### Scenario: 無照片時顯示空狀態
- **WHEN** 訪客進入有效格式的 `/album/[slotGroup]`，但無對應照片記錄
- **THEN** 頁面 SHALL 顯示「此時段尚無照片」提示，不顯示空白或錯誤畫面

#### Scenario: 無效格式 slotGroup 回傳 404
- **WHEN** 訪客進入 `/album/abc`（非 8 位數字格式）
- **THEN** 系統 SHALL 回傳 404 頁面，不執行 Firestore 查詢

### Requirement: 個人時段相簿頁面顯示分組編號
頁面 SHALL 在明顯位置顯示當前分組號碼，讓訪客能識別自己的時段。

#### Scenario: 頁面標題顯示分組號碼
- **WHEN** 訪客進入任意有效的 `/album/[slotGroup]` 頁面
- **THEN** 頁面 SHALL 顯示分組號碼（如 `03130101`）作為標題或副標題

### Requirement: 個人時段相簿照片縮圖格
相簿頁面的縮圖 grid SHALL 以直式比例（`aspect-[3/4]`）顯示，手機版單欄、桌面版雙欄，點擊縮圖開啟 Lightbox 全螢幕瀏覽。

#### Scenario: 手機版單欄顯示
- **WHEN** 訪客在手機（viewport < 640px）進入 `/album/[slotGroup]`
- **THEN** 縮圖 grid SHALL 以單欄垂直排列

#### Scenario: 桌面版雙欄顯示
- **WHEN** 訪客在桌面（viewport ≥ 640px）進入 `/album/[slotGroup]`
- **THEN** 縮圖 grid SHALL 以雙欄並排

#### Scenario: 點擊縮圖開啟 Lightbox
- **WHEN** 訪客點擊任意縮圖
- **THEN** 系統 SHALL 以 Lightbox 全螢幕顯示原尺寸照片，支援左右切換
