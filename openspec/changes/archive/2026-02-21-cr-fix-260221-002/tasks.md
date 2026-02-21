## 1. firebase-rest.ts 擴充

- [x] 1.1 新增 `parseFirestoreValue()` 內部函式，將 Firestore REST Value 格式解析為 JS 值
- [x] 1.2 新增 `parseFirestoreFields()` 內部函式，將 Firestore fields map 解析為 JS 物件
- [x] 1.3 新增 `listDocs<T>()` export 函式，透過 Firestore REST API 讀取集合所有文件

## 2. 監控儀表板修復

- [x] 2.1 移除 `app/admin/monitoring/page.tsx` 中 `firebase/firestore` 與 `lib/firebase` 的 import
- [x] 2.2 將 `getDevices()` 改用 `listDocs<DeviceDoc>('devices')` 取代原本的 Client SDK 呼叫

## 3. 驗證

- [x] 3.1 執行 TypeScript 型別檢查（`npx tsc --noEmit`）確認無型別錯誤
- [x] 3.2 部署至 Cloudflare Pages，確認 `/admin/monitoring` 不再出現 Error 1101
