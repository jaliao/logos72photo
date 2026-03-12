### Requirement: 縮圖 URL 產生函式集中管理
系統 SHALL 在 `lib/image.ts` 集中定義所有縮圖 URL 產生函式。任何元件或頁面 SHALL 透過 import `lib/image` 取得縮圖 URL，禁止在元件內重複定義 `toThumbUrl` 或硬編碼縮圖尺寸。

`lib/image.ts` SHALL 匯出以下函式：
- `toThumbUrl(r2Url, width, quality)` — 基礎函式，若 `NEXT_PUBLIC_IMAGE_SERVICE_URL` 未設定則 fallback 回傳 `r2Url`
- `toThumb640(r2Url)` — 語意化包裝，固定 `width=640, quality=80`
- `toThumb1280(r2Url)` — 語意化包裝，固定 `width=1280, quality=85`

#### Scenario: toThumb640 回傳 640px 縮圖 URL
- **WHEN** 呼叫 `toThumb640(r2Url)`，且 `NEXT_PUBLIC_IMAGE_SERVICE_URL` 已設定
- **THEN** 回傳 `{IMAGE_SERVICE_URL}/resizing/640/80/{r2_key}`

#### Scenario: toThumb1280 回傳 1280px 縮圖 URL
- **WHEN** 呼叫 `toThumb1280(r2Url)`，且 `NEXT_PUBLIC_IMAGE_SERVICE_URL` 已設定
- **THEN** 回傳 `{IMAGE_SERVICE_URL}/resizing/1280/85/{r2_key}`

#### Scenario: Image Service 未設定時 fallback 至原始 URL
- **WHEN** 呼叫任意縮圖函式，且 `NEXT_PUBLIC_IMAGE_SERVICE_URL` 為空或未定義
- **THEN** 回傳原始 `r2Url`，不拋出例外
