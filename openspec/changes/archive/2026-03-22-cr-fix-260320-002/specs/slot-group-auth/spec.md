## ADDED Requirements

### Requirement: 登入頁輸入欄位不觸發手機自動縮放
`/album/login` 頁面所有 `<input>` 欄位的 `font-size` SHALL 不小於 16px，確保 iOS Safari 在使用者點擊輸入欄位時不觸發頁面自動放大（auto-zoom），手機軟鍵盤出現時頁面寬度 SHALL 維持在視窗範圍內，不產生橫向捲軸。

#### Scenario: 點擊帳號欄位時頁面不放大
- **WHEN** 使用者在 iOS Safari 手機上點擊 `/album/login` 的帳號輸入欄位
- **THEN** 頁面 SHALL 維持原縮放比例，不自動放大，不出現橫向捲軸

#### Scenario: 點擊密碼欄位時頁面不放大
- **WHEN** 使用者在 iOS Safari 手機上點擊 `/album/login` 的密碼輸入欄位
- **THEN** 頁面 SHALL 維持原縮放比例，不自動放大，不出現橫向捲軸

#### Scenario: 軟鍵盤收起後頁面恢復正常
- **WHEN** 使用者完成輸入並關閉手機軟鍵盤
- **THEN** 頁面 SHALL 恢復至原始縮放比例，橫向捲軸 SHALL 不存在
