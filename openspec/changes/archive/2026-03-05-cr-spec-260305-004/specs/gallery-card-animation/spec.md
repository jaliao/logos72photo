## ADDED Requirements

### Requirement: 日期卡片半透明玻璃效果
日期卡片容器（白色底）的背景 SHALL 改為半透明白色（`bg-white/50`），並加上 `box-shadow`，使動態背景漸層可透過卡片隱約可見，形成 Glassmorphism 視覺層次。

#### Scenario: 日期卡片呈現半透明效果
- **WHEN** 使用者進入相簿首頁，日期卡片顯示於動態漸層背景之上
- **THEN** 日期卡片底色 SHALL 為半透明白色（opacity 0.5），動態背景 SHALL 透過卡片隱約可見

#### Scenario: 日期卡片有陰影提升層次感
- **WHEN** 日期卡片顯示
- **THEN** 卡片 SHALL 具有 `box-shadow`，在半透明背景上提供視覺深度

### Requirement: 有照片時段格半透明深色效果
在日期卡片內，「有照片」時段格（黑色底）的背景 SHALL 改為半透明 zinc-800（`bg-zinc-800/50`），使卡片背景可部分穿透，維持時段格可讀性。

#### Scenario: 有照片時段格呈現半透明深色效果
- **WHEN** 時段格內有照片資料
- **THEN** 時段格背景 SHALL 為半透明 zinc-800（opacity 0.5）

#### Scenario: 無照片時段格維持不透明
- **WHEN** 時段格內無照片資料
- **THEN** 時段格背景 SHALL 維持原有不透明淺灰色（`bg-zinc-100`），確保「無照片」視覺提示清晰可讀

### Requirement: 標題文字 text-shadow 可讀性提升
相簿首頁主標題 `<h1>` SHALL 加上 `text-shadow`，在動態漸層背景上保持文字清晰可讀。

#### Scenario: 標題在動態背景上清晰可讀
- **WHEN** 動態漸層背景在標題文字後方循環動畫
- **THEN** 標題 `<h1>` SHALL 具有 `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`，使文字在各種背景色調下皆清晰可讀
