## Why

兩個獨立 bug 導致功能異常：
1. 監控儀表板拍照後照片縮圖不更新，需手動重新整理才能看到新照片。
2. 開發環境（台灣機器，UTC+8）拍攝的照片出現在錯誤時段相簿（例：18:00 拍的照片出現在 02:00 相簿）。

## What Changes

- `components/ThumbnailImage.tsx`：加入 `useEffect` 同步 `src` prop 變更，修復 `onSnapshot` 推送新照片 URL 後畫面不更新的問題。
- `lib/types.ts`：`getSlot8h` 與 `getSlot15m` 改用 `.getUTCHours()` / `.getUTCMinutes()`，修復在本地時區非 UTC 環境下時段計算偏移的問題。
- `app/api/upload/route.ts`：`hourMin` 計算同步改用 `.getUTCHours()`。

## Capabilities

### New Capabilities
（無）

### Modified Capabilities
（無，純 bug fix，無 spec 層級行為變更）

## Non-goals

- 不重構 `ThumbnailImage` 為 Next.js `<Image>` 元件
- 不變更時間同步機制或 `TW_OFFSET_MS` 設計

## Impact

- `components/ThumbnailImage.tsx`：+4 行
- `lib/types.ts`：2 行修改（getHours → getUTCHours）
- `app/api/upload/route.ts`：1 行修改
