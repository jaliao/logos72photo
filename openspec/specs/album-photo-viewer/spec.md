### Requirement: 相簿頂部授權說明橫幅
`AlbumPhotoViewer` grid 模式 SHALL 在照片網格上方顯示授權說明橫幅，內容為完整三段文字（見下方場景），讓家人在瀏覽縮圖前即可看到說明。

#### Scenario: grid 模式顯示授權橫幅
- **WHEN** 訪客進入個人相簿且照片列表不為空（grid 模式）
- **THEN** 系統 SHALL 在照片網格上方顯示授權說明橫幅，文字包含「各位家人平安！」、「本相簿記錄了活動的精彩點滴，照片將用於後續回顧與宣傳。」、「若您不希望個人影像被公開使用，歡迎您直接點選該照片並執行「刪除」。再次感謝家人們的參與與配合。」

#### Scenario: 無照片時不顯示授權橫幅
- **WHEN** 時段內照片列表為空
- **THEN** 授權說明橫幅 SHALL 不顯示

### Requirement: 空白時段提示樣式
當時段無照片時，系統 SHALL 顯示半透明白底圓角容器（`rounded-lg bg-white/70 px-4 py-3`），內含粗體黑字（`font-semibold text-black text-center`）提示「此時段尚無照片」。不使用裸文字 `text-zinc-400` 樣式。

#### Scenario: 無照片時顯示提示
- **WHEN** 時段內照片列表為空（`totalCount === 0`）
- **THEN** 系統 SHALL 顯示「此時段尚無照片」，樣式為 `rounded-lg bg-white/70 px-4 py-3 font-semibold text-black text-center`

#### Scenario: 無照片時不顯示 grid 或展開卡片
- **WHEN** 時段內照片列表為空
- **THEN** grid 與展開卡片 SHALL 不顯示

### Requirement: 單張照片展開卡片
`AlbumPhotoViewer` 元件 SHALL 提供「單頁展開」模式：點擊縮圖後，grid 隱藏，以白色圓角卡片顯示單張照片，卡片包含照片（`aspect-[3/4]` 全寬）、提示區塊（`bg-white/70 font-semibold text-black`）、下載與刪除按鈕（橫排等寬）、左右切換箭頭與「返回列表」按鈕。封面展開時同樣顯示「下載」與「刪除」按鈕。

#### Scenario: 點擊縮圖切換至展開模式
- **WHEN** 訪客點擊任意照片縮圖
- **THEN** grid 隱藏，顯示展開卡片，照片以 `aspect-[3/4]` 全寬呈現

#### Scenario: 提示區塊半透明背景
- **WHEN** 展開卡片顯示
- **THEN** 提示區塊 SHALL 使用 `bg-white/70`（70% 半透明白）背景，文字 SHALL 為 `font-semibold text-black`（600 粗體黑）

#### Scenario: 展開卡片顯示說明文字（一般照片）
- **WHEN** 一般照片展開卡片顯示
- **THEN** 卡片 SHALL 顯示三段授權說明文字：第一段「各位家人平安！」，第二段「本相簿記錄了活動的精彩點滴，照片將用於後續回顧與宣傳。」，第三段「若您不希望個人影像被公開使用，歡迎您直接點選該照片並執行「刪除」。再次感謝家人們的參與與配合。」

#### Scenario: 展開卡片顯示下載與刪除按鈕
- **WHEN** 任意展開卡片顯示（含封面）
- **THEN** 卡片 SHALL 顯示「下載」與「刪除」按鈕，橫排等寬，樣式明顯

#### Scenario: 左右切換照片
- **WHEN** 訪客點擊展開卡片的左箭頭或右箭頭
- **THEN** 系統 SHALL 切換至相鄰照片，無需返回列表

#### Scenario: 返回列表按鈕不含箭頭符號
- **WHEN** 展開卡片顯示
- **THEN** 返回按鈕文字 SHALL 為「返回列表」，不含「←」符號

#### Scenario: 返回列表
- **WHEN** 訪客點擊「返回列表」
- **THEN** 展開卡片隱藏，grid 重新顯示

### Requirement: 展開卡片下載功能
`AlbumPhotoViewer` 的下載 SHALL 使用 `fetch(r2Url) → Blob → <a download>` 方式實作，不使用 `navigator.share` Web Share API。

#### Scenario: 點擊下載觸發檔案下載
- **WHEN** 訪客點擊「下載」按鈕
- **THEN** 系統 SHALL 下載照片檔案至裝置，不開啟系統分享選單

#### Scenario: 不顯示分享功能
- **WHEN** 展開卡片顯示
- **THEN** 卡片 SHALL 不顯示分享按鈕或複製連結功能

### Requirement: 刪除 modal 確認對話框
點擊「刪除」後，系統 SHALL 顯示 modal overlay 對話框（`fixed inset-0 z-50` 半透明遮罩 + 居中白色卡片），包含確認文案與「確定刪除」／「取消」按鈕。inline 按鈕切換方式不再使用。

#### Scenario: 點擊刪除開啟 modal
- **WHEN** 訪客點擊「刪除」按鈕
- **THEN** 系統 SHALL 顯示 modal overlay，內含確認文案「確定要刪除這張照片嗎？刪除後無法復原。」及「確定刪除」、「取消」按鈕

#### Scenario: modal 取消
- **WHEN** 訪客點擊「取消」按鈕
- **THEN** modal 關閉，回到展開卡片，照片不刪除

#### Scenario: modal 確認刪除
- **WHEN** 訪客點擊「確定刪除」按鈕
- **THEN** 系統 SHALL 呼叫刪除 API，刪除成功後關閉 modal 並返回列表

#### Scenario: 刪除失敗於 modal 內顯示錯誤
- **WHEN** API 回傳非 2xx 狀態
- **THEN** modal SHALL 顯示錯誤訊息，不關閉 modal，照片不從列表移除

### Requirement: 刪除後本地狀態管理
刪除成功後，`AlbumPhotoViewer` SHALL 從本地 state 移除該項目（照片或封面）並返回列表，不重新查詢 Firestore。

#### Scenario: 刪除成功後移除照片
- **WHEN** 訪客確認刪除且 API 回傳成功
- **THEN** 該照片 SHALL 從列表消失，系統返回 grid 模式

#### Scenario: 封面刪除成功後移除
- **WHEN** 訪客確認刪除封面且 API 回傳成功
- **THEN** 封面 SHALL 從列表消失，系統返回 grid 模式

#### Scenario: 刪除失敗顯示錯誤
- **WHEN** API 回傳非 2xx 狀態
- **THEN** 系統 SHALL 顯示錯誤提示，項目不從列表移除
