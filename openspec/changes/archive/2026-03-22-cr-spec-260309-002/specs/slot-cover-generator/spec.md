## ADDED Requirements

### Requirement: 自動觸發 slotGroup 封面合成
當 slotGroup 的第一張照片寫入 Firestore `photos` collection 時，系統 SHALL 自動觸發封面合成流程，無需人工介入。

#### Scenario: 第一張照片觸發封面合成
- **WHEN** 新照片寫入 Firestore `photos` collection，且該 `slot_group` 在 `photos` 中僅此一筆文件
- **THEN** Firebase Cloud Function SHALL 下載該照片並合成封面，上傳至 R2 `covers/{slotGroup}.jpg`

#### Scenario: 非第一張照片不觸發
- **WHEN** 新照片寫入 Firestore `photos` collection，且該 `slot_group` 已有其他照片文件存在
- **THEN** Cloud Function SHALL 直接返回，不重新生成封面

#### Scenario: 封面已存在時跳過（冪等保護）
- **WHEN** Cloud Function 觸發，且 R2 `covers/{slotGroup}.jpg` 已存在
- **THEN** Cloud Function SHALL 跳過合成，不覆蓋現有封面

### Requirement: 封面圖合成規格
封面圖 SHALL 以 `watermark2.png`（1080×1440 RGB PNG）為底圖，將照片 cover-crop 後嵌入指定位置，輸出為 JPEG。

#### Scenario: 照片嵌入底圖
- **WHEN** 合成流程執行
- **THEN** 照片 SHALL 被 cover-crop 至 844×861（不變形，取中央區域），並嵌入底圖位置 x=117, y=229

#### Scenario: 輸出格式
- **WHEN** 合成完成
- **THEN** 結果 SHALL 以 JPEG 格式（quality 88）上傳至 R2，路徑為 `covers/{slotGroup}.jpg`

### Requirement: 照片下載與錯誤處理
合成流程 SHALL 從 R2 公開 URL 下載原圖，並在下載或合成失敗時記錄錯誤並跳過，不中斷其他封面的生成。

#### Scenario: 原圖下載失敗
- **WHEN** 從 R2 URL 下載照片時發生網路錯誤或 HTTP 非 200 回應
- **THEN** Cloud Function SHALL 記錄錯誤訊息，並以成功狀態返回（不拋出例外，避免重試風暴）

### Requirement: 本機批次補齊腳本
系統 SHALL 提供本機執行的批次腳本 `scripts/generate-covers.mjs`，可補齊 Cloud Function 部署前已存在的 slotGroup 封面，或強制重新生成。

#### Scenario: 批次執行指定日期範圍
- **WHEN** 以 `node scripts/generate-covers.mjs --from MMDD --to MMDD` 執行
- **THEN** 腳本 SHALL 查詢 Firestore，取得該日期範圍內所有 slotGroup 的第一張照片，依序合成並上傳至 R2

#### Scenario: 無參數執行處理所有 slotGroup
- **WHEN** 以 `node scripts/generate-covers.mjs` 執行（無 `--from`/`--to`）
- **THEN** 腳本 SHALL 處理 Firestore 中所有 slotGroup 的第一張照片
