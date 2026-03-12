## ADDED Requirements

### Requirement: 重建照片封面索引操作頁面
後台 SHALL 在 `/admin/rebuild-first-photos` 提供「重建照片封面索引」操作頁面。頁面 SHALL 包含說明文字、「執行重建」按鈕、執行狀態指示，以及執行結果摘要。頁面 SHALL 使用 `NEXT_PUBLIC_ADMIN_SECRET` 作為 API 驗證憑證，呼叫 `POST /api/admin/rebuild-photo-index`。

#### Scenario: 頁面初始狀態顯示說明與按鈕
- **WHEN** 管理員進入 `/admin/rebuild-first-photos`
- **THEN** 頁面 SHALL 顯示功能說明文字與「執行重建」按鈕，按鈕為可點擊狀態，無結果摘要

#### Scenario: 點擊按鈕後顯示載入中狀態
- **WHEN** 管理員點擊「執行重建」按鈕
- **THEN** 按鈕 SHALL 變為不可點擊並顯示載入中文字（例：「重建中…」），防止重複提交

#### Scenario: 重建成功後顯示結果摘要
- **WHEN** `POST /api/admin/rebuild-photo-index` 回傳 `{ ok: true, message, results }`
- **THEN** 頁面 SHALL 顯示 `message`（例：「重建完成：3 個日期，120 張照片」），並提供可展開的各日期明細（`<details>`）

#### Scenario: 重建失敗時顯示錯誤訊息
- **WHEN** API 回傳非 2xx 狀態碼，或回傳 `{ ok: false, error }`
- **THEN** 頁面 SHALL 顯示紅色錯誤訊息，按鈕恢復可點擊狀態以供重試

#### Scenario: 未設定 NEXT_PUBLIC_ADMIN_SECRET 時提示錯誤
- **WHEN** 管理員點擊「執行重建」，且 `NEXT_PUBLIC_ADMIN_SECRET` 為空字串或未定義
- **THEN** 頁面 SHALL 顯示「環境變數 NEXT_PUBLIC_ADMIN_SECRET 未設定」錯誤提示，不發出 API 請求
