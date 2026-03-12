# README-AI.md

> AI 工作上下文文件 — 依 `.ai-rules.md` 自動產生，版本 v0.1.36

---

## 1. 專案核心目標 (Core Objective)

logos72photo 是攝影活動現場的多機同步拍照系統，支援多台 iPhone 依裝置本地時鐘定時拍照（cron 於每 5 分鐘週期的第 4 分觸發，倒數 10 秒後拍照）、自動上傳影像，並提供即時監控儀表板供工作人員確認裝置狀態。v0.1.36 集中管理縮圖 URL 至 `lib/image.ts`（`toThumb640` / `toThumb1280`），統一各情境圖片尺寸規則：grid 640、幻燈片主畫面 1280、下載 raw、iOS 分享 1280。

---

## 2. 技術棧 (Tech Stack)

| 層級 | 技術 | 版本 |
|---|---|---|
| 框架 | Next.js (App Router) | ^15.5.2 |
| 語言 | TypeScript + React | React 19.2.3 |
| 樣式 | Tailwind CSS + shadcn/ui | Tailwind 4.0.0 |
| 資料庫 | Firebase Firestore + RTDB | firebase ^12.9.0 |
| 物件儲存 | Cloudflare R2 | — |
| 部署（前端） | Cloudflare Pages | @cloudflare/next-on-pages ^1.13.16 |
| 影像處理 | @cf-wasm/photon (WASM) | ^0.0.21 |
| 影像服務 | Cloudflare Workers（logos72photo-image） | — |

---

## 3. 系統架構 (System Architecture)

```
觸發端（管理員）
    └── POST /api/trigger  (x-trigger-secret)
            └── Firebase RTDB: sync/server_time ← 匿名 PUT（時間同步用）

iPhone 相機頁面 (/camera1, /camera2)
    ├── 本地定時器：每 5 分鐘週期第 4 分（cron 觸發）→ 倒數 10 秒 → shoot()（不依賴 RTDB）
    ├── RTDB 監聽 sync/server_time → 計算時差，顯示於狀態列
    ├── getUserMedia（iPhone: 最大解析度; 其他: 預設）
    ├── canvas 截圖 → Cloudflare R2 上傳（原圖 YYYY-MM-DD/{device_id}_{ts}.jpg）
    └── Firestore 寫入拍照紀錄 + 心跳

Image Service Worker (logos72photo-image)
    ├── GET /resizing/{width}/{quality}/{r2_key}
    ├── L1: Cloudflare Cache API（邊緣節點）
    ├── L2: R2 thumbnails/{width}w_{quality}q/{r2_key}.webp（持久化）
    ├── Miss: R2 原圖 → photon WASM resize → WebP → 寫入 L1+L2
    └── 失敗降級: 302 Redirect 至 R2 原圖

監控儀表板 (/admin/monitoring)
    └── Firestore 即時訂閱 → 裝置狀態卡片（縮圖透過 Image Service 載入）

相簿頁 (/gallery/[date]/[slot]/[album])
    └── Firestore 查詢 → 格狀縮圖（透過 Image Service）→ 點擊開啟全螢幕幻燈片
            ├── 左右箭頭 / 鍵盤方向鍵 / Swipe 切換
            ├── 下載：fetch(r2Url) → Blob → Web Share API (iOS) / <a download> (其他)
            └── 分享：Clipboard API 複製 ?photo={index} 連結
```

---

## 4. 核心資料模型 (Data Schema)

**Firestore `error_logs/{docId}`**
- `device_id`: string（裝置 ID 或 'unknown'）
- `source`: string（例：`camera:blob`、`camera:upload`、`api:upload`）
- `message`: string
- `timestamp`: number（Unix ms）
- `date`: string（YYYY-MM-DD 台灣時間，供查詢過濾）
- `expires_at`: string（ISO 字串，7 天後 Firestore TTL 自動刪除）

