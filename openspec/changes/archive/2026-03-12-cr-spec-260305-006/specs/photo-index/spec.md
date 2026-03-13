## ADDED Requirements

### Requirement: photo_index 文件結構
Firestore `photo_index` 集合 SHALL 以 `YYYY-MM-DD` 為 document ID，每份文件 SHALL 包含以下欄位：
- `slots`：數字陣列，值為該日期有照片的 `slot_8h`（0、8 或 16）
- `hours`：map，key 為 slot_8h 字串（"0"、"8"、"16"），value 為該時段有照片的 `hourMin` 數字陣列

#### Scenario: 文件 ID 為台灣時間日期
- **WHEN** 照片上傳時取得台灣時間日期 `YYYY-MM-DD`
- **THEN** 對應的 `photo_index` 文件 ID SHALL 為該日期字串

#### Scenario: slots 欄位包含所有有照片的時段
- **WHEN** 某日期的 slot_8h=0 與 slot_8h=8 各有至少一張照片
- **THEN** 該日期的 `photo_index` 文件 `slots` SHALL 包含 `[0, 8]`（不重複）

#### Scenario: hours 欄位包含各時段的小時索引
- **WHEN** slot_8h=8 下 hourMin=480 與 hourMin=540 各有至少一張照片
- **THEN** `hours["8"]` SHALL 包含 `[480, 540]`（不重複）

### Requirement: 照片上傳時同步更新 photo_index
每次 `/api/upload` 成功寫入 `photos` 集合後，系統 SHALL 呼叫 `updatePhotoIndex()` 更新對應日期的 `photo_index` 文件。

#### Scenario: 首次上傳建立新索引文件
- **WHEN** 某日期尚無 `photo_index` 文件，且有一張照片成功上傳
- **THEN** 系統 SHALL 建立新的 `photo_index/{date}` 文件，包含正確的 slots 與 hours 資料

#### Scenario: 後續上傳合併現有索引
- **WHEN** `photo_index/{date}` 已存在，且新照片屬於不同的 hourMin
- **THEN** 系統 SHALL 將新的 hourMin 合併至現有 `hours` 陣列，不覆蓋既有資料

#### Scenario: 相同時段重複上傳不產生重複項目
- **WHEN** 同一 hourMin 的照片被多次上傳
- **THEN** `hours` 陣列中 SHALL 不出現重複的 hourMin 值

#### Scenario: 索引更新失敗不影響照片上傳結果
- **WHEN** `updatePhotoIndex()` 拋出例外
- **THEN** `/api/upload` SHALL 仍回傳成功（200），索引更新失敗以 console.error 記錄，不向客戶端回傳錯誤

### Requirement: queryPhotoIndex 讀取索引供首頁使用
`lib/firebase-rest.ts` SHALL 提供 `queryPhotoIndex()` 函式，讀取 `photo_index` 集合所有文件，並回傳與現有 `queryDatesWithSlots()` 相同的資料結構（`Array<{ date: string; slots: Set<0 | 8 | 16> }>`），以利前端無縫切換。

#### Scenario: 回傳依日期由新到舊排序的陣列
- **WHEN** `queryPhotoIndex()` 被呼叫
- **THEN** 回傳陣列 SHALL 依 date 字串降冪排列

#### Scenario: photo_index 為空時回傳空陣列
- **WHEN** `photo_index` 集合無任何文件
- **THEN** `queryPhotoIndex()` SHALL 回傳 `[]`，不拋出例外

### Requirement: getPhotoIndexByDate 讀取單一日期索引供 slot 頁使用
`lib/firebase-rest.ts` SHALL 提供 `getPhotoIndexByDate(date)` 函式，讀取 `photo_index/{date}` 單一文件，回傳該日期各時段的小時索引 map（`Record<string, number[]>`）。

#### Scenario: 成功讀取已存在的索引
- **WHEN** `getPhotoIndexByDate("2026-03-05")` 被呼叫且文件存在
- **THEN** 回傳 `{ "0": [...], "8": [...], "16": [...] }` 格式的 hours map

#### Scenario: 文件不存在時回傳空 map
- **WHEN** `getPhotoIndexByDate()` 查詢的日期無對應 `photo_index` 文件
- **THEN** 回傳 `{}` 空物件，不拋出例外
