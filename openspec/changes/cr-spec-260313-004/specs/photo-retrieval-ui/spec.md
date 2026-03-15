## ADDED Requirements

### Requirement: 依 slotGroup 查詢照片
系統 SHALL 提供依 `slotGroup` 欄位查詢 Firestore `photos` 集合的能力，回傳符合指定分組號碼的所有照片，依 `createdAt` 升冪排列。查詢前 SHALL 驗證 `slotGroup` 為 8 位數字格式，否則直接回傳空陣列。

#### Scenario: 有效 slotGroup 回傳對應照片
- **WHEN** 呼叫查詢函式，帶入 `slotGroup = "03130101"`，Firestore 有 3 筆符合記錄
- **THEN** 函式 SHALL 回傳 3 筆照片資料，依 `createdAt` 升冪排列

#### Scenario: 無符合記錄時回傳空陣列
- **WHEN** 呼叫查詢函式，帶入有效 `slotGroup`，Firestore 無符合記錄
- **THEN** 函式 SHALL 回傳空陣列，不拋出例外

#### Scenario: 無效格式 slotGroup 不執行查詢
- **WHEN** 呼叫查詢函式，帶入非 8 位數字的字串（如 `"abc"` 或 `"0313010"`）
- **THEN** 函式 SHALL 直接回傳空陣列，不執行 Firestore 查詢
