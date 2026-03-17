## Why

活動結束後需關閉公開相簿入口，避免民眾直接瀏覽日期列表；同時需要一個可透過環境變數切換的機制，讓首頁在「關閉」狀態時自動導向個人時段登入頁，不需修改程式碼即可上下線。

## What Changes

- 新增環境變數 `NEXT_PUBLIC_GALLERY_ENABLED`（唯有明確設為 `true` 才開啟；未設定或其他值均視為 `false`）
- 首頁（`app/page.tsx`）讀取該環境變數：
  - `'true'`：維持現有相簿日期列表行為
  - 其他（含未設定）：直接 redirect 至 `/album/login`，不顯示日期列表

## Capabilities

### New Capabilities
- （無）

### Modified Capabilities
- `photo-retrieval-ui`：首頁新增 gallery 開關邏輯，關閉時 redirect 至 `/album/login`

## Impact

- **修改：** `app/page.tsx`（讀取環境變數，條件 redirect）
- **環境變數：** `NEXT_PUBLIC_GALLERY_ENABLED`，需設定於 Cloudflare Pages 環境變數（Production / Preview）
- **無資料庫異動**

## Non-goals

- 不做後台開關 UI（直接改環境變數）
- 不影響 `/gallery/**` 子路由（僅控制首頁入口）
- 不做登入後返回首頁的邏輯調整
