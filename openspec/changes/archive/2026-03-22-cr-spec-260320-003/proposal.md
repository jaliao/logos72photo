## Why

`functions/assets/watermark2.png` 封面底圖已更新，需要重新部署 Firebase Cloud Functions 才能生效。目前專案缺少 Cloud Functions 的部署說明文件，每次更新底圖或函式邏輯時，部署步驟全靠記憶，容易出錯或遺漏。

## What Changes

- 更新 `functions/assets/watermark2.png`（封面合成底圖，已修改）
- 新增 `docs/deploy-cloud-functions.md`：Firebase Cloud Functions 部署完整說明，涵蓋環境設定、build、deploy 與底圖更新流程

**Non-goals：**
- 不修改 Cloud Functions 邏輯（`generateCover.ts`）
- 不修改封面合成參數（尺寸、位置、quality 不變）

## Capabilities

### New Capabilities
- （無新功能）

### Modified Capabilities
- （無 spec-level 行為變更）

## Impact

- `functions/assets/watermark2.png`：二進位檔替換
- 新增 `docs/deploy-cloud-functions.md`
