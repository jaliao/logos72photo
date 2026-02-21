## 1. 程式碼修正（`lib/firebase-rest.ts`）

- [x] 1.1 移除 `rtdbSet` 中的 `getAccessToken()` 呼叫
- [x] 1.2 移除 `rtdbSet` 中的 `Authorization: Bearer` header
- [x] 1.3 新增程式碼註解：說明 `trigger/last_shot` 為公開寫入節點、安全性由 `x-trigger-secret` 保障

## 2. 驗證

- [x] 2.1 部署至 Cloudflare Pages，確認 `curl -X POST /api/trigger` 回傳 `{"ok":true}`
- [x] 2.2 確認 Firebase RTDB `trigger/last_shot` 節點值有更新
