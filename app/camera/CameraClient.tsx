/*
 * ----------------------------------------------
 * 相機客戶端元件（含 NoSleep、RTDB 監聽、MediaDevices）
 * 2026-02-21 (Updated: 2026-02-21)
 * app/camera/CameraClient.tsx
 * ----------------------------------------------
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ref, onValue } from 'firebase/database'
import { getRtdb } from '@/lib/firebase-rtdb'

// 格式化最後連線時間
function formatTime(ts: number | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString('zh-TW')
}

export default function CameraClient() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nosleepRef = useRef<{ enable(): void; disable(): void } | null>(null)

  const [status, setStatus] = useState<'idle' | 'shooting' | 'uploading' | 'error'>('idle')
  const [lastShotAt, setLastShotAt] = useState<number | null>(null)
  const [lastHeartbeat, setLastHeartbeat] = useState<number | null>(null)
  const [flashGreen, setFlashGreen] = useState(false)
  const [warnNoTrigger, setWarnNoTrigger] = useState(false)
  // 3.1 最後收到的 RTDB 觸發時間戳記（顯示於 UI 供除錯）
  const [lastRtdbTrigger, setLastRtdbTrigger] = useState<number | null>(null)

  const lastTriggerRef = useRef<number>(Date.now())
  // 1.1 穩定 RTDB 監聽器用的 ref（初始為 no-op，在 useEffect 中同步最新 shoot）
  const shootRef = useRef<() => void>(async () => {})
  // 2.1 上次已處理的 RTDB 觸發值（初始為頁面載入時間，防止重播舊觸發）
  const lastProcessedTriggerRef = useRef<number>(Date.now())

  const deviceId = process.env.NEXT_PUBLIC_DEVICE_ID ?? 'iphone-unknown'

  // 拍照並上傳
  const shoot = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || status === 'shooting' || status === 'uploading') return

    setStatus('shooting')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setStatus('error')
        return
      }

      setStatus('uploading')

      try {
        const formData = new FormData()
        formData.append('photo', blob, `${deviceId}_${Date.now()}.jpg`)
        formData.append('device_id', deviceId)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) throw new Error('上傳失敗')

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

        // 7.2 拍照成功 → 綠色邊框閃爍
        setFlashGreen(true)
        setTimeout(() => setFlashGreen(false), 1500)
      } catch {
        setStatus('error')
      }
    }, 'image/jpeg', 0.92)
  }, [deviceId, status])

  // 1.1 每次 render 同步最新的 shoot 至 shootRef，避免 RTDB 監聽器持有過期閉包
  useEffect(() => {
    shootRef.current = shoot
  }, [shoot])

  // 啟動相機串流
  useEffect(() => {
    let stream: MediaStream | null = null

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      })
      .catch(() => setStatus('error'))

    return () => {
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // 3.2 NoSleep.js 啟動（防止 iPhone 休眠）
  useEffect(() => {
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
  }, [])

  // 3.3 Firebase RTDB 監聽 trigger/last_shot
  // 1.2 依賴改為 []，監聽器只掛載一次，callback 透過 shootRef 呼叫最新的 shoot
  useEffect(() => {
    const triggerRef = ref(getRtdb(), 'trigger/last_shot')

    const unsubscribe = onValue(triggerRef, (snapshot) => {
      const val: number | null = snapshot.val()
      if (!val) return

      // 3.1 更新 UI 顯示的 RTDB 觸發時間
      setLastRtdbTrigger(val)

      // 2.2 以「值遞增」作為觸發條件，完全避免時脈偏差問題
      if (val > lastProcessedTriggerRef.current) {
        // 2.3 先更新已處理的觸發值，再執行拍照
        lastProcessedTriggerRef.current = val
        lastTriggerRef.current = Date.now()
        setWarnNoTrigger(false)
        shootRef.current()
      }
    })

    return () => unsubscribe()
  }, [])

  // 7.1 心跳：每 30 秒透過 API 寫入 Firestore（Admin SDK，繞過 rules）
  useEffect(() => {
    const sendHeartbeat = async () => {
      const now = Date.now()
      setLastHeartbeat(now)

      type NavWithBattery = Navigator & { getBattery?: () => Promise<{ level: number }> }
      const battery = (navigator as NavWithBattery).getBattery
        ? await (navigator as NavWithBattery).getBattery!()
        : null

      await fetch('/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          battery_level: battery?.level ?? null,
        }),
      })
    }

    sendHeartbeat()
    const id = setInterval(sendHeartbeat, 30_000)
    return () => clearInterval(id)
  }, [deviceId])

  // 監控：超過 5 分鐘未收到觸發指令 → 背景轉紅
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastTriggerRef.current > 5 * 60_000) {
        setWarnNoTrigger(true)
      }
    }, 15_000)
    return () => clearInterval(id)
  }, [])

  return (
    <main
      className={[
        'relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden',
        'bg-black text-white',
        warnNoTrigger ? 'bg-red-950' : '',
      ].join(' ')}
    >
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

      {/* 綠色邊框閃爍（拍照成功回饋） */}
      {flashGreen && (
        <div className="pointer-events-none absolute inset-0 animate-pulse border-8 border-green-400" />
      )}

      {/* 狀態列 */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 text-xs text-gray-300">
        <div className="flex items-center justify-between">
          <span>
            裝置：<strong>{deviceId}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-green-400" />
            {formatTime(lastHeartbeat)}
          </span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>
            狀態：
            {status === 'idle' && '待機中'}
            {status === 'shooting' && '拍照中...'}
            {status === 'uploading' && '上傳中...'}
            {status === 'error' && '⚠️ 錯誤'}
          </span>
          <span>最後拍照：{formatTime(lastShotAt)}</span>
        </div>
        {/* 3.2 RTDB 觸發時間顯示（供現場判斷觸發鏈路是否正常） */}
        <div className="mt-1 flex justify-between">
          <span>RTDB 觸發：{formatTime(lastRtdbTrigger)}</span>
        </div>
        {warnNoTrigger && (
          <p className="mt-1 text-center font-bold text-red-400">
            ⚠️ 超過 5 分鐘未收到拍照指令
          </p>
        )}
      </div>
    </main>
  )
}
