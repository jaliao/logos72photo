## Context

每個 slotGroup（格式 MMDDHHSS，代表 15 分鐘時段）可能包含多張照片，目前缺乏統一的視覺封面。封面圖需以 `public/watermark2.png`（1080×1440 RGB PNG）為底圖，將該分組的第一張照片 cover-crop 至 844×861 後嵌入底圖 (x=117, y=229)，結果存入 R2 的 `covers/{slotGroup}.jpg`。

目前上傳 API（`/api/upload`）為 edge runtime，無法直接執行 `sharp`（需原生二進位）。選用 **Firebase Cloud Functions（Firestore onCreate 觸發）** 達成自動產生封面的需求。

## Goals / Non-Goals

**Goals:**
- 每當 slotGroup 的**第一張照片**寫入 Firestore 時，自動觸發封面合成
- 封面以 `sharp` cover-crop + composite 合成，不變形
- 結果上傳至 R2 `covers/{slotGroup}.jpg`

**Non-Goals:**
- 不建立 Next.js API 路由（edge 限制）
- 不做即時 UI 顯示（封面存 R2，呼叫方自行決定使用時機）
- 不處理無照片的 slotGroup
- 不在非第一張照片時重新生成（除非手動觸發）

## Decisions

### 1. 觸發方式：Firebase Cloud Functions Firestore onCreate

**選擇：** 在 `photos/{docId}` 的 `onCreate` 事件觸發 Cloud Function。

**流程：**
1. 新 photo 寫入 Firestore（由現有上傳 API 負責）
2. Cloud Function 觸發，讀取 `slot_group` 欄位
3. 查詢 Firestore，計算該 slotGroup 的照片數量
4. 若此為**第一張**（count === 1），執行封面合成
5. 若已有封面（count > 1），直接返回（不重複生成）

**理由：** Cloud Functions 執行在 Node.js 環境，sharp 可用；Firestore onCreate 觸發不需要額外的 webhook 基礎建設；與現有 Firestore 資料流完全整合。

**替代方案：** R2 Event Notification + Cloudflare Worker — Worker 環境無 sharp 原生支援，composite 操作受限，捨棄。

---

### 2. 圖像處理：sharp cover crop + composite

**選擇：** Cloud Function 使用 `sharp`：
1. 從 R2（公開 URL 或 signed URL）下載原圖 buffer
2. `sharp(buffer).resize(844, 861, { fit: 'cover' })` — cover crop，取中央區域
3. 讀取 `watermark2.png`（底圖 1080×1440），可預先打包進 Function 部署包
4. `sharpBase.composite([{ input: croppedBuffer, left: 117, top: 229 }])`
5. `.jpeg({ quality: 88 })` 輸出
6. `PutObjectCommand` 上傳至 R2 `covers/{slotGroup}.jpg`

---

### 3. 冪等性：以 slotGroup 照片數量判斷「第一張」

**選擇：** 觸發時查詢 Firestore `photos` collection，`where slot_group == slotGroup`，`count` 文件數：
- count === 1 → 此為第一張，產生封面
- count > 1 → 已有其他照片，跳過

**補充：** Firestore 的 `onCreate` 觸發有重複執行風險（至少一次語意）。為確保冪等，也可先查詢 R2 `covers/{slotGroup}.jpg` 是否已存在，若已存在則跳過。

---

### 4. 底圖（watermark2.png）部署方式

**選擇：** 將 `public/watermark2.png` 複製至 `functions/assets/watermark2.png`，隨 Cloud Function 一起部署。

**理由：** Cloud Function 無法存取 Next.js `public/` 目錄，需獨立打包靜態資源。

---

### 5. R2 存取憑證

**選擇：** Cloud Function 透過 Firebase Functions 環境變數（`functions.config()` 或 Secret Manager）取得 R2 憑證，使用 `@aws-sdk/client-s3`。

---

### 6. 保留本機批次腳本

**選擇：** 同時保留 `scripts/generate-covers.mjs` 作為補救工具，處理：
- Cloud Function 部署前已存在的 slotGroup
- 需要重新生成封面的情況

## Risks / Trade-offs

- **[風險] Cloud Function 觸發延遲** → Firestore onCreate 通常在數秒內觸發，對封面用途可接受
- **[風險] 重複觸發（至少一次語意）** → 以 R2 物件存在與否做冪等保護
- **[風險] Cold start 延遲** → 第一次觸發較慢（1–3 秒），不影響功能正確性
- **[風險] R2 原圖存取** → 若原圖為私有，需 signed URL；若公開可讀則直接 fetch
- **[取捨] Functions 需額外計費** → 活動期間上傳量有限，預計在免費額度內

## Migration Plan

1. 建立 `functions/` 目錄，初始化 Firebase Functions（Node.js 18+）
2. 安裝依賴：`sharp`, `@aws-sdk/client-s3`
3. 將 `public/watermark2.png` 複製至 `functions/assets/`
4. 實作 `functions/src/generateCover.ts`
5. 設定 R2 環境變數至 Firebase Functions config / Secret Manager
6. 部署：`firebase deploy --only functions`
7. 驗證：上傳測試照片，確認 R2 `covers/` 出現對應 .jpg
8. 執行 `scripts/generate-covers.mjs` 補齊歷史 slotGroup

**Rollback：** `firebase functions:delete generateCover`，封面圖僅存 R2，不影響任何現有路由。

## Open Questions

- Firestore `photos` collection 中，判斷「第一張」的欄位確認（`slot_group` 是否已存在於所有文件？）→ 查看 upload route 確認已寫入 `slot_group`（已確認：`slot_group: getSlotGroup(...)`）
- R2 原圖 URL 是否公開可讀？→ 需確認 R2 bucket 的公開存取設定
- Firebase Functions 目前是否已啟用？→ 需確認 Firebase 專案設定
