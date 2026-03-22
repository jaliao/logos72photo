## 1. GalleryBackground — 加入 bgSrc prop、移除 opacity

- [x] 1.1 在 `app/components/GalleryBackground.tsx` 加入 `bgSrc?: string` prop 介面
- [x] 1.2 背景圖層邏輯：傳入 `bgSrc` 時以 inline `backgroundImage` 直接渲染，不套用 `gallery-bg` className；未傳入時維持現有 `gallery-bg` className + media query
- [x] 1.3 移除背景圖層的 `opacity: 0.1`

## 2. Album 頁傳入專屬背景

- [x] 2.1 `app/album/login/page.tsx`：`<GalleryBackground>` 加入 `bgSrc="/bg/album/1.png"`
- [x] 2.2 `app/album/[slotGroup]/page.tsx`：`<GalleryBackground>` 加入 `bgSrc="/bg/album/1.png"`

## 3. 版本與文件更新

- [x] 3.1 將 `config/version.json` 的 `patch` 版號 +1
- [x] 3.2 依 `.ai-rules.md` 重新產生 `README-AI.md`
