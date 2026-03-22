## Context

個人相簿頁（`/album/[slotGroup]`）目前以 `PhotoSlideshow` 元件顯示 Firestore 照片清單。封面圖已由 Firebase Cloud Function 合成並存入 R2 `covers/{slotGroup}.jpg`，但尚未在相簿中呈現。

## Goals / Non-Goals

**Goals:**
- 封面圖顯示於照片列表第一格
- 封面不存在時不顯示空格（優雅降級）

**Non-Goals:**
- 不修改封面合成邏輯
- 封面圖不加入 Firestore，不影響照片計數
- 封面不開放下載或分享

## Decisions

### 1. 封面存在性檢查：Server 端 HEAD 請求

**選擇：** 在 Server Component（edge runtime）中對 `{R2_PUBLIC_URL}/covers/{slotGroup}.jpg` 發出 `fetch` HEAD 請求，成功（HTTP 200）才將封面加入 `slideshowPhotos` 首位。

**理由：** 在 server 端確認存在性最乾淨，不需要 client 端 onError 處理，也不會有短暫顯示破圖的問題。edge runtime 支援 `fetch`，無相容性問題。

**替代方案：** 永遠加入封面 URL，由 `<Image>` 的 `onError` 隱藏 → client 端邏輯較複雜，且可能短暫顯示破圖。

---

### 2. 封面在 slideshowPhotos 的呈現方式

**選擇：** 封面作為第一個 `SlideshowPhoto` 插入 `slideshowPhotos` 陣列，`r2Url`、`thumbUrl`、`slideUrl` 皆指向同一個封面 URL（`covers/{slotGroup}.jpg`），`alt` 為「封面」，`filename` 為 `COVER.jpg`。

**理由：** 沿用既有 `PhotoSlideshow` 元件，無需修改元件本身。封面在幻燈片中可正常瀏覽，但因 `filename` 特殊，不開放下載（下載時檔名為 `COVER.jpg` 即可接受）。

## Risks / Trade-offs

- **[風險] HEAD 請求增加頁面延遲 ~100ms** → 封面查詢與 Firestore 照片查詢可用 `Promise.all` 並行執行，實際延遲接近 0
- **[取捨] 封面圖無法獨立從幻燈片排除** → 目前 `PhotoSlideshow` 不支援「特殊第一格」，但封面作為第一張照片展示符合使用者預期
