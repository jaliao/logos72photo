## 1. 修正 Cloud Function：裝置 ID typo

- [x] 1.1 修改 `functions/src/generateCover.ts`：將 `device_id !== 'iphone2'` 改為 `device_id !== 'iphone-2'`
- [ ] 1.2 執行 `firebase deploy --only functions` 重新部署 Cloud Function

## 2. 修正 generate-covers.mjs：加入 iphone-2 過濾

- [x] 2.1 在 `queryFirstPhotoPerSlotGroup()` 的 `select.fields` 加入 `{ fieldPath: 'device_id' }`
- [x] 2.2 在 `for` loop 中讀取 `f.device_id?.stringValue`，加入 `if (deviceId !== 'iphone-2') continue` 過濾

## 3. 修正 setHasCoverFlag()：移除 updateMask

- [x] 3.1 移除 `setHasCoverFlag()` PATCH URL 的 `?updateMask.fieldPaths=hasCover` 查詢參數，使其具備建立或取代語意

## 4. 驗證與回補

- [x] 4.1 執行 `node scripts/generate-covers.mjs --force`，確認輸出全為 ✓ 且無 ✗
- [x] 4.2 抽查 2–3 個 `/album/[slotGroup]` 頁面，確認封面照片正確顯示
- [x] 4.3 上傳一張新照片（從 iphone-2 裝置），確認 Cloud Function 自動生成封面
