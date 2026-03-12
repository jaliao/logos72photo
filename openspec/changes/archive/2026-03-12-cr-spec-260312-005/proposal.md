## Why

幻燈片在桌機版開啟時，前景照片容器未正確限制高度，導致照片可能超出瀏覽器視窗高度或顯示比例異常。需調整桌機版與手機版的視窗大小行為，確保照片在各裝置皆能完整顯示且填滿幻燈片視窗。

## What Changes

- **桌機版（viewport ≥ 640px）**：幻燈片視窗高度不超過瀏覽器視窗高度（`max-h-screen`），維持 `3/4` 寬高比，照片以 `object-cover` 填滿幻燈片視窗，水平置中；兩側空間由模糊背景填補
- **手機版（viewport < 640px）**：幻燈片視窗填滿整個手機畫面（`inset-0`），照片以 `object-cover` 填滿幻燈片視窗

## Capabilities

### New Capabilities
<!-- 無新增 capability -->

### Modified Capabilities
- `photo-lightbox`：桌機版照片容器改為高度不超過視窗高度（`max-h-screen`）並維持 `3/4` 比例；手機版維持滿版填滿行為

## Impact

- `app/components/PhotoSlideshow.tsx`：調整前景照片容器的 Tailwind class
- `openspec/specs/photo-lightbox/spec.md`：更新桌機版幻燈片顯示規格（Scenario: 桌機版照片維持 3/4 比例置中）
