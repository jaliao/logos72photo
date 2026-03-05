# logos72photo Project Overview

This document provides instructional context for Claude CLI interactions on the logos72photo project.

## 📚 Project Overview

logos72photo 是一個攝影作品展示與管理網站。本專案使用繁體中文（Traditional Chinese）撰寫註解與文件。

**Key Technologies:**

> ⚠️ 請依實際技術棧更新此區塊

*   **Frontend/Backend Framework:** Next.js (App Router)
*   **JavaScript Runtime & Language:** React + TypeScript
*   **Styling:** Tailwind CSS + shadcn/ui
*   **Database & ORM:** （待確認）
*   **Authentication:** （待確認）
*   **Containerization:** （待確認）

## 🚀 Building and Running

> ⚠️ 請依實際設定更新此區塊

```bash
npm install
npm run dev
npm run build
npm run lint
```

## 📝 Development Conventions

### 1. Code Comments & Documentation
*   所有程式碼註解使用**繁體中文**。
*   檔案標準 header 格式：
    ```typescript
    /*
     * ----------------------------------------------
     * Component/File Name
     * 2026-XX-XX (Updated: 2026-XX-XX)
     * path/to/file.ts
     * ----------------------------------------------
     */
    ```

### 2. Server vs Client Components
*   **預設使用 Server Components** 進行資料取得與邏輯處理。
*   僅在需要瀏覽器 API、state 或使用者互動時使用 `"use client"`。

### 3. Styling
*   **Framework:** Tailwind CSS，使用 `cn()` 做條件式 class 合併。
*   **Component Library:** shadcn/ui（基於 Radix UI）。
*   **Icons:** Tabler Icons（或依專案調整）。
*   **RWD：** 所有 UI 以**行動裝置優先（Mobile-First）** 設計。Tailwind breakpoint 從 `sm:` 向上擴展，預設樣式針對手機，桌面版為漸進增強。

### 4. Version Update（via `/opsx:apply`）
*   每次執行 `/opsx:apply` 時，**必須自動將 `config/version.json` 的 `patch` 版號 +1**。
    *   例如：`0.1.0` → `0.1.1`
*   版本格式遵循 SemVer（`major.minor.patch`）。
*   `config/version.json` 是版本號的**唯一來源（single source of truth）**。

### 5. `README-AI.md` Update（via `/opsx:apply`）
*   每次 `/opsx:apply` 執行後，**必須依照 `.ai-rules.md` 重新產生 `README-AI.md`**。
*   更新內容應反映最新版本號、資料模型、路由結構、業務邏輯與目前任務狀態。

## ⚠️ Important Pitfalls

1.  **`revalidatePath()`：** mutation 後記得呼叫，確保 Server Component 資料更新。
2.  **`Suspense` Boundaries：** 使用 `useSearchParams()` 的 Client Component 需包裹 `<Suspense>`。
3.  **`npm install` Flag：** 遇到相依衝突時使用 `--legacy-peer-deps`。
