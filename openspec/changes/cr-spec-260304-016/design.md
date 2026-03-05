## Context

本專案部署於 Cloudflare Pages，所有 API Route 強制使用 `runtime = 'edge'`（Cloudflare Workers 環境）。
目前 `/api/upload` 接收相機端上傳的 JPEG blob，直接存至 R2，Firestore 只記錄原圖 URL。
監控頁（`/admin/monitoring`）與相簿格狀檢視載入完整原圖（數 MB），頻寬消耗大。

**核心限制：**
- Edge Runtime 無 Node.js API（不能用 `sharp`、`canvas` 套件）
- Cloudflare Workers 有 `OffscreenCanvas`，但 `toBlob()` / WebP encode 支援不穩定
- 需在同一個 Edge Route 完成，不可拆分至 Node.js 環境

## Goals / Non-Goals

**Goals:**
- 上傳原圖後，在同一個 `/api/upload` 請求內同步產生 WebP 縮圖
- 縮圖存至 R2 `thumbnails/` 資料夾
- Firestore `photos` 記錄 `thumbnail_url`
- 監控頁與相簿格狀檢視改用縮圖

**Non-Goals:**
- 批次補產歷史縮圖
- 多尺寸縮圖
- 縮圖失敗時阻斷原圖上傳

## Decisions

### D1：縮圖產生方式 → Cloudflare Image Resizing via `fetch()` CF options

| 方案 | 說明 | 取捨 |
|---|---|---|
| **Cloudflare Image Resizing**（選用）| `fetch(r2Url, { cf: { image: { width, format:'webp' } } })` | 需啟用 Image Resizing 功能；無需引入依賴；原生 WebP 支援 |
| `OffscreenCanvas` | Workers 支援，但 `toBlob()` 無法 encode WebP | 不可行 |
| `sharp`（WASM） | `@squoosh/lib` 等 WASM 版本可在 Workers 運行，但 bundle size 大（>2 MB） | 超過 Cloudflare Workers 1 MB script limit |
| 瀏覽器端縮圖 | Camera client 先縮再傳 | 增加上傳次數，複雜化 client 邏輯，違反 proposal Non-goals |

**選用理由：** Cloudflare Image Resizing 是 Edge Runtime 下最輕量且原生的解法，直接 `fetch` 原圖 URL 帶 CF 轉換參數即可取得 WebP；不需要任何額外 npm 依賴。

**前提條件：** Cloudflare 帳號需啟用 Image Resizing（需 Pro plan 或以上，或透過 Images 產品）。若未啟用，降級策略見 D4。

---

### D2：縮圖尺寸 → 寬度 640px，高度自動等比例

- 監控頁縮圖顯示區約 320px 寬（2 欄 Grid），640px 提供 2x 解析度
- 相簿格狀顯示區約 400px 寬，640px 足夠
- 不鎖定高度（`fit: 'cover'` 不指定高度），保留原始比例，避免裁切

---

### D3：R2 路徑與 Firestore 欄位

```
R2 縮圖 key: thumbnails/YYYY-MM-DD/device_id_timestamp.webp
Firestore photos: { ..., thumbnail_url: string }
Firestore devices: { ..., last_thumbnail_url: string | null }
```

- `thumbnails/` 前綴獨立管理縮圖，未來可單獨設定 lifecycle 或 CDN 規則
- `thumbnail_url` 設計為 optional（`string | undefined`），舊文件不需 migration

---

### D4：縮圖失敗降級策略 → 靜默略過，使用原圖 URL 作為 fallback

- 若 Cloudflare Image Resizing 未啟用或 fetch 失敗，`thumbnail_url` 不寫入 Firestore
- 前端顯示時：`thumbnail_url ?? r2_url`（監控頁、相簿皆同）
- 縮圖失敗不寫入 error_log（非致命），但在 console 留下 warning

---

### D5：上傳流程 → 原圖與縮圖並行上傳

```
1. 接收 FormData（photo + device_id）
2. 並行：
   a. 上傳原圖 → R2（既有邏輯）
   b. fetch 原圖（帶 CF image 轉換）→ 取得 WebP → 上傳縮圖至 R2
3. 兩者完成後寫入 Firestore（含 thumbnail_url）
4. 回傳 { ok, url, thumbnail_url }
```

注意：步驟 2b 的 fetch 必須等步驟 2a 完成並取得公開 URL 後才能執行（因為要用原圖 URL 作為 Cloudflare Image Resizing 的來源）。因此實際上是**串行**：先上傳原圖，再 fetch 縮圖，再上傳縮圖。

## Risks / Trade-offs

| 風險 | 緩解策略 |
|---|---|
| Cloudflare Image Resizing 未啟用 → 縮圖失敗 | D4 降級：`thumbnail_url` 不填，前端 fallback 到原圖 |
| 縮圖產生增加 `/api/upload` 回應時間 | 縮圖失敗靜默略過，不阻斷原圖上傳；超時設 5s |
| 相簿舊文件無 `thumbnail_url` | 前端 `thumbnail_url ?? r2_url`，零 migration 成本 |
| R2 `thumbnails/` 存放另一份資料，增加儲存成本 | WebP 縮圖約 20–50 KB vs 原圖 2–5 MB，整體儲存量增加 < 2% |

## Migration Plan

1. 部署新版 `/api/upload`：原圖上傳邏輯不變，新增縮圖產生
2. 部署新版前端：監控頁與相簿改用 `thumbnail_url ?? r2_url`（fallback 相容舊文件）
3. 確認 Cloudflare 帳號已啟用 Image Resizing
4. 無需資料 migration；舊 `photos` 文件無 `thumbnail_url`，前端自動 fallback

**Rollback：** 若縮圖功能異常，回滾 `/api/upload` 即可；前端因有 fallback 不受影響。

## Open Questions

- Cloudflare Image Resizing 是否已在此帳號啟用？（需在 Cloudflare Dashboard 確認）
- 縮圖寬度 640px 是否足夠？或需要兩種尺寸（監控 320px、相簿 640px）？
