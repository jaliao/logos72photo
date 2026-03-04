## 1. iPhone 偵測與 getUserMedia constraints 修改

- [x] 1.1 在 `CameraClient.tsx` 中，於 `getUserMedia` 呼叫前新增 `const isIphone = navigator.userAgent.includes('iPhone')` 偵測邏輯
- [x] 1.2 依偵測結果組合 video constraints：iPhone 時加入 `width: { ideal: 9999 }, height: { ideal: 9999 }`；非 iPhone 維持原有 `{ facingMode }` 不變
- [x] 1.3 將組合好的 constraints 帶入 `getUserMedia({ video: constraints, audio: false })` 呼叫

## 2. 版本與文件更新

- [x] 2.1 將 `config/version.json` 的 patch 版號 +1
- [x] 2.2 依 `.ai-rules.md` 重新產生 `README-AI.md`，反映本次解析度優化變更
