## Context

`AlbumPhotoViewer` 展開模式目前提示文字視覺弱，刪除用原生 `confirm()`（iOS 體驗差），iOS 下載按鈕行為與桌面不同但無說明。封面與一般照片需要一致體驗。

## Goals / Non-Goals

**Goals:**
- 明顯提示區塊＋正確文案
- iOS 下載改為開啟新頁 + 操作提示
- 刪除改為 inline 二次確認
- 封面同步套用

**Non-Goals:**
- 不改 API、資料層、grid 模式

## Decisions

### 決策 1：說明文字改用提示區塊

使用 `bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900` 包住說明，讓訪客第一眼看到。

**文案（一般照片 & 封面共用）：**
> 本照片用於活動行銷宣傳，如不同意請點「刪除」自行移除。

### 決策 2：iOS 下載改為「在新頁開啟」＋長按提示

`fetch → blob → <a download>` 在 iOS Safari 通常開新頁而非存檔。因此：
- 偵測 iOS：`/iPhone|iPad|iPod/.test(navigator.userAgent)`
- iOS 上：`window.open(r2_url, '_blank')` 開啟原圖，按鈕文字改為「開啟照片」，下方顯示說明文字：
  > 開啟後長按圖片 → 選擇「儲存影像」即可存入相簿
- 非 iOS：維持 `fetch → blob → <a download>`（無需說明）

### 決策 3：刪除改為 inline 二次確認

點第一下「刪除」→ 按鈕列切換為「確定刪除」（紅色）+ 「取消」（灰色），3 秒無操作自動恢復；取代原生 `confirm()`，視覺一致且 iOS 友善。

## Migration Plan

1. 修改 `AlbumPhotoViewer.tsx`：加入 `confirmingDelete` state
2. 說明區塊套用新樣式與文案
3. iOS 偵測邏輯＋下載行為分支
4. 刪除按鈕改為兩段式確認
