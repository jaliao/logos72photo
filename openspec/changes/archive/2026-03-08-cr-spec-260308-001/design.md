## Context

首頁 `queryPhotoIndex()` 目前以 Firestore REST LIST API 讀取 `photo_index` 集合的所有文件，並在 client-side 以日期降冪排列後全量回傳。文件數 = 活動天數，隨時間增長。Firestore REST LIST API 不支援以文件 ID（日期字串）做範圍過濾，因此無法在伺服器端限縮日期範圍。

## Goals / Non-Goals

**Goals:**
- 首頁只顯示 `GALLERY_START_DATE` 至 `GALLERY_END_DATE`（或台灣今日）範圍內有照片的日期
- 環境變數未設定 `GALLERY_END_DATE` 時，自動以台灣今日作為上限
- 降低首頁呈現的日期數量，避免顯示非活動期間的雜訊

**Non-Goals:**
- 不減少 Firestore 讀取次數（LIST 仍全量讀取，client-side 過濾）
- 不修改 slot / album 子頁的查詢行為
- 不新增管理介面

## Decisions

**使用 `NEXT_PUBLIC_` 前綴**

環境變數命名為 `NEXT_PUBLIC_GALLERY_START_DATE` 與 `NEXT_PUBLIC_GALLERY_END_DATE`。Gallery 頁面為 Server Component（edge runtime），使用 `process.env` 直接讀取。`NEXT_PUBLIC_` 前綴確保日後若有 Client Component 也能讀取，且在 Cloudflare Pages 部署時一致。

替代方案：不加 `NEXT_PUBLIC_` 前綴（僅 server-side）→ 彈性較低，選擇 `NEXT_PUBLIC_`。

**client-side 日期過濾（在 `queryPhotoIndex` 回傳前）**

Firestore REST LIST API 可加 `pageSize` 與 `pageToken` 分頁，但無法以文件 ID 做範圍查詢。過濾邏輯在 `queryPhotoIndex()` 內，接收 `startDate?: string` / `endDate?: string` 參數，於 `.filter()` 中以字串比較（YYYY-MM-DD 字典序 = 日期序）實作。

**台灣今日計算**

`endDate` 未提供時，以 `new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)` 計算台灣今日，與 upload route 的 `dateStr` 計算方式一致。

## Risks / Trade-offs

- [Risk] 活動天數超過 300 天時，Firestore REST LIST 可能需分頁（預設 pageSize 300）→ Mitigation：活動規模不預期超過此限制；日後視需求加入分頁邏輯
- [Risk] `GALLERY_START_DATE` 未設定時首頁顯示所有日期（維持現有行為）→ Mitigation：此為向下相容的合理預設
