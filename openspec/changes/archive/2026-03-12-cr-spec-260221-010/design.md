## Context

目前 `CameraClient.tsx` 呼叫 `navigator.mediaDevices.getUserMedia` 時，video constraints 僅指定 `facingMode`，未設定解析度上限。瀏覽器在此情況下會自行選擇串流解析度，通常遠低於 iPhone 原生相機硬體支援的最大值（例如 iPhone 後鏡頭可達 4032×3024）。拍攝結果因此品質不足，無法滿足現場攝影存檔需求。

## Goals / Non-Goals

**Goals:**
- 在 iPhone 上以 `getUserMedia` 取得最大可用解析度的串流
- canvas 拍照輸出與串流實際解析度完全一致（已有 `videoWidth`/`videoHeight` 機制，維持即可）
- 偵測邏輯限縮在 iPhone，不影響其他裝置

**Non-Goals:**
- 調整 `toBlob` JPEG 壓縮品質參數
- 非 iPhone 裝置的解析度優化
- 提供使用者手動切換解析度的 UI
- Android 或桌面裝置的高解析度支援

## Decisions

### Decision 1：以 `{ ideal: 9999 }` 要求最大解析度

MediaDevices API 的 constraints 支援 `ideal` 關鍵字：瀏覽器會盡可能接近該值，若超出硬體上限則自動降為裝置最大值，不會拋出錯誤。

設定 `width: { ideal: 9999 }` 與 `height: { ideal: 9999 }` 等同於「要求最大可能解析度」，同時保持 API 相容性。

**備選方案考慮：**
- `exact: 4032` — 若裝置不支援該數值會直接拋出 `OverconstrainedError`，風險高
- `min: 1920` — 可能在部分舊款 iPhone 上失敗
- 不設限（現狀）— 瀏覽器自選低解析度，效果差

### Decision 2：iPhone 偵測使用 User-Agent 字串

以 `navigator.userAgent.includes('iPhone')` 判斷裝置類型，僅限客戶端執行。

理由：本專案相機頁面已是 Client Component（`"use client"`），UA 字串可直接存取，無需額外套件或伺服器端邏輯。iPhone 的 UA 字串中固定包含 `'iPhone'` 子字串，誤判率極低。

**備選方案：** 使用 `navigator.platform`（已棄用）或 Feature Detection（無法區分裝置品牌）—— UA 字串最直接可靠。

### Decision 3：canvas 輸出不額外修改

現有程式碼已正確以 `video.videoWidth` / `video.videoHeight` 設定 canvas 尺寸，不需修改。提升串流解析度後，canvas 輸出自然跟隨。

## Risks / Trade-offs

- **高解析度串流耗電較快** → 此為攝影現場專用設備，接受此取捨；且 iPhone 本身的串流功耗管理由 iOS 控制
- **部分 iOS/Safari 版本對 ideal 解析度的處理可能有差異** → 實際解析度仍受硬體上限限制，不會比現狀更差
- **串流啟動時間可能略微增加** → 差異微小，不影響使用者體驗

## Migration Plan

1. 修改 `CameraClient.tsx` 中的 `getUserMedia` 呼叫，新增 iPhone 偵測與 constraints 設定
2. 無資料庫或 API 異動，無需 migration script
3. 部署後，在 iPhone 實機上驗證串流解析度是否提升（可透過監控儀表板查看拍照結果）

## Open Questions

- 無
