## Context

首頁（`app/page.tsx`）目前為 Server Component（edge runtime），直接呼叫 `queryPhotoIndex()` 取得日期列表並渲染。需在不修改其餘相簿路由的前提下，讓首頁能依環境變數切換「顯示相簿」或「直接導向登入頁」。

## Goals / Non-Goals

**Goals:**
- 首頁讀取 `NEXT_PUBLIC_GALLERY_ENABLED`，唯有值為 `'true'` 才顯示日期列表
- 其他值（含未設定）直接 `redirect('/album/login')`，不執行任何 Firestore 查詢

**Non-Goals:**
- 不影響 `/gallery/**`、`/album/**` 等子路由
- 不做後台 UI 開關
- 不快取或紀錄 redirect 行為

## Decisions

### 1. 使用 `NEXT_PUBLIC_` 前綴

**選擇：** `NEXT_PUBLIC_GALLERY_ENABLED`
**理由：** 首頁為 Server Component，`process.env.NEXT_PUBLIC_*` 在 build time 內嵌，邊緣環境（Cloudflare Pages）同樣可讀。若改用非 `NEXT_PUBLIC_` 變數，在 edge runtime 下需確認 binding，增加複雜度。

### 2. redirect 於 Server Component 最頂層

**選擇：** 在 `HomePage` async function 最開頭判斷並呼叫 Next.js `redirect()`
**理由：** 在 Firestore 查詢之前 redirect，完全省略 I/O 成本；Client Component 的 `useRouter().push()` 無法在 SSR 階段使用。

### 3. 預設行為 = 關閉

**選擇：** `process.env.NEXT_PUBLIC_GALLERY_ENABLED !== 'true'` 即 redirect
**理由：** 安全預設值（secure by default）——環境變數未設定時自動關閉，避免忘記設定而意外開放。

## Risks / Trade-offs

- **Build time 快取** → `NEXT_PUBLIC_*` 在 build time 確定，修改後需重新部署才生效。Mitigation：這是預期行為，文件說明即可。
- **誤設環境變數** → 若 Cloudflare Pages 環境變數設定錯誤（如 `True`、`1`），相簿仍會關閉。Mitigation：文件明確說明需設為字串 `true`。

## Migration Plan

1. 修改 `app/page.tsx`，加入 redirect 邏輯
2. Cloudflare Pages 環境變數：
   - 活動進行中（開放）：`NEXT_PUBLIC_GALLERY_ENABLED=true`
   - 活動結束（關閉）：移除變數或設為其他值
3. 重新部署生效
