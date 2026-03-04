# README-AI.md

> AI 工作上下文文件 — 依 `.ai-rules.md` 自動產生，版本 v0.1.14

---

## 1. 專案核心目標 (Core Objective)

logos72photo 是攝影活動現場的多機同步拍照系統，支援多台 iPhone 依裝置本地時鐘定時拍照（cron 於每 5 分鐘週期的第 4 分觸發，倒數 10 秒後拍照）、自動上傳影像，並提供即時監控儀表板供工作人員確認裝置狀態。

---

## 2. 技術棧 (Tech Stack)

| 層級 | 技術 | 版本 |
|---|---|---|
| 框架 | Next.js (App Router) | ^15.5.2 |
| 語言 | TypeScript + React | React 19.2.3 |
| 樣式 | Tailwind CSS + shadcn/ui | Tailwind 4.0.0 |
| 資料庫 | Firebase Firestore + RTDB | firebase ^12.9.0 |
| 物件儲存 | Cloudflare R2 | — |
| 部署 | Cloudflare Pages | @cloudflare/next-on-pages ^1.13.16 |

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
    ├── canvas 截圖 → Cloudflare R2 上傳
    └── Firestore 寫入拍照紀錄 + 心跳

監控儀表板 (/admin/monitoring)
    └── Firestore 即時訂閱 → 裝置狀態卡片
```

---

## 4. 核心資料模型 (Data Schema)

**Firestore `devices/{deviceId}`**
- `lastHeartbeat`: Timestamp — 最後心跳時間
- `lastPhoto`: Timestamp — 最後拍照時間
- `status`: `'idle' | 'countdown' | 'shooting' | 'uploading' | 'error'`

**Firebase RTDB `sync/server_time`**
- 數值型 Timestamp，伺服器每 10 分鐘更新，裝置用於計算與伺服器的時差（顯示於狀態列）

---

## 5. 關鍵業務邏輯 (Business Logic)

- **本地定時拍照**（v0.1.14 更新）：cron（`4-59/5 * * * *`）於每 5 分鐘週期的第 4 分觸發（HH:04/09/14…）；裝置倒數 **10 秒**後拍照；相機狀態列時間以**上午/下午 H:MM:SS** 格式顯示
- **時間同步**（v0.1.13 新增）：RTDB `sync/server_time` 每 10 分鐘由伺服器寫入；裝置計算 `serverTime - Date.now()` 並顯示時差於狀態列，供現場確認裝置時間偏差
- **iPhone 解析度最大化**：偵測 `navigator.userAgent` 含 `'iPhone'` 時，`getUserMedia` constraints 加入 `width/height: { ideal: 9999 }`
- **心跳在線判斷**：距上次心跳 ≤30s 為在線（綠燈），>30s 為離線（灰燈）
- **裝置路由綁定**：`/camera1` → `iphone-1`，`/camera2` → `iphone-2`，device_id 於路由層硬綁定
- **PWA standalone 模式**：相機功能不受 standalone 限制，Safari 直開亦可正常使用

---

## 6. 開發規範 (Coding Standards)

- 所有程式碼註解、文件使用**繁體中文**
- 檔案 header：`/*\n * -----\n * 元件名稱\n * 日期\n * 路徑\n * -----\n */`
- 版本號唯一來源：`config/version.json`（SemVer）
- Server Component 優先；僅需瀏覽器 API 時使用 `"use client"`
- mutation 後呼叫 `revalidatePath()`

---

## 7. 當前挑戰與任務 (Current Status & Backlog)

- **v0.1.14**（本次）— cr-spec-260304-015：拍照時間優化，倒數 15s→10s；cron 觸發提早 60 秒（`*/5`→`4-59/5`）；相機時間顯示改為 12 時制（上午/下午）
- **待手動執行**：`wrangler deploy` 部署更新後的 cron 設定至 Cloudflare Workers
- **v0.1.13** — cr-spec-260304-010：拍照機制改為本地定時觸發，RTDB 降級為時間同步
