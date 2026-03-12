## Context

`toThumbUrl(r2Url, width, quality)` 目前重複定義於兩個檔案，縮圖尺寸硬編碼於元件內。`PhotoSlideshow` 的 `SlideshowPhoto` 目前只有一個 `thumbUrl`（1280），用於 grid 顯示、幻燈片主畫面與 iOS 分享，三者共用同一 URL。

現有 Image Service Worker 路由：`GET {IMAGE_SERVICE_URL}/resizing/{width}/{quality}/{r2_key}`

## Goals / Non-Goals

**Goals:**
- 新增 `lib/image.ts`，集中定義 `toThumbUrl`、`toThumb640`、`toThumb1280`
- 每小時相簿 grid 改用 640 縮圖（降低流量）
- 幻燈片主畫面與 iOS 分享改用 1280 縮圖（透過新 `slideUrl` 欄位）
- 下載保持 raw R2 URL（不變）

**Non-Goals:**
- 不更動 Image Service Worker 本身
- 不調整監控頁縮圖尺寸（維持 640）
- 不新增其他尺寸

## Decisions

### 決策 1：`lib/image.ts` 匯出三個函式

```typescript
toThumbUrl(r2Url: string, width: number, quality: number): string
toThumb640(r2Url: string): string  // width=640, quality=80
toThumb1280(r2Url: string): string // width=1280, quality=85
```

`toThumb640` / `toThumb1280` 是固定品質的語意化包裝，呼叫端不再需要知道 quality 值。

### 決策 2：`SlideshowPhoto` 新增 `slideUrl`

```typescript
interface SlideshowPhoto {
  r2Url: string    // raw，用於下載
  thumbUrl: string // 640，用於 grid 縮圖
  slideUrl: string // 1280，用於幻燈片主畫面 + iOS 分享
  alt: string
  filename: string
}
```

分拆 `thumbUrl`（640 grid）與 `slideUrl`（1280 幻燈片）使各情境職責明確，元件不需內部轉換。

### 決策 3：iOS Web Share API 改用 `slideUrl` fetch

`handleDownload` 中 `fetch(current.r2Url)` 僅用於下載（保持 raw）。
`handleShare` 目前只做剪貼簿分享（不 fetch 圖片），無需修改。
iOS 分享走的是 `handleDownload`（Web Share API with file），此處 fetch 改為 `current.slideUrl`。

## Risks / Trade-offs

| 風險 | 緩解方式 |
|------|----------|
| 舊 `SlideshowPhoto` 呼叫端未傳 `slideUrl` → TypeScript 編譯錯誤 | `slideUrl` 設為必填，強制 album page 更新，無法靜默遺漏 |
| Image Service 未設定時 `toThumbUrl` fallback 為 r2Url | 現有邏輯保留，lib 中繼承相同行為 |
