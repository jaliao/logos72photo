# README-AI.md

> AI 工作上下文文件 — 依 `.ai-rules.md` 自動產生，版本 v0.1.17

---

## 1. 專案核心目標 (Core Objective)

logos72photo 是攝影活動現場的多機同步拍照系統，支援多台 iPhone 依裝置本地時鐘定時拍照（cron 於每 5 分鐘週期的第 4 分觸發，倒數 10 秒後拍照）、自動上傳影像，並提供即時監控儀表板供工作人員確認裝置狀態。v0.1.17 新增錯誤日誌機制（Firestore `error_logs` + TTL 7 天 + 後台查閱頁面），並修復所有 catch 靜默吞錯的問題。

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
    └── Firestore 查詢 → 格狀縮圖（透過 Image Service）→ 點擊下載原圖
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

- **v0.1.17**（本次）— cr-spec-260304-014：錯誤日誌機制全面建立；CameraClient/upload API catch 點修復；後台 `/admin/errors` 查閱頁面
- **待手動執行**：
  1. Firestore Console → `error_logs` 集合設定 TTL policy，欄位指向 `expires_at`
- **v0.1.16** — cr-fix-260305-001：修正 `pemToArrayBuffer` 返回 `ArrayBuffer`，修復 Cloudflare Pages 建置失敗
- **v0.1.15** — cr-spec-260305-001：Image Service Worker 建立（resize + WebP + 浮水印 + 兩層快取）；前端監控頁與相簿改用縮圖 URL
- **v0.1.14** — cr-spec-260304-015：拍照時間優化，倒數 15s→10s；cron 觸發提早 60 秒
- **v0.1.13** — cr-spec-260304-010：拍照機制改為本地定時觸發，RTDB 降級為時間同步