**Firestore `devices/{deviceId}`**
- `device_id`: string
- `battery_level`: number | null（0-1）
- `last_heartbeat`: number（Unix ms）
- `last_photo_url`: string | null（R2 原圖 URL）
- `last_shot_at`: number | null

**Firestore `photos/{docId}`**
- `r2_url`: string（R2 原圖公開 URL）
- `timestamp`: number（Unix ms）
- `device_id`: string
- `date`: string（YYYY-MM-DD 台灣時間）
- `slot_8h`: 0 | 8 | 16
- `slot_15m`: number

**Firebase RTDB `sync/server_time`**
- 數值型 Timestamp，伺服器每 10 分鐘更新，裝置用於計算與伺服器的時差

**R2 儲存結構**
```
{bucket}/
  YYYY-MM-DD/{device_id}_{ts}.jpg     ← 原圖
  thumbnails/{width}w_{quality}q/
    YYYY-MM-DD/{device_id}_{ts}.jpg.webp  ← L2 快取縮圖
  assets/watermark.png                ← 浮水印（可選）
```

---

## 5. 關鍵業務邏輯 (Business Logic)

- **後台測試資料批次清除**（v0.1.29 新增）：`POST /api/admin/purge-date`（`x-admin-secret` 保護）；`targets[]` 控制清除範圍（r2 / photos / photo_index / error_logs / devices）；`/admin/data-cleanup` 後台 UI（日期選擇 + 勾選 + 確認 + 結果摘要）；環境變數 `NEXT_PUBLIC_ADMIN_SECRET` 供前端傳 header
- **Google Photos 風格幻燈片**（v0.1.32 新增）：`PhotoLightbox` 全面升級為 `PhotoSlideshow`；左右箭頭 + 鍵盤方向鍵 + `useSwipe` Swipe 手勢切換；左上「← 返回」關閉（移除點擊背景關閉）；下載：`fetch(r2Url)` → Blob → Web Share API（iOS）/ `<a download>`（其他），檔名 `IMG_XXXX.jpg`（4位補零相簿順序號）；分享：Clipboard API 複製 `?photo={index}` 連結 + Toast；`?photo=` param 自動開啟幻燈片
- **照片預覽頁行動排版最佳化**（v0.1.28 新增）：縮圖改 `aspect-[3/4]` 直式比例；手機 `grid-cols-1`、桌面 `sm:grid-cols-2`；幻燈片 `max-h-[85vh]` 確保直式照片完整顯示
- **時段列表頁小時格照片牆改版**（v0.1.34 新增）：`photo_index/{date}` 新增 `firstPhotos: Record<string, Record<string, string>>` 欄位（first-write-wins）；`updatePhotoIndex()` 在首次上傳時寫入封面 URL，後續不覆蓋；時段列表頁有照片小時格改以封面圖填滿（`<Image fill> + bg-black/70` 遮罩 + 白色時間文字），無照片小時格改為灰色不可點擊，移除照片張數顯示
- **時段列表頁小時格統一視覺**（v0.1.27 新增）：`photo_index/{date}` 新增 `hourCounts: Record<string, Record<string, number>>` 欄位；`updatePhotoIndex()` 每次上傳遞增對應計數；`getPhotoIndexByDate()` 回傳 `{ hours, hourCounts, firstPhotos }`
- **photo_index 反正規化索引**（v0.1.22 新增）：`photo_index/{date}` 集合儲存 slots + hours；上傳後 await 更新索引；首頁改呼叫 `queryPhotoIndex()`；slot 頁改呼叫 `getPhotoIndexByDate()`（1 read/次）；首頁讀取從最多 2000 reads 降至 ≤30
- **相簿子頁面視覺全面對齊**（v0.1.24 新增）：時段列表頁小時格 grid 與照片預覽頁照片 grid 外包 glassmorphism 卡片（`rounded-2xl bg-white/50 p-5 + boxShadow: 0 4px 20px rgba(0,0,0,0.7)`）；進場 fadeIn 300ms；h1 統一為 `text-2xl text-zinc-900`；subtitle 統一為 `text-zinc-700`
- **相簿子頁面視覺統一**（v0.1.21 新增）：時段列表頁（slot）與照片預覽頁（album）加入 `GalleryBackground`；標題加 `textShadow`；slot 頁小時卡片套用 `bg-zinc-800/50`；返回連結改為 `text-white/70`
- **相簿首頁 Glassmorphism**（v0.1.20 新增）：日期卡片 `bg-white/50` + 深色 box-shadow；有照片時段格 `bg-zinc-800/50`；無照片時段格維持 `bg-zinc-100`（不透明）；首頁 `<h1>` 加 `textShadow: '0 1px 8px rgba(0,0,0,0.4)'`
- **相簿首頁卡片動畫**（v0.1.19 新增）：`GalleryDateList` Client Component；進場 staggered fadeIn（80ms × index，400ms）；退場 fadeOut（300ms）後 `router.push()`；exiting guard 防重複觸發
- **相簿首頁動態背景**（v0.1.18 新增）：`GalleryBackground` Server Component；固定使用 `/bg/1.png`（v0.1.31 起由隨機改固定）；白晝↔黑夜 CSS `@keyframes dayNightCycle`（5 keyframe × 2s，opacity 0.7，右上暖色/左下深色，10s 無限循環）
- **錯誤日誌**（v0.1.17 新增）：CameraClient 三個 catch 點補 `logError`（fire-and-forget 呼叫 `/api/log-error`）；`/api/upload` catch 直接 Admin SDK 寫入；後台 `/admin/errors` 依台灣時間日期查詢，TTL 7 天自動清除；Firestore TTL policy 需在 Console 手動設定 `expires_at` 欄位
- **Image Service**（v0.1.15 新增）：獨立 Cloudflare Worker，路由 `/resizing/{width}/{quality}/{r2_key}`；`@cf-wasm/photon` WASM 處理；兩層快取（Cache API + R2）；失敗 302 降級；`WATERMARK_ENABLED` 控制浮水印；前端 `ThumbnailImage` 元件含 onError fallback
- **本地定時拍照**（v0.1.14）：cron（`4-59/5 * * * *`）於每 5 分鐘週期的第 4 分觸發；裝置倒數 **10 秒**後拍照
- **時間同步**（v0.1.13）：RTDB `sync/server_time` 每 10 分鐘由伺服器寫入；裝置顯示時差於狀態列
- **iPhone 解析度最大化**：偵測 `navigator.userAgent` 含 `'iPhone'` 時，`getUserMedia` 加入 `width/height: { ideal: 9999 }`
- **心跳在線判斷**：距上次心跳 ≤30s 為在線（綠燈），>30s 為離線

