## Why

監控儀表板（/admin/monitoring）為 Server Component，資訊只在手動重整後更新，工作人員無法即時掌握裝置連線狀態與最新照片縮圖。此外，心跳間隔 30 秒過長，儀表板缺少「下次心跳預計時間」與裝置持續離線的醒目警告。

## What Changes

- 將監控儀表板升級為 Client Component，使用 Firestore `onSnapshot` 監聽 `devices` 集合，實現自動即時更新
- 儀表板照片縮圖跟隨 `last_photo_url` 欄位即時刷新（無需重整）
- 新增裝置離線警告：超過閾值（建議 2 × 心跳間隔）未收到心跳，顯示醒目紅色 Badge
- 儀表板每張裝置卡顯示「下次心跳預計時間」（`last_heartbeat + 間隔`）
- 心跳間隔從 30 秒縮短至 **15 秒**（費用分析見下方）

### 心跳頻率費用分析

Firebase Spark（免費）額度：Firestore 每日 20K 寫入、50K 讀取。

| 間隔 | Firestore 寫入/天（3台） | 儀表板讀取/天（1位管理員） | 結論 |
|------|------------------------|--------------------------|------|
| 3s   | 259,200                | 259,200                  | ❌ 超額，會產生費用 |
| 10s  | 25,920                 | 25,920                   | ⚠️ 略超免費限制 |
| **15s** | **17,280**          | **17,280**               | ✅ 安全，無額外費用 |
| 30s  | 8,640（現況）           | 8,640                    | ✅ 安全但更新太慢 |

**建議 15 秒**：比現在快 2 倍、3 台裝置仍在免費額度內、無需變更 Firebase 方案。

## Capabilities

### New Capabilities

- `monitoring-realtime-dashboard`：監控儀表板即時更新（onSnapshot 監聽 devices 集合）

### Modified Capabilities

- `monitoring-dashboard`：
  - 新增「下次心跳預計時間」顯示
  - 新增持續離線警告 Badge（超過閾值顯示紅色警示）
  - 心跳間隔調整為 15 秒

## Impact

- `app/admin/monitoring/page.tsx`：改為 Client Component（加 `"use client"`，移除 Edge Runtime 限制）
- `app/camera/CameraClient.tsx`：心跳 interval 從 30,000ms 改為 15,000ms
- `lib/firebase-app.ts`：確認 client SDK 可在監控頁使用（Firestore onSnapshot）
- Firestore `devices` 集合：監聽讀取量增加（仍在免費額度內）
