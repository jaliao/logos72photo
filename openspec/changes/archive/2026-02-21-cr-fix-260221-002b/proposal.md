## Why

`rtdbSet` 在呼叫 Firebase RTDB REST API 時附帶 `?access_token=<oauth2_token>`，導致 Firebase 以 OAuth2 token 身分驗證，並套用 Security Rules（實際行為等同未驗證用戶），造成 `trigger/last_shot` 寫入 401 Unauthorized 錯誤。`trigger/last_shot` 節點設計為公開寫入（`.write: true`），安全性由 `/api/trigger` 的 `x-trigger-secret` header 把關，因此不需要 access token。

## What Changes

- 移除 `lib/firebase-rest.ts` 中 `rtdbSet` 的 `Authorization: Bearer` header 與 `?access_token=` query string
- 新增程式碼註解說明此節點為公開寫入、安全性由上游 API secret 保障

## Non-goals

- 修改其他使用 access token 的 Firestore 函式（`addDoc`、`setDoc`、`listDocs`）
- 修改 RTDB Security Rules 本身（已於 Firebase Console 手動設定）
- 根本解決 OAuth2 token 與 RTDB Rules 互動的通用問題

## Capabilities

### New Capabilities
<!-- 無新功能 -->

### Modified Capabilities
- `camera-control`: `rtdbSet` 行為變更——移除 access token，改為匿名寫入 `trigger/last_shot`

## Impact

- `lib/firebase-rest.ts`：`rtdbSet` 函式移除 access token 相關邏輯
