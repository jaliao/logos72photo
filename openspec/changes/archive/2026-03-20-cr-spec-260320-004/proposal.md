## Why

照片縮圖目前透過 Cloudflare Workers Image Service 自動加上 `assets/watermark.png` 浮水印（`WATERMARK_ENABLED=true`）。需要移除浮水印，讓照片以原始樣貌呈現。

## What Changes

- `wrangler.image-service.toml`：`WATERMARK_ENABLED` 改為 `"false"`
- `workers/image-service.ts`：移除浮水印條件分支與相關 import
- `workers/lib/photon-helper.ts`：移除 `applyWatermark()` 函式及 `watermark` import
- Image Service Worker 重新部署（`wrangler deploy --config wrangler.image-service.toml`）

**Non-goals：**
- 不刪除 R2 中的 `assets/watermark.png` 檔案（保留備用）
- 不清除 L2 快取（已快取的縮圖有浮水印，但到期後會以無浮水印版本取代；若需立即生效可手動清除）
- 不影響封面合成（`watermark2.png` 為另一套機制，不在本次範圍內）

## Capabilities

### New Capabilities
- （無）

### Modified Capabilities
- （無 spec-level 行為變更；`image-service` 無對應 spec）

## Impact

- `workers/image-service.ts`：移除浮水印分支
- `workers/lib/photon-helper.ts`：移除 `applyWatermark` 函式
- `wrangler.image-service.toml`：`WATERMARK_ENABLED = "false"`
- 需手動重新部署 Image Service Worker
