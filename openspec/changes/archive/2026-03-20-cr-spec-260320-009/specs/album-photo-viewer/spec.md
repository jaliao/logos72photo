## MODIFIED Requirements

### Requirement: 空白時段提示樣式
當時段無照片時，系統 SHALL 顯示半透明白底圓角容器（`rounded-lg bg-white/70 px-4 py-3`），內含粗體黑字（`font-semibold text-black text-center`）提示「此時段尚無照片」。不使用裸文字 `text-zinc-400` 樣式。

#### Scenario: 無照片時顯示提示
- **WHEN** 時段內照片列表為空（`totalCount === 0`）
- **THEN** 系統 SHALL 顯示「此時段尚無照片」，樣式為 `rounded-lg bg-white/70 px-4 py-3 font-semibold text-black text-center`

#### Scenario: 無照片時不顯示 grid 或展開卡片
- **WHEN** 時段內照片列表為空
- **THEN** grid 與展開卡片 SHALL 不顯示
