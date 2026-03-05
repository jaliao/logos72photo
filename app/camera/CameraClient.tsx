/*
 * ----------------------------------------------
 * 相機客戶端元件（含 NoSleep、本地定時拍照、RTDB 時間同步）
 * 2026-02-21 (Updated: 2026-03-05)
 * app/camera/CameraClient.tsx
 * ----------------------------------------------
 */

'use client'

// 倒數秒數常數（收到觸發後倒數此秒數再拍照）
const COUNTDOWN_SECONDS = 10
// 比整 5 分鐘提早觸發的偏移量（cron: 4-59/5 * * * *，提前 60 秒）
const TRIGGER_OFFSET_MS = 60_000

import { useEffect, useRef, useState, useCallback } from 'react'
import { ref, onValue } from 'firebase/database'
import { getRtdb } from '@/lib/firebase-rtdb'
import { HEARTBEAT_INTERVAL_MS } from '@/lib/constants'
import { logError } from '@/lib/log-error'

// 格式化時間為「上午/下午 H:MM:SS」（12 時制）
function formatTime12(date: Date): string {
  const hours = date.getHours()
  const period = hours < 12 ? '上午' : '下午'
  const h = hours % 12 || 12
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${period}\u00A0${h}:${mm}:${ss}` // \u00A0 = non-breaking space，防止 flex 斷行
}

// 格式化時間戳為「上午/下午 H:MM:SS」，null 顯示 '—'
function formatTime(ts: number | null): string {
  if (!ts) return '—'
  return formatTime12(new Date(ts))
}

// PWA standalone 模式偵測（非 standalone → 顯示安裝引導，防止重複加入）
function InstallGuide({ deviceId, appTitle }: { deviceId: string; appTitle: string }) {
  return (
    <main className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white px-8 text-center">
      <div className="mb-6 text-5xl">📷</div>
      <h1 className="mb-2 text-xl font-bold">{appTitle}</h1>
      <p className="mb-1 text-sm text-zinc-400">裝置：{deviceId}</p>
      <p className="mb-8 text-sm text-zinc-500">請從主畫面開啟，以確保相機正常運作</p>
      <div className="rounded-2xl bg-zinc-800 p-6 text-left text-sm leading-relaxed">
        <p className="mb-3 font-semibold text-white">尚未加入主畫面？</p>
        <ol className="list-decimal list-inside space-y-2 text-zinc-300">
          <li>點擊下方工具列的「分享」圖示（□↑）</li>
          <li>選擇「加入主畫面」</li>
          <li>點擊「新增」</li>
          <li>從主畫面開啟「{appTitle}」</li>
        </ol>
      </div>
      <p className="mt-6 text-xs text-zinc-600">
        已加入主畫面請關閉此頁，從主畫面圖示重新開啟
      </p>
    </main>
  )
}

interface CameraClientProps {
  deviceId: string
  appTitle?: string
}

export default function CameraClient({ deviceId, appTitle = '接力相機' }: CameraClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nosleepRef = useRef<{ enable(): void; disable(): void } | null>(null)

  // 1.1 status union 加入 'countdown'
  const [status, setStatus] = useState<'idle' | 'countdown' | 'shooting' | 'uploading' | 'error'>('idle')
  const [lastShotAt, setLastShotAt] = useState<number | null>(null)
  const [lastHeartbeat, setLastHeartbeat] = useState<number | null>(null)
  const [flashGreen, setFlashGreen] = useState(false)
  // 裝置與伺服器的時差（ms），由 RTDB sync/server_time 計算
  const [timeDiffMs, setTimeDiffMs] = useState<number | null>(null)
  // 最後 RTDB 同步時刻
  const [lastRtdbSyncAt, setLastRtdbSyncAt] = useState<number | null>(null)
  // 下次拍照預定時刻
  const [nextShotAt, setNextShotAt] = useState<number | null>(null)
  // standalone 偵測（null = SSR 尚未判斷）
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null)
  // 1.2 前後鏡頭狀態（預設後鏡頭）
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  // 1.3 倒數秒數
  const [countdown, setCountdown] = useState(0)
  // 5.2 當前時間（每秒更新，顯示於狀態列）
  const [currentTime, setCurrentTime] = useState('')

  // 穩定 shoot 用的 ref（供倒數計時器呼叫最新閉包）
  const shootRef = useRef<() => void>(async () => { })
  // 1.4 倒數計時器 interval ID
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // 本地定時拍照 timeout ID
  const shotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // PWA standalone 模式偵測（client-only）
  useEffect(() => {
    setIsStandalone(true)
  }, [])

  // 拍照並上傳
  const shoot = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    // 3.3 guard：shooting / uploading 期間不重複拍照；countdown 結束後可正常執行
    if (!video || !canvas || status === 'shooting' || status === 'uploading') return

    setStatus('shooting')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        await logError(deviceId, 'camera:blob', 'canvas.toBlob 回傳 null，可能是相機串流中斷')
        setStatus('error')
        return
      }

      setStatus('uploading')

      try {
        const formData = new FormData()
        formData.append('photo', blob, `${deviceId}_${Date.now()}.jpg`)
        formData.append('device_id', deviceId)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`HTTP ${res.status}：${text || '上傳失敗'}`)
        }

        const now = Date.now()
        const { url } = await res.json() as { url: string }
        setLastShotAt(now)
        setStatus('idle')

        // 通知 server 更新裝置最後照片資訊（Admin SDK 寫 Firestore）
        await fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_id: deviceId, battery_level: null, last_photo_url: url, last_shot_at: now }),
        })

        // 拍照成功 → 綠色邊框閃爍
        setFlashGreen(true)
        setTimeout(() => setFlashGreen(false), 1500)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        await logError(deviceId, 'camera:upload', message)
        setStatus('error')
      }
    }, 'image/jpeg', 0.92)
  }, [deviceId, status])

  // 每次 render 同步最新的 shoot 至 shootRef，避免 RTDB 監聽器持有過期閉包
  useEffect(() => {
    shootRef.current = shoot
  }, [shoot])

  // 3.1 啟動倒數計時（收到 RTDB 觸發後呼叫）
  const startCountdown = useCallback(() => {
    // guard：非 idle 時忽略（防止倒數中再次觸發）
    if (status !== 'idle') return
    setStatus('countdown')
    setCountdown(COUNTDOWN_SECONDS)
    let remaining = COUNTDOWN_SECONDS
    countdownRef.current = setInterval(() => {
      remaining -= 1
      // 3.2 每秒遞減
      setCountdown(remaining)
      if (remaining <= 0) {
        clearInterval(countdownRef.current!)
        countdownRef.current = null
        // 倒數結束 → 執行拍照
        shootRef.current()
      }
    }, 1000)
  }, [status])

  // 同步最新的 startCountdown 至 ref，供定時器呼叫
  const startCountdownRef = useRef<() => void>(() => { })
  useEffect(() => {
    startCountdownRef.current = startCountdown
  }, [startCountdown])

  // 2.1 啟動相機串流（依賴 facingMode，切換鏡頭時重新取得串流）
  useEffect(() => {
    if (!isStandalone) return
    let stream: MediaStream | null = null

    // iPhone 偵測：使用最大解析度串流
    const isIphone = navigator.userAgent.includes('iPhone')
    const videoConstraints = isIphone
      ? { facingMode, width: { ideal: 9999 }, height: { ideal: 9999 } }
      : { facingMode }

    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: false })
      .then((s) => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      })
      .catch(() => setStatus('error'))

    return () => {
      // 停止舊串流所有 track
      stream?.getTracks().forEach((t) => t.stop())
      // 3.4 清除倒數計時器，防止 memory leak
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }
  }, [isStandalone, facingMode])

  // NoSleep.js 啟動（防止 iPhone 休眠）
  useEffect(() => {
    if (!isStandalone) return
    import('nosleep.js').then(({ default: NoSleep }) => {
      nosleepRef.current = new NoSleep()
      const enable = () => {
        nosleepRef.current?.enable()
      }
      document.addEventListener('touchstart', enable, { once: true })
    })

    return () => {
      nosleepRef.current?.disable()
    }
  }, [isStandalone])

  // 本地定時拍照：計算距下一個整 5 分鐘的延遲並排程
  // 每次拍照結束後（status 回到 idle）重新呼叫此函式
  const scheduleNextShot = useCallback(() => {
    if (shotTimerRef.current) clearTimeout(shotTimerRef.current)
    const now = Date.now()
    const interval = 5 * 60_000
    // 計算下一個整 5 分鐘時刻，再減去 TRIGGER_OFFSET_MS（對齊 cron 4-59/5）
    const nextBoundary = Math.ceil((now + 1) / interval) * interval
    const nextShot = nextBoundary - TRIGGER_OFFSET_MS
    let delay = nextShot - now
    // 距觸發時刻不足 2 秒則跳過此輪，改排程下一個整點
    if (delay < 2000) delay += interval
    setNextShotAt(now + delay)

    // 加上這行 Log
    console.log("目前版本是否有 OFFSET?", TRIGGER_OFFSET_MS, "下次拍照時間:", new Date(now + delay).toLocaleTimeString())

    shotTimerRef.current = setTimeout(() => {
      startCountdownRef.current()
    }, delay)
  }, [])

  // 頁面載入後立即排程第一次拍照
  useEffect(() => {
    if (!isStandalone) return
    scheduleNextShot()
    return () => {
      if (shotTimerRef.current) clearTimeout(shotTimerRef.current)
    }
  }, [isStandalone, scheduleNextShot])

  // status 回到 idle 後重新排程（拍照完成 → 安排下一次）
  useEffect(() => {
    if (isStandalone && status === 'idle') {
      scheduleNextShot()
    }
  }, [isStandalone, status, scheduleNextShot])

  // error 自動恢復：3 秒後重設為 idle，確保排程不中斷
  useEffect(() => {
    if (!isStandalone || status !== 'error') return
    const id = setTimeout(() => setStatus('idle'), 3000)
    return () => clearTimeout(id)
  }, [isStandalone, status])

  // Firebase RTDB 監聽 sync/server_time（時間同步，不觸發拍照）
  useEffect(() => {
    if (!isStandalone) return
    const syncRef = ref(getRtdb(), 'sync/server_time')
    const unsubscribe = onValue(syncRef, (snapshot) => {
      const val: number | null = snapshot.val()
      if (!val) return
      // 計算裝置與伺服器時差（正值表示伺服器較快）
      setTimeDiffMs(val - Date.now())
      setLastRtdbSyncAt(Date.now())
    })
    return () => unsubscribe()
  }, [isStandalone])

  // 7.1 心跳：每 HEARTBEAT_INTERVAL_MS 透過 API 寫入 Firestore（Admin SDK，繞過 rules）
  useEffect(() => {
    if (!isStandalone) return
    const sendHeartbeat = async () => {
      const now = Date.now()
      setLastHeartbeat(now)

      await fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          battery_level: null,
        }),
      })
    }

    sendHeartbeat()
    const id = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS)
    return () => clearInterval(id)
  }, [deviceId, isStandalone])

  // 5.2 當前時間：每秒更新，顯示於狀態列（12 時制）
  useEffect(() => {
    const update = () => setCurrentTime(formatTime12(new Date()))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  // 2.2 切換前後鏡頭（非 idle 時禁用）
  const flipCamera = useCallback(() => {
    if (status !== 'idle') return
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }, [status])

  // SSR 或偵測中：空白畫面
  if (isStandalone === null) return null

  // 非 standalone（瀏覽器直接開啟）→ 顯示安裝引導
  if (!isStandalone) return <InstallGuide deviceId={deviceId} appTitle={appTitle} />

  // 5.1 心跳在線判斷：距上次心跳 ≤ 30 秒為在線
  const isOnline = lastHeartbeat !== null && Date.now() - lastHeartbeat <= 30_000

  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* 相機預覽 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {/* 隱藏 canvas（用於截圖） */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 4.1 / 4.2 倒數覆蓋層：countdown 狀態時顯示於 video 中央 */}
      {status === 'countdown' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="animate-pulse text-9xl font-bold text-white drop-shadow-lg">
            {countdown}
          </span>
        </div>
      )}

      {/* 綠色邊框閃爍（拍照成功回饋） */}
      {flashGreen && (
        <div className="pointer-events-none absolute inset-0 animate-pulse border-8 border-green-400" />
      )}

      {/* 2.3 鏡頭切換按鈕 */}
      <button
        onClick={flipCamera}
        disabled={status !== 'idle'}
        className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-2 text-sm text-white disabled:opacity-40"
      >
        {facingMode === 'environment' ? '🤳 前鏡頭' : '📷 後鏡頭'}
      </button>

      {/* 狀態列 */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 text-xs text-gray-300">
        <div className="flex items-center justify-between">
          <span>
            裝置：<strong>{deviceId}</strong>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {/* 5.1 以 lastHeartbeat 時間戳判斷在線狀態 */}
            <span
              className={[
                'inline-block h-2 w-2 rounded-full',
                isOnline ? 'animate-ping bg-green-400' : 'bg-gray-500',
              ].join(' ')}
            />
            {/* 5.2 相機時間（每秒更新）：whitespace-nowrap 直接掛在文字元素上，確保不斷行 */}
            <span className="whitespace-nowrap">相機時間：{currentTime || '—'}</span>
          </span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>
            {/* 4.3 即將拍照狀態：閃爍提示 */}
            {status === 'countdown' && (
              <span className="animate-pulse text-yellow-300">即將拍照</span>
            )}
            {status === 'idle' && '狀態：待機中'}
            {status === 'shooting' && '狀態：拍照中'}
            {status === 'uploading' && '狀態：上傳中'}
            {status === 'error' && <span className="text-red-400">狀態：錯誤（自動恢復中）</span>}
          </span>
          <span>最後拍照：{formatTime(lastShotAt)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>RTDB：{formatTime(lastRtdbSyncAt)}</span>
          <span>下次拍照：{formatTime(nextShotAt)}</span>
        </div>
      </div>
    </main>
  )
}
