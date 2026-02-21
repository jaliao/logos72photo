## Context

目前相機頁面 `/camera` 使用 `process.env.NEXT_PUBLIC_DEVICE_ID`（build-time 環境變數）作為唯一 device_id 來源。正式環境僅部署一個 build，所有裝置訪問同一 URL 時取得相同 ID，導致：
- 兩台 iPhone 在監控儀表板中重疊為同一裝置
- 任何瀏覽器（電腦、手機）開啟頁面都會以相機模式運作，送出心跳與照片

## Goals / Non-Goals

**Goals:**
- 以獨立路由（`/camera1`、`/camera2`）區分兩台 iPhone，device_id 硬綁定於路由層
- 限制相機功能只在 PWA standalone 模式（從主畫面圖示開啟）下啟動
- 非 standalone 模式顯示安裝引導，防止多實例同時搶佔同一 device_id

**Non-Goals:**
- 支援三台以上相機（未來擴充另行規劃）
- 實作裝置認證（無 token、無密碼）
- 偵測同一 device_id 是否有多個 standalone 實例同時運作

## Decisions

### 決策 1：路由分離（`/camera1`、`/camera2`）vs. URL query param（`?device=iphone-1`）

**選擇：路由分離**

| | 路由分離 | Query Param |
|--|--|--|
| PWA 主畫面圖示 | 各有獨立 URL，iOS 視為不同 app | 同一 start_url，需額外 manifest 處理 |
| 誤操作風險 | 低（URL 本身即識別） | 高（param 容易被省略或複製錯） |
| 實作複雜度 | 低（新增兩個 page.tsx） | 中（需 useSearchParams + Suspense 邊界） |

路由分離最符合 iOS PWA 的「不同 URL = 不同 app」語意，無需額外設定 manifest。

### 決策 2：`CameraClient` 改為 prop 傳入 `deviceId`

原本從 `process.env.NEXT_PUBLIC_DEVICE_ID` 讀取，改為由各 page.tsx 以 prop 傳入。

- `camera1/page.tsx` → `<CameraClient deviceId="iphone-1" />`
- `camera2/page.tsx` → `<CameraClient deviceId="iphone-2" />`
- `camera/page.tsx` → `<CameraClient deviceId={process.env.NEXT_PUBLIC_DEVICE_ID ?? 'iphone-unknown'} />`（向下相容）

### 決策 3：standalone 偵測使用 `window.matchMedia('(display-mode: standalone)')` + iOS `navigator.standalone`

標準方式為 `matchMedia`，iOS 額外支援 `navigator.standalone`（非標準但可靠）。兩者 OR 合併，確保 iOS 與其他平台均能正確偵測。

偵測邏輯放在 `useEffect`（client-only），SSR 階段回傳 `null`（畫面空白），避免 hydration mismatch。

### 決策 4：非 standalone 模式 → 完全不啟動相機功能

非 standalone 下：
- 不呼叫 `navigator.mediaDevices.getUserMedia`
- 不掛載 Firebase RTDB 監聽器
- 不發送心跳

這樣即使有人在電腦瀏覽器開啟相機 URL，也不會污染 Firestore devices 集合或佔用心跳。

## Risks / Trade-offs

- **SSR 閃爍**：`isStandalone` 初始為 `null`，頁面載入後才判斷，約有一幀空白畫面 → 可接受，相機頁面為全黑背景，感知不明顯
- **iOS Safari 限制**：`navigator.standalone` 在非 iOS 平台回傳 `undefined`，OR 邏輯確保 fallback 至 `matchMedia` → 已處理
- **開發者測試不便**：開發時需從主畫面圖示開啟才能看到相機 → 可用 `/camera?debug=1` 或直接使用原 `/camera` 路由測試（未列入本次 scope）

## Migration Plan

1. 部署新 build（含 `/camera1`、`/camera2` 路由）
2. iPhone 1：Safari 開啟 `https://logos72photo.pages.dev/camera1` → 加入主畫面（圖示名稱「接力相機 1」）
3. iPhone 2：Safari 開啟 `https://logos72photo.pages.dev/camera2` → 加入主畫面（圖示名稱「接力相機 2」）
4. 舊的 `/camera` 主畫面圖示可刪除（不影響系統運作）
5. 驗證：開啟監控儀表板，確認 `iphone-1` 與 `iphone-2` 兩張卡片均顯示「連線中」

**Rollback：** 無破壞性變更，原 `/camera` 路由保留，可隨時回退使用。

## Open Questions

- 是否需要在監控儀表板標示「iphone-1 = 前鏡頭/後鏡頭」等實體標籤？（目前兩台均使用後鏡頭 `facingMode: 'environment'`）
