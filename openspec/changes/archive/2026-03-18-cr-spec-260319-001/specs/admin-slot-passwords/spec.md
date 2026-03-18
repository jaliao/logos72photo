## ADDED Requirements

### Requirement: 明信片列印入口
系統 SHALL 在 `/admin/slot-passwords` 頁面的「匯出與列印」區塊新增「列印明信片」連結按鈕，點擊後以新分頁開啟 `/admin/slot-passwords/postcard`。

#### Scenario: 點擊列印明信片按鈕
- **WHEN** 管理員點擊「匯出與列印」區塊中的「列印明信片」按鈕
- **THEN** 瀏覽器 SHALL 以新分頁開啟 `/admin/slot-passwords/postcard`
