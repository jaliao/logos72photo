## Context

本專案部署於 Cloudflare Pages，API Routes 使用 Edge Runtime。現有 R2 原圖直接暴露於前端，無統一的 resize 與格式轉換機制。已有獨立 Cloudflare Worker 架構（`workers/cron-trigger.ts` + `wrangler.toml`），可依樣建立第二個 image-service Worker。

**技術可行性確認（本 change 前已評估）：**
- `@cf-wasm/photon`：VIABLE，專為 Cloudflare Workers 設計，支援 resize、WebP encode、浮水印合成
- `wasm-vips`：不可行（體積超過 Workers script size limit）
- Cache API：VIABLE（GET request 快取）
- R2 Binding：VIABLE（零 egress 費用）

## Goals / Non-Goals

**Goals:**
- 建立獨立 Cloudflare Worker 提供統一影像處理服務（resize、WebP、浮水印）
- 兩層快取降低 R2 read 次數（L1: Cache API、L2: R2 thumbnails/）
- 前端使用單一 URL pattern 取得任意尺寸縮圖

**Non-Goals:**
- 不修改原圖上傳流程
- 不批次補產歷史縮圖
- 不支援動態文字浮水印
- 不提供 Admin UI 管理設定

## Decisions

### D1：影像處理引擎 → `@cf-wasm/photon`

| 方案 | 說明 | 結論 |
|---|---|---|
| **@cf-wasm/photon**（選用）| Rust/WASM，~800 KB，原生 WebP encode `get_bytes_webp()`，支援合成 | ✅ 可行 |
| `wasm-vips` | libvips WASM，~6–8 MB 未壓縮 | ❌ 超過 Workers 10 MB gzip 限制 |
| Cloudflare Image Resizing | 需 Pro plan，`fetch()` 帶 `cf.image` 參數 | ⚠️ 需付費功能，不保證可用 |
| 瀏覽器端縮圖 | Camera client 先縮再傳 | ❌ 複雜化 client 邏輯 |

---

### D2：Worker 部署方式 → 獨立 `wrangler.image-service.toml`

與既有 `wrangler.toml`（cron-trigger）分離，各自獨立部署。避免單一設定檔管理多個 Worker 造成混亂。

```toml
name = "logos72photo-image"
main = "workers/image-service.ts"
r2_buckets = [{ binding = "BUCKET", bucket_name = "logos72photo" }]
```

---

### D3：路由格式 → `/resizing/{width}/{quality}/{r2_key}`

- `width`：輸出寬度（px），高度等比例自動計算
- `quality`：WebP 壓縮品質 1–100
- `r2_key`：原始 R2 key（如 `2026-03-05/iphone-1_1708481234567.jpg`）
- URL 結構固定，易於 CDN 快取（Cache-Control key）

---

### D4：兩層快取策略

```
請求進入
  ↓
L1: Cloudflare Cache API (cache.match)
  ↓ miss
L2: R2 thumbnails/{width}w_{quality}q/{r2_key}.webp
  ↓ miss
從 R2 原圖 fetch → photon 處理 → 同時寫入 L1 + L2
```

- L1 Cache API：邊緣節點揮發性快取，TTL 由 `Cache-Control: public, max-age=86400` 控制
- L2 R2：永久存儲，避免重複處理相同尺寸
- L2 key 格式：`thumbnails/{width}w_{quality}q/{original_r2_key}.webp`

---

### D5：浮水印 → R2 `assets/watermark.png`，啟用時疊加至右下角

- watermark 圖片存放於 R2 `assets/watermark.png`，Worker 啟動時或首次使用時讀取並快取於記憶體（Worker instance 生命週期內）
- URL 無需浮水印參數，改由環境變數 `WATERMARK_ENABLED=true/false` 控制
- 浮水印位置：右下角，margin 為圖片寬度的 2%

---

### D6：錯誤處理 → 直接 302 Redirect 至原圖

若影像處理失敗（photon 錯誤、R2 原圖不存在等），回傳 `302 Location: {r2_public_url}/{r2_key}` 讓瀏覽器直接取用原圖，確保前端不中斷。

## Risks / Trade-offs

| 風險 | 緩解策略 |
|---|---|
| photon WASM 首次載入延遲（cold start） | Cloudflare Workers 通常 cold start < 50ms，WASM 初始化一次後 reuse |
| 大圖（5 MB）resize CPU 時間超過 10ms（free plan） | 使用 Workers Paid plan（30s CPU）；小圖一般 < 5ms |
| L2 R2 thumbnails/ 快取累積儲存成本 | WebP 縮圖 ~ 20–50 KB，相對原圖 2–5 MB 影響小 |
| 浮水印圖片每次 Worker 重啟重新讀取 | 接受；冷啟動頻率低，R2 read 費用微小 |
| Worker 與 Pages 是不同服務，需分開設定 CORS | image-service Worker 加 `Access-Control-Allow-Origin: *` header |

## Migration Plan

1. 新增 `@cf-wasm/photon` npm 依賴
2. 實作 `workers/image-service.ts` 與 `workers/lib/photon-helper.ts`
3. 建立 `wrangler.image-service.toml`，綁定 R2 bucket
4. 上傳 `assets/watermark.png` 至 R2
5. 部署 image-service Worker：`wrangler deploy --config wrangler.image-service.toml`
6. 前端監控頁與相簿改用 image-service URL（fallback: 原圖 URL）
7. 驗證各尺寸輸出正確，Cache-Control 生效

**Rollback：** 前端 URL 改回原始 R2 URL 即可；Worker 不影響原圖存取。

## Open Questions

- Workers Paid plan 是否已啟用？（免費 plan CPU 10ms 可能不足處理大圖）
- Image-service Worker 的對外網域？（`*.workers.dev` 預設域名 或自訂 `img.logos72photo.com`）
- `WATERMARK_ENABLED` 預設開啟或關閉？
