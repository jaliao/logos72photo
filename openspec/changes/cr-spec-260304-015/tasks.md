## 1. 倒數秒數調整

- [x] 1.1 在 `app/camera/CameraClient.tsx` 找到 `countdown` state 初始值（目前為 `15`），改為 `10`
- [x] 1.2 確認倒數視覺覆蓋層文字與動畫邏輯無硬編碼 `15`，確保顯示正確剩餘秒數

## 2. 時間顯示格式改為 12 時制

- [x] 2.1 在 `app/camera/CameraClient.tsx` 找到 `formatTime`（第 19 行）或等效時間格式化函式，改為手動 12 時制格式：`上午/下午 H:MM:SS`（使用 `hours % 12 || 12` 取小時，`hours < 12 ? '上午' : '下午'` 取前綴）
- [x] 2.2 找到 `setCurrentTime`（第 317 行），將 `toLocaleTimeString('zh-TW', { hour12: false })` 改為使用同一格式化函式，輸出「上午/下午 H:MM:SS」
- [x] 2.3 確認 RTDB 觸發時間顯示（使用 `formatTime` 的地方）同步套用新格式
- [ ] 2.4 手動測試邊界值：午夜 00:00（→ 上午 12:00:00）、正午 12:00（→ 下午 12:00:00）、上午 9:05:03（→ 上午 9:05:03）

## 3. 觸發排程提早 60 秒

- [x] 3.1 修改 `wrangler.toml` 第 9 行，將 cron 表達式從 `*/5 * * * *` 改為 `4-59/5 * * * *`（每小時於第 4、9、14、19、24、29、34、39、44、49、54、59 分觸發）
- [x] 3.2 確認 `workers/cron-trigger.ts` 無額外時間過濾邏輯（避免新 cron 表達式被過濾）
- [x] 3.3 部署 Cloudflare Worker（`wrangler deploy` 或 CI/CD）並在 Cloudflare Dashboard 確認新排程已生效

## 4. 版本號與文件更新

- [x] 4.1 將 `config/version.json` 的 `patch` 版號 +1
- [x] 4.2 依照 `.ai-rules.md` 重新產生 `README-AI.md`，反映本次拍照時間優化調整
