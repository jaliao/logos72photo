## 1. 移除浮水印程式碼

- [x] 1.1 修改 `workers/lib/photon-helper.ts`：移除 `applyWatermark()` 函式及 `watermark` import（`@cf-wasm/photon`）
- [x] 1.2 修改 `workers/image-service.ts`：移除浮水印條件分支（`if (env.WATERMARK_ENABLED === 'true')` 整段）、移除 `applyWatermark` import、移除 env 型別定義中的 `WATERMARK_ENABLED`

## 2. 設定檔更新

- [x] 2.1 修改 `wrangler.image-service.toml`：`WATERMARK_ENABLED = "false"`（或直接移除該行）

## 3. 版本與文件

- [x] 3.1 更新 `config/version.json` patch 版號 +1
- [x] 3.2 依 `.ai-rules.md` 重新產生 `README-AI.md`
