## 1. 擴充 photo_index 資料模型

- [x] 1.1 `lib/firebase-rest.ts`：`PhotoIndexDoc` 新增 `hourCounts?: Record<string, Record<string, number>>` 欄位
- [x] 1.2 `lib/firebase-rest.ts`：`updatePhotoIndex()` 讀取現有 `hourCounts` 並將 `hourCounts[slotKey][String(hourMin)]` 遞增 1，合併回 PATCH payload

## 2. 擴充 getPhotoIndexByDate 回傳型別

- [x] 2.1 `lib/firebase-rest.ts`：`getPhotoIndexByDate()` 回傳型別由 `Record<string, number[]>` 改為 `{ hours: Record<string, number[]>; hourCounts: Record<string, Record<string, number>> }`
- [x] 2.2 `lib/firebase-rest.ts`：實作中同時解構 `parsed.hours` 與 `parsed.hourCounts`（不存在時給空物件）並回傳

## 3. 更新時段列表頁 UI

- [x] 3.1 `app/gallery/[date]/[slot]/page.tsx`：更新 `getPhotoIndexByDate` 呼叫端，解構新的回傳結構（`{ hours, hourCounts }`）
- [x] 3.2 `app/gallery/[date]/[slot]/page.tsx`：移除 `hasPhotos` 判斷，所有小時格統一套用 `bg-zinc-800/50 text-white hover:bg-zinc-700/60`
- [x] 3.3 `app/gallery/[date]/[slot]/page.tsx`：每格下方顯示 `N 張`（讀取 `hourCounts[String(slot8h)]?.[String(albumMin)] ?? 0`，格式為 `{count} 張`，樣式 `text-xs text-zinc-300`）

## 4. 版本與文件更新

- [x] 4.1 `config/version.json` patch 版號 +1
- [x] 4.2 更新 `README-AI.md`：版本號、業務邏輯說明、當前任務狀態