---

## 6. 開發規範 (Coding Standards)

- 所有程式碼註解、文件使用**繁體中文**
- 檔案 header：`/*\n * -----\n * 元件名稱\n * 日期\n * 路徑\n * -----\n */`
- 版本號唯一來源：`config/version.json`（SemVer）
- Server Component 優先；僅需瀏覽器 API 時使用 `"use client"`
- 環境變數：前端用 `NEXT_PUBLIC_IMAGE_SERVICE_URL`；Worker 用 `R2_PUBLIC_URL`、`WATERMARK_ENABLED`（透過 wrangler.image-service.toml）

---

## 7. 當前挑戰與任務 (Current Status & Backlog)

- **v0.1.36**（本次）— cr-spec-260312-007：縮圖 URL 集中至 `lib/image.ts`；grid→640、幻燈片→1280、下載→raw、iOS 分享→1280；`SlideshowPhoto` 新增 `slideUrl` 欄位；移除各元件重複 `toThumbUrl` 定義
- **v0.1.35** — cr-spec-260312-006：後台新增「重建照片封面索引」頁面（`/admin/rebuild-first-photos`）；一鍵呼叫 `POST /api/admin/rebuild-photo-index` 回補 `firstPhotos`；顯示結果摘要與各日期明細
- **v0.1.34** — cr-spec-260312-004：時段列表頁小時格照片牆改版；有照片→封面+遮罩，無照片→灰色不可點擊，移除張數顯示；`photo_index.firstPhotos` 新欄位
- **v0.1.33** — cr-spec-260312-005：幻燈片視窗大小調整；桌機版容器 `max-h-screen` + `aspect-[3/4]`，高度不超過視窗；手機版維持 `inset-0` 滿版
- **v0.1.32** — cr-spec-260312-003：Google Photos 風格幻燈片（PhotoSlideshow）；左右切換、鍵盤方向鍵、Swipe、R2 CORS 下載、Web Share API（iOS）、分享連結、`?photo=` 自動開啟
- **v0.1.31** — cr-spec-260312-001：相簿標題改為「2026 不間斷讀經接力」、副標題改為「讀經側拍相簿」、背景圖固定使用 `/bg/1.png`
- **v0.1.30** — cr-spec-260308-004：相簿返回連結文字陰影（`textShadow: '0 1px 8px rgba(0,0,0,0.4)'`）
- **v0.1.29** — cr-spec-260304-012：後台測試資料批次清除（`/api/admin/purge-date` + `/admin/data-cleanup`）
- **v0.1.28** — cr-spec-260308-003：照片預覽頁行動排版最佳化（直式比例 + 手機單欄 + Lightbox 高度調整）
- **v0.1.27** — cr-spec-260308-002：時段列表頁小時格統一深色 + 照片張數顯示（`photo_index.hourCounts` 欄位）
- **v0.1.26** — cr-spec-260308-001：首頁日期範圍過濾（`NEXT_PUBLIC_GALLERY_START_DATE` / `NEXT_PUBLIC_GALLERY_END_DATE` 環境變數，結束日預設台灣今日）
- **v0.1.25** — cr-feat-260221-011：相簿瀏覽優化（全頁 h1 品牌統一、Lightbox 全螢幕預覽 + 下載、首頁卡片陰影加深）
- **v0.1.24** — cr-spec-260305-007：相簿子頁面全面對齊首頁視覺（glassmorphism 卡片 + fadeIn + h1 排版統一）
- **v0.1.23** — cr-spec-260304-010（續）：新增 `database.rules.json` 記錄 RTDB Security Rules（`sync/server_time` 匿名讀寫）；確認移除舊 RTDB 觸發後相機串流正常（tasks 1.1 + 3.3）
- **v0.1.22** — cr-spec-260305-006：photo_index 反正規化索引，Firestore 讀取優化（首頁 reads O(photos)→O(dates)）
- **v0.1.21** — cr-spec-260305-005：相簿子頁面視覺統一（GalleryBackground + 標題 text-shadow + 卡片半透明）
- **v0.1.20** — cr-spec-260305-004：相簿首頁 Glassmorphism（日期卡片 + 時段格半透明、標題 text-shadow）
- **v0.1.19** — cr-spec-260305-003：相簿首頁日期卡片進場淡入（staggered）+ 退場淡出（點擊攔截）動畫
- **v0.1.18** — cr-spec-260305-002：相簿首頁白晝↔黑夜動態漸層背景 + 隨機背景圖
- **v0.1.17** — cr-spec-260304-014：錯誤日誌機制全面建立；CameraClient/upload API catch 點修復；後台 `/admin/errors` 查閱頁面
- **待手動執行**：
  1. Firestore Console → `error_logs` 集合設定 TTL policy，欄位指向 `expires_at`
- **v0.1.16** — cr-fix-260305-001：修正 `pemToArrayBuffer` 返回 `ArrayBuffer`，修復 Cloudflare Pages 建置失敗
- **v0.1.15** — cr-spec-260305-001：Image Service Worker 建立（resize + WebP + 浮水印 + 兩層快取）；前端監控頁與相簿改用縮圖 URL
- **v0.1.14** — cr-spec-260304-015：拍照時間優化，倒數 15s→10s；cron 觸發提早 60 秒
- **v0.1.13** — cr-spec-260304-010：拍照機制改為本地定時觸發，RTDB 降級為時間同步
