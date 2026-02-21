## Context

`lib/firebase-rest.ts` 的 `rtdbSet` 函式原本以 Service Account 取得的 OAuth2 access token 呼叫 Firebase RTDB REST API（`PUT /{path}.json?access_token=<token>`）。

Firebase RTDB REST API 在收到 `access_token` 參數時，會以該 token 所代表的身分套用 Security Rules。Service Account 的 OAuth2 token 在 RTDB Rules 中被視為 authenticated user，但若 Rules 不明確允許該 uid，則回傳 401。與 Firebase Admin SDK 不同，Admin SDK 完全繞過 Security Rules；REST API 不論帶不帶 token，Rules 均會被套用。

`trigger/last_shot` 節點設計為公開寫入（`.write: true`），僅需 `/api/trigger` 的 `x-trigger-secret` 提供上游安全性保障，因此不需要也不應帶 access token。

## Goals / Non-Goals

**Goals:**
- 移除 `rtdbSet` 的 access token 邏輯，改用匿名 PUT 請求
- 確保 `trigger/last_shot` 可被成功寫入，解除 401 錯誤

**Non-Goals:**
- 修改 Firestore 函式（`addDoc`、`setDoc`、`listDocs`）——這些函式仍需 OAuth2 token
- 更改 RTDB Security Rules 結構
- 建立通用的「條件性 token 傳遞」機制

## Decisions

### 決策 1：直接移除 access token，不做條件判斷

**選擇：** `rtdbSet` 一律不帶 token，不新增「有 token / 無 token」的 flag 參數。

**Rationale：** `rtdbSet` 目前只用於 `trigger/last_shot` 一個公開節點。引入條件邏輯（如 `useAuth: boolean`）增加複雜度，且目前無需求。若未來需要寫入受保護節點，應另立函式（如 `rtdbSetAuth`）。

**替代方案考慮：**
- 加入 `useAuth?: boolean` flag → 過度設計，現在無此需求
- 改用 Firebase Admin SDK → 不相容 Edge Runtime（Node.js only）

### 決策 2：新增程式碼註解說明安全模型

移除 token 看起來像「忘記加」，應明確註解：
1. 此節點 `.write: true`，匿名寫入合法
2. 上游安全性由 `x-trigger-secret` 保障
3. 故意不帶 Authorization header，避免 401

## Risks / Trade-offs

- **[Risk] 若 RTDB 規則被誤改為 `.write: false`，`rtdbSet` 會靜默失敗** → 緩解：`rtdbSet` 已有 `if (!res.ok) throw` 錯誤處理，會顯示 401/403
- **[Trade-off] `rtdbSet` 只能寫入公開節點** → 可接受：此函式的唯一使用場景就是 `trigger/last_shot`

## Migration Plan

1. 移除 `rtdbSet` 中的 `getAccessToken()` 呼叫與 `Authorization` header（已完成）
2. 新增說明安全模型的程式碼註解（已完成）
3. 重新部署 Cloudflare Pages，確認 `/api/trigger` 回傳 `{"ok":true}`（已驗證）

**Rollback：** 恢復 `getAccessToken()` 呼叫與 `Authorization: Bearer` header，並調整 RTDB Security Rules 允許 Service Account uid 寫入。

## Open Questions

- 若未來需要寫入受保護的 RTDB 節點，`rtdbSet` 應如何擴展？建議另立 `rtdbSetAuth(path, value)` 函式並附帶 access token。
