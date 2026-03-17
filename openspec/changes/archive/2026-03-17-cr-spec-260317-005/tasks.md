## 1. 修改登入頁面

- [x] 1.1 在 `app/album/login/page.tsx` 新增 `showPassword` state，預設值為 `true`（明文顯示）
- [x] 1.2 密碼欄位改為 `type={showPassword ? 'text' : 'password'}`，外層用 `relative` div 包裹
- [x] 1.3 在密碼欄位右側加入 `absolute` 切換按鈕，點擊切換 `showPassword`，使用內聯 SVG 眼睛圖示（開眼 / 閉眼）

## 2. 版號與文件

- [x] 2.1 更新 `config/version.json` patch 版號 +1
- [x] 2.2 更新 `README-AI.md`
