## Context

`cr-spec-260221-007` 引入了 PWA standalone 模式偵測，預期在 Safari 直接開啟相機 URL 時顯示安裝引導、不啟動相機。實際在 Cloudflare Pages 正式環境測試時，`window.matchMedia('(display-mode: standalone)')` 與 `navigator.standalone` 均回傳 `false`，即使是從主畫面圖示開啟也如此，原因未明（可能為 Cloudflare Pages Edge 環境或 iOS 版本差異）。此 bug 導致相機永遠顯示安裝引導，完全無法拍照。

同時，Firebase RTDB 安全規則未設定（預設鎖定），Cloudflare Worker Cron 尚未部署，共同造成「自動拍照完全不動作」的問題。

## Goals / Non-Goals

**Goals:**
- 立即恢復相機拍照功能（hotfix）
- 補齊 RTDB 安全規則與 Worker Cron 的設定文件與部署

**Non-Goals:**
- 根本解決 standalone 偵測失效的原因（留待後續 debug）
- 恢復「瀏覽器直接開啟顯示安裝引導」的防護機制（此版本先放棄）

## Decisions

### 決策 1：直接 `setIsStandalone(true)` 取代偵測邏輯（hotfix）

**選擇：** 跳過偵測，硬性設為 `true`（等同於永遠以相機模式啟動）

**Rationale：** 正式環境驗證失敗，偵測結果不可靠。比起讓相機完全失效，接受「Safari 也能開相機」的副作用更可接受。活動期間兩台 iPhone 均由專人操作，重複加入風險極低。

**替代方案考慮：**
- `?debug=1` query param 繞過偵測 → 需修改 URL，影響 PWA 安裝流程，複雜度高
- 偵測 iOS user agent → 不穩定，且問題不只在 iOS
- 等待 debug 根本原因 → 活動即將開始，無法等待

### 決策 2：Firebase RTDB 安全規則手動設定，不自動化

RTDB 規則需透過 Firebase Console 設定，無法透過程式碼自動化（Admin SDK 不支援規則管理）。只在 README 中提供步驟說明，由操作者手動設定。

### 決策 3：Cloudflare Worker Cron 使用 `wrangler secret put` 設定 secret

直接在 Cloudflare Worker 的 secret store 寫入，而非透過環境變數，確保 secret 不出現在 `wrangler.toml` 版本控制中。

## Risks / Trade-offs

- **[Risk] 任何人用瀏覽器開啟 camera1/camera2 都會啟動相機** → 緩解：網址不公開，正式環境只有操作人員知道；心跳覆寫同一 device_id，不影響監控
- **[Risk] standalone 偵測問題未根治，後續若想恢復防護需額外工作** → 記錄在 Open Questions

## Migration Plan

1. 修改 `CameraClient.tsx`：注解舊偵測邏輯，改為 `setIsStandalone(true)`（已完成）
2. Firebase Console 設定 RTDB 安全規則（手動，操作者執行）
3. `wrangler secret put TRIGGER_API_SECRET`（已完成）
4. `wrangler deploy workers/cron-trigger.ts`（已完成）
5. 更新 README.md（已完成）

**Rollback：** 恢復 `CameraClient.tsx` 中被注解的偵測邏輯即可回到 standalone 模式。

## Open Questions

- standalone 偵測在 Cloudflare Pages 失效的根本原因為何？是否與 `<meta name="apple-mobile-web-app-capable">` 的渲染時機有關？
- 是否需要在 `InstallGuide` 元件加入「繼續使用 Safari 模式」的選項，讓操作者有辦法在非 standalone 下也能用相機？
