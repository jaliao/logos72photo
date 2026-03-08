## Context

`lib/firebase-rest.ts` 中的 `getPhotoIndexByDate()` 函式透過 Firestore REST API 讀取 `photo_index/{date}` 文件，並以 `parseFirestoreFields()` 將 Firestore 原始欄位轉換為 JS 物件。該函式回傳型別為 `Record<string, unknown>`，但程式碼直接以 `as PhotoIndexDoc` 進行 cast。TypeScript 4.9+ 嚴格要求兩型別須有足夠結構重疊，否則拒絕 cast，導致 `tsc` 編譯失敗。

## Goals / Non-Goals

**Goals:**
- 修正 TypeScript 編譯錯誤，使建置成功
- 不改變 runtime 行為

**Non-Goals:**
- 重構 `parseFirestoreFields` 回傳型別為泛型
- 引入 runtime 型別驗證（zod 等）
- 修改 `PhotoIndexDoc` 型別定義

## Decisions

**雙重 cast（`as unknown as PhotoIndexDoc`）**

TypeScript 對 `as T` cast 要求來源型別與目標型別有結構重疊。`Record<string, unknown>` 的 value 為 `unknown`，無法滿足 `PhotoIndexDoc`（需要 `slots` 與 `hours` 具名屬性）的重疊要求。

解法：先 cast 至 `unknown`（任何型別均與 `unknown` 重疊），再 cast 至 `PhotoIndexDoc`。此模式是 TypeScript 官方認可的「escape hatch」，適用於開發者確知 runtime 資料結構正確但型別系統無法驗證的場景。

替代方案：
- 修改 `parseFirestoreFields` 為泛型函式 → 改動範圍較大，非本次目標
- 使用 `@ts-ignore` → 會跳過整行型別檢查，副作用較大，不採用

## Risks / Trade-offs

- [Risk] 雙重 cast 為「信任開發者」的模式，若 Firestore 資料結構異常，runtime 仍可能取得 `undefined` → Mitigation：`?? {}` fallback 已在後續一行處理
