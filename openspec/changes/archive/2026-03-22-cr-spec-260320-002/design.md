## Context

後台各頁面沒有統一導覽，`/admin/monitoring` 以 inline 按鈕列湊合，其餘頁面完全缺乏頁間導航。目前後台功能頁：

| 路由 | 功能 |
|---|---|
| `/admin` | 相簿日期列表 |
| `/admin/monitoring` | 裝置監控儀表板 |
| `/admin/slot-passwords` | 帳密查詢 |
| `/admin/data-cleanup` | 測試資料清除 |
| `/admin/rebuild-first-photos` | 封面索引重建 |
| `/admin/errors` | 錯誤日誌 |

`/admin/login` 為登入頁，不應套用後台選單。

## Goals / Non-Goals

**Goals:**
- 建立 `app/admin/layout.tsx`，自動套用所有後台頁面的共用 Shell
- 登入頁（`/admin/login`）不顯示選單
- 選單顯示 active 高亮（依目前路徑判斷）
- 移除 `monitoring/page.tsx` 現有 inline 導覽

**Non-Goals:**
- 不做 RWD 抽屜動畫
- 不新增角色權限

## Decisions

### 決策 1：layout 內依 admin_session cookie 決定是否渲染選單

`app/admin/layout.tsx` 為 Server Component，透過 `cookies()` 讀取 `admin_session`。有 session → 渲染含選單的 Shell；無 session → 直接渲染 `{children}`（即登入頁原樣）。

**替代方案：** 使用 route group `(portal)` 將登入頁與其他頁面分層 → 需搬移所有後台頁面，改動面積過大，捨棄。

**替代方案：** 在 `AdminNav` Client Component 中 `usePathname()` 判斷 `/admin/login` 則不渲染 → Client Component 初次 render 仍會閃爍選單，捨棄。

### 決策 2：選單為左側固定 Sidebar（桌面）+ 頂部折疊 bar（手機）

後台使用者多為桌面，Sidebar 提供最佳瀏覽效率。手機版收合為頂部 bar + hamburger，點擊展開選單。

實作上 Sidebar 固定寬 `w-56`，主內容區 `ml-56`（桌面），手機版 Sidebar `fixed inset-y-0 left-0 -translate-x-full` + JS 控制展開。

### 決策 3：active 高亮以 `startsWith` 判斷

`/admin` 首頁用完全匹配；其他路由（如 `/admin/slot-passwords/*`）用 `startsWith` 確保子頁面也高亮正確項目。

### 決策 4：登出放在 Sidebar 底部

`logoutAction` Server Action 已定義於 `app/admin/login/actions.ts`，直接在 Sidebar 尾端加 form 呼叫。

## Risks / Trade-offs

- **cookie 讀取需 `cookies()` import**：在 edge runtime 下 `next/headers` 部分 API 可能受限 → layout 不加 `export const runtime = 'edge'`，讓 Cloudflare Pages 以 Node.js/default runtime 執行
- **Sidebar 增加頁面最小寬度**：手機版需額外測試摺疊邏輯 → 先以頂部 bar 取代，降低複雜度

## Migration Plan

1. 新建 `app/components/AdminNav.tsx`（Client Component，含 sidebar + mobile bar）
2. 新建 `app/admin/layout.tsx`（Server Component，讀 cookie 決定是否包 shell）
3. 移除 `app/admin/monitoring/page.tsx` inline 導覽按鈕列

## Open Questions

- 選單 dark theme（延續 monitoring 的 `bg-zinc-900`）或 light theme？→ 延續 dark theme 保持一致性
