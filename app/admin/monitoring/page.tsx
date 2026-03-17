/*
 * ----------------------------------------------
 * 中央監控儀表板（/admin/monitoring）
 * 2026-02-21 (Updated: 2026-03-05)
 * app/admin/monitoring/page.tsx
 * ----------------------------------------------
 */

'use client'

export const runtime = 'edge'

import { useEffect, useState } from 'react'
import { ThumbnailImage } from '@/components/ThumbnailImage'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { HEARTBEAT_INTERVAL_MS, OFFLINE_THRESHOLD_MS } from '@/lib/constants'
import { logoutAction } from '@/app/admin/login/actions'
import type { DeviceDoc } from '@/lib/types'
import { toThumb640 } from '@/lib/image'

// 電量顯示
function BatteryBar({ level }: { level: number | null }) {
  if (level === null) return <span className="text-zinc-400">—</span>
  const pct = Math.round(level * 100)
  const color = pct > 30 ? 'bg-green-500' : pct > 10 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 w-20 overflow-hidden rounded-full bg-zinc-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-zinc-600">{pct}%</span>
    </div>
  )
}

// 時間格式化
function formatTs(ts: number | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
}

// 心跳狀態指示燈
function HeartbeatStatus({ ts, now }: { ts: number; now: number }) {
  const isOffline = now - ts > OFFLINE_THRESHOLD_MS
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500 animate-ping'}`} />
      {isOffline ? '失聯' : '連線中'}
    </span>
  )
}

// 裝置心跳時間（含下次心跳倒數）
function HeartbeatTimeWithCountdown({ ts, now }: { ts: number; now: number }) {
  const isOffline = now - ts > OFFLINE_THRESHOLD_MS
  const timeStr = formatTs(ts)
  if (isOffline) return <span>{timeStr}</span>
  const secsLeft = Math.max(0, Math.round((ts + HEARTBEAT_INTERVAL_MS - now) / 1000))
  return <span>{timeStr} ( 約 {secsLeft} 秒後 )</span>
}

export default function MonitoringPage() {
  const [devices, setDevices] = useState<DeviceDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState<number>(Date.now())

  // Firestore 即時監聽 devices 集合
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'devices'), (snapshot) => {
      const docs = snapshot.docs.map((d) => d.data() as DeviceDoc)
      setDevices(docs)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 每秒更新 now，驅動倒數與離線判斷
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="min-h-screen bg-zinc-900 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        {/* 標題列 */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">監控儀表板</h1>
            <p className="text-sm text-zinc-400">讀經接力相機系統狀態</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/slot-passwords"
              className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-600"
            >
              密碼查詢
            </a>
            <a
              href="/admin/rebuild-first-photos"
              className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-600"
            >
              封面索引
            </a>
            <a
              href="/admin/rebuild-first-photos"
              className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-600"
            >
              封面索引
            </a>
            <a
              href="/admin/errors"
              className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-600"
            >
              錯誤日誌
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-600"
              >
                登出
              </button>
            </form>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-zinc-500">載入中...</p>
        ) : devices.length === 0 ? (
          <p className="text-center text-zinc-500">尚無裝置資料</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {devices.map((device) => {
              const isOffline = now - device.last_heartbeat > OFFLINE_THRESHOLD_MS
              return (
                <div
                  key={device.device_id}
                  className="rounded-2xl bg-zinc-800 p-5 shadow-lg"
                >
                  {/* 裝置標題列 */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h2 className="text-lg font-semibold">{device.device_id}</h2>
                        {isOffline && (
                          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold">
                            失聯
                          </span>
                        )}
                      </div>
                      <HeartbeatStatus ts={device.last_heartbeat} now={now} />
                    </div>
                    <BatteryBar level={device.battery_level} />
                  </div>

                  {/* 最新照片縮圖（透過 image-service 載入 WebP 縮圖，失敗時 fallback 至原圖） */}
                  {device.last_photo_url ? (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <ThumbnailImage
                        src={toThumb640(device.last_photo_url)}
                        fallbackSrc={device.last_photo_url}
                        alt={`${device.device_id} 最新照片`}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 flex h-48 items-center justify-center rounded-xl bg-zinc-700 text-sm text-zinc-500">
                      尚無照片
                    </div>
                  )}

                  {/* 時間資訊 */}
                  <div className="space-y-1 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>裝置心跳</span>
                      <HeartbeatTimeWithCountdown ts={device.last_heartbeat} now={now} />
                    </div>
                    <div className="flex justify-between">
                      <span>最後拍照</span>
                      <span>{formatTs(device.last_shot_at)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
