## Context

浮水印功能位於 Cloudflare Workers Image Service（`workers/`），流程為：

1. `wrangler.image-service.toml` 的 `WATERMARK_ENABLED = "true"` 開啟功能
2. `workers/image-service.ts` 在 cache miss 時判斷 env var，從 R2 `assets/watermark.png` 讀取浮水印並呼叫 `applyWatermark()`
3. `workers/lib/photon-helper.ts` 的 `applyWatermark()` 使用 `@cf-wasm/photon` 的 `watermark()` 合成至縮圖右下角

L2 快取（R2 `thumbnails/` 路徑）已存有帶浮水印的縮圖，停用後不會自動失效。

## Goals / Non-Goals

**Goals:**
- 停用浮水印：`WATERMARK_ENABLED = "false"`
- 移除 `image-service.ts` 中的浮水印條件分支及 R2 讀取
- 移除 `photon-helper.ts` 中的 `applyWatermark` 函式及 `watermark` import
- 重新部署 Worker 讓設定生效

**Non-Goals:**
- 不刪除 R2 `assets/watermark.png`
- 不主動清除 L2 快取（等自然到期）
- 不影響 `functions/` 的封面合成（`watermark2.png` 另一套）

## Decisions

### 決策 1：直接移除死碼，不保留 WATERMARK_ENABLED 開關

浮水印功能確定不再使用，移除分支與函式讓程式碼更乾淨。若未來需要重新加入，git history 可查。

**替代方案：** 只改 `WATERMARK_ENABLED = "false"` 保留程式碼 → 留下無用死碼，捨棄。

### 決策 2：L2 快取不主動清除

清除 R2 `thumbnails/` 前綴需要 ListObjects + DeleteObjects，影響範圍廣且操作不可逆。快取到期後會自動以無浮水印版本取代，可接受。

## Risks / Trade-offs

- **L2 快取殘留**：已快取縮圖仍有浮水印，直到快取到期（或手動清除）→ 可接受；若需立即生效，可在 Cloudflare R2 Console 手動刪除 `thumbnails/` 前綴

## Migration Plan

1. 修改 `workers/lib/photon-helper.ts`：移除 `applyWatermark` 與 `watermark` import
2. 修改 `workers/image-service.ts`：移除浮水印分支與 `applyWatermark` import
3. 修改 `wrangler.image-service.toml`：`WATERMARK_ENABLED = "false"`
4. 部署：`wrangler deploy --config wrangler.image-service.toml`

## Open Questions

- 無
