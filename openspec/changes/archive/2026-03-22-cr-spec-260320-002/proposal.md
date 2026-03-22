## Why

後台各頁面目前沒有統一選單，`/admin/monitoring` 以 inline 按鈕列湊合導覽，其餘頁面完全沒有導航入口，管理員必須手動修改網址切換功能。透過 `app/admin/layout.tsx` 加入共用側邊欄／頂欄，一次套用所有後台頁面。

## What Changes

- 新建 `app/admin/layout.tsx`，包含後台共用 Shell（選單 + 登出按鈕）
- 新建 `app/components/AdminNav.tsx`（Client Component），實作後台選單 UI，active 項目高亮
- 移除 `app/admin/monitoring/page.tsx` 現有 inline 導覽按鈕列（由 layout 取代）
- 後台 login 頁（`/admin/login`）不套用 layout（維持全頁登入樣式）

**Non-goals：**
- 不修改各後台頁面的內容邏輯
- 不新增角色權限分層（所有後台共用同一 admin session）
- 不做 RWD 抽屜式側邊欄動畫（行動版可用 top bar + dropdown）

## Capabilities

### New Capabilities
- `admin-layout`：後台共用 Shell，包含頂欄品牌標誌、功能選單、登出按鈕；`/admin/login` 排除在外不套用

### Modified Capabilities
- （無 spec-level 行為變更）

## Impact

- 新增 `app/admin/layout.tsx`
- 新增 `app/components/AdminNav.tsx`
- 修改 `app/admin/monitoring/page.tsx`：移除 inline 導覽按鈕列
- 各後台頁面自動繼承 layout，無需個別修改
