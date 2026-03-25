## Context

正式環境完全沒有封面照片，調查後發現三個獨立 bug，需一次修正。

### 現況資料流

```
[照片上傳]
upload API → Firestore photos/{id} { device_id: 'iphone-1'|'iphone-2', slot_group, r2_url, timestamp }

[Cloud Function 自動產生封面]
generateCover (Firestore onWrite trigger)
  → 過濾 device_id !== 'iphone2'  ← BUG: 應為 'iphone-2'
  → 全部被跳過，從未生成封面

[手動回補腳本]
generate-covers.mjs
  → queryFirstPhotoPerSlotGroup(): 查詢 photos，SELECT slot_group, r2_url, timestamp
  → 未查詢 device_id，取任何裝置的第一張  ← BUG: 應只取 iphone-2
  → composeCover() → R2 PUT covers/{slotGroup}.jpg
  → setHasCoverFlag(): PATCH .../slotGroups/{sg}?updateMask.fieldPaths=hasCover
  → 文件不存在時回傳 404 → flag 未寫入  ← BUG

[相簿頁面]
/album/[slotGroup]/page.tsx
  → getSlotGroupDoc() → slotGroups/{slotGroup}.hasCover
  → hasCover === true ? 顯示封面 : 不顯示   ← 讀取邏輯正確
```

### Bug 清單

| Bug | 位置 | 影響 |
|-----|------|------|
| 裝置 ID typo | `generateCover.ts:135` `'iphone2'` → 應為 `'iphone-2'` | Cloud Function 永遠不生成封面 |
| 缺少 device_id 過濾 | `generate-covers.mjs` 查詢未含 `device_id` 欄位 | 批次腳本用錯裝置的照片 |
| `updateMask` PATCH 失敗 | `setHasCoverFlag()` 文件不存在時回傳 404 | flag 未寫入，封面不顯示 |

## Goals / Non-Goals

**Goals:**
- 修正三個 bug，使封面照片能正確生成並顯示在相簿
- 所有封面使用 `iphone-2` 的第一張照片

**Non-Goals:**
- 不更動影像合成邏輯
- 不更動 `getSlotGroupDoc()` 讀取邏輯
- 不重構相簿頁面 UI

## Decisions

### 決策 1：Cloud Function 裝置 ID typo 修正

**選項 A（採用）：** 直接將 `'iphone2'` 改為 `'iphone-2'`
- 最小改動，符合 `KNOWN_DEVICES = ['iphone-1', 'iphone-2']` 定義
- 需重新部署 Cloud Function

### 決策 2：generate-covers.mjs 加入 device_id 過濾

**做法：**
1. 在 Firestore structured query 的 `select.fields` 加入 `{ fieldPath: 'device_id' }`
2. 在 `for` loop 讀取 `f.device_id?.stringValue`
3. 只保留 `device_id === 'iphone-2'` 的照片

**選項 A（採用）：** 在 loop 中用 `if (deviceId !== 'iphone-2') continue`
- 簡單，直接對應需求

**選項 B（棄用）：** 在 Firestore structured query 加 `where` 過濾
- 可減少網路傳輸，但需 Firestore 複合索引（`device_id` + `timestamp`）
- 過度最佳化，目前資料量不大

### 決策 3：setHasCoverFlag() 移除 updateMask

根據 Firestore REST API 規範：
- PATCH **帶** `updateMask`：只更新指定欄位；文件不存在 → 404
- PATCH **不帶** `updateMask`：建立或完整取代文件

**選項 A（採用）：** 移除 `?updateMask.fieldPaths=hasCover`
- `slotGroups/{slotGroup}` 目前只有 `hasCover` 一個欄位，不會破壞其他資料
- 一行改動

**選項 B（棄用）：** GET → merge → PUT
- 兩次 API 呼叫，複雜度不必要

## Risks / Trade-offs

- **覆寫其他欄位：** 決策 3 移除 `updateMask` 後，若未來 `slotGroups` 文件新增欄位，PATCH 將覆寫 → 緩解：目前確認只有 `hasCover` 欄位
- **Cloud Function 重新部署後才生效：** 需手動 `firebase deploy --only functions` 後，新上傳照片才會自動觸發

## Migration Plan

1. 修正三個 bug（程式碼）
2. `firebase deploy --only functions` 重新部署 Cloud Function
3. 執行 `node generate-covers.mjs --force` 回補所有既有 slotGroup 的封面
4. 抽查數個 `/album/[slotGroup]` 頁面確認封面顯示正常

**Rollback：** 還原三個改動並重新部署即可

## Open Questions

- `slotGroups` 文件是否只有 `hasCover` 一個欄位？（需 Firebase Console 確認，若有其他欄位則需改用 GET-merge-PUT）
- 目前 Firestore `photos` 中有多少 slotGroup 是有 `iphone-2` 照片的？（影響回補規模）
