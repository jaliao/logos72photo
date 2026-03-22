## 1. AdminNav 元件

- [x] 1.1 建立 `app/components/AdminNav.tsx`（Client Component）：側邊欄選單，含 6 個功能項目、active 高亮邏輯（`usePathname`）、登出按鈕（`logoutAction` form）
- [x] 1.2 實作手機版頂部 bar（品牌名稱 + hamburger icon）與 sidebar 展開／關閉邏輯（`useState` + overlay）

## 2. Admin Layout

- [x] 2.1 建立 `app/admin/layout.tsx`（Server Component）：讀取 `admin_session` cookie；有 session → 渲染含 `AdminNav` 的 Shell（sidebar + 主內容區）；無 session → 直接渲染 `{children}`

## 3. 清理 Monitoring 頁 inline 導覽

- [x] 3.1 移除 `app/admin/monitoring/page.tsx` 標題列的 inline 導覽按鈕（密碼查詢、封面索引、錯誤日誌、登出），保留頁面其餘內容

## 4. 版本與文件

- [x] 4.1 更新 `config/version.json` patch 版號 +1
- [x] 4.2 依 `.ai-rules.md` 重新產生 `README-AI.md`
