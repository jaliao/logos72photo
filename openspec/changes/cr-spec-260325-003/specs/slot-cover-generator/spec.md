## MODIFIED Requirements

### Requirement: 自動觸發 slotGroup 封面合成
當 slotGroup 的第一張照片寫入 Firestore `photos` collection 時，系統 SHALL 自動觸發封面合成流程，無需人工介入。

#### Scenario: 第一張照片觸發封面合成
- **WHEN** 新照片寫入 Firestore `photos` collection，且該 `slot_group` 在 `photos` 中僅此一筆文件
- **THEN** Firebase Cloud Function SHALL 下載該照片並合成封面，上傳至 R2 `covers/{slotGroup}.jpg`

#### Scenario: 非 iphone-2 裝置不觸發
- **WHEN** 新照片寫入 Firestore `photos` collection，且 `device_id !== 'iphone-2'`
- **THEN** Cloud Function SHALL 直接返回，不生成封面

#### Scenario: 非第一張照片不觸發
- **WHEN** 新照片寫入 Firestore `photos` collection，且該 `slot_group` 已有其他照片文件存在
- **THEN** Cloud Function SHALL 直接返回，不重新生成封面

#### Scenario: 封面已存在時跳過（冪等保護）
- **WHEN** Cloud Function 觸發，且 R2 `covers/{slotGroup}.jpg` 已存在
- **THEN** Cloud Function SHALL 跳過合成，不覆蓋現有封面

### Requirement: 本機批次補齊腳本
系統 SHALL 提供本機執行的批次腳本 `scripts/generate-covers.mjs`，使用每個 slotGroup 中 `device_id === 'iphone-2'` 的第一張照片（依 `timestamp` 升冪），補齊或強制重新生成封面。

#### Scenario: 批次執行指定日期範圍
- **WHEN** 以 `node scripts/generate-covers.mjs --from MMDD --to MMDD` 執行
- **THEN** 腳本 SHALL 查詢 Firestore，取得該日期範圍內所有 slotGroup 中 `device_id === 'iphone-2'` 的第一張照片，依序合成並上傳至 R2

#### Scenario: 無參數執行處理所有 slotGroup
- **WHEN** 以 `node scripts/generate-covers.mjs` 執行（無 `--from`/`--to`）
- **THEN** 腳本 SHALL 處理 Firestore 中所有 slotGroup 的 `iphone-2` 第一張照片

#### Scenario: 無 iphone-2 照片的 slotGroup 跳過
- **WHEN** 某 slotGroup 沒有任何 `device_id === 'iphone-2'` 的照片
- **THEN** 腳本 SHALL 跳過該 slotGroup，不生成封面

#### Scenario: hasCover flag 寫入——文件已存在
- **WHEN** 封面上傳至 R2 成功，且 Firestore `slotGroups/{slotGroup}` 文件已存在
- **THEN** 腳本 SHALL 更新該文件的 `hasCover` 欄位為 `true`

#### Scenario: hasCover flag 寫入——文件不存在
- **WHEN** 封面上傳至 R2 成功，且 Firestore `slotGroups/{slotGroup}` 文件**不存在**
- **THEN** 腳本 SHALL 建立該文件並寫入 `{ hasCover: true }`，不得因文件不存在而失敗

#### Scenario: flag 寫入失敗時明確標示
- **WHEN** Firestore flag 寫入發生錯誤
- **THEN** 腳本 SHALL 於終端顯示可區分「R2 上傳失敗」與「Firestore 寫入失敗」的錯誤訊息，並將該 slotGroup 計入失敗數
