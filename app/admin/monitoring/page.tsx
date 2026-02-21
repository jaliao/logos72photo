/*
 * ----------------------------------------------
 * 中央監控儀表板（/admin/monitoring）
 * 2026-02-21
 * app/admin/monitoring/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
// 禁止靜態渲染，確保 Firebase 在 runtime 執行
export const dynamic = 'force-dynamic'

import Image from 'next/image'
import { listDocs } from '@/lib/firebase-rest'
import type { DeviceDoc } from '@/lib/types'

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

// 心跳狀態
function HeartbeatStatus({ ts, now }: { ts: number; now: number }) {
  const isAlive = now - ts < 5 * 60_000
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isAlive ? 'text-green-600' : 'text-red-600'}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${isAlive ? 'bg-green-500 animate-ping' : 'bg-red-500'}`} />
      {isAlive ? '連線中' : '失聯'}
    </span>
  )
}

async function getDevices(): Promise<DeviceDoc[]> {
  return listDocs<DeviceDoc>('devices')
}

export default async function MonitoringPage() {
  const devices = await getDevices()
  // eslint-disable-next-line react-hooks/purity -- Server Component，不在 React render 週期中
  const now = Date.now()

  return (
    <main className="min-h-screen bg-zinc-900 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-2xl font-bold">監控儀表板</h1>
        <p className="mb-8 text-sm text-zinc-400">讀經接力相機系統狀態</p>

        {devices.length === 0 ? (
          <p className="text-center text-zinc-500">尚無裝置資料</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {devices.map((device) => (
              <div
                key={device.device_id}
                className="rounded-2xl bg-zinc-800 p-5 shadow-lg"
              >
                {/* 裝置標題列 */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{device.device_id}</h2>
                    <HeartbeatStatus ts={device.last_heartbeat} now={now} />
                  </div>
                  <BatteryBar level={device.battery_level} />
                </div>

                {/* 7.4 最新照片縮圖 */}
                {device.last_photo_url ? (
                  <div className="mb-4 overflow-hidden rounded-xl">
                    <Image
                      src={device.last_photo_url}
                      alt={`${device.device_id} 最新照片`}
                      width={600}
                      height={400}
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
                    <span>最後心跳</span>
                    <span>{formatTs(device.last_heartbeat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最後拍照</span>
                    <span>{formatTs(device.last_shot_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 手動觸發按鈕（需另外處理 Client Component） */}
        <div className="mt-8 text-center text-xs text-zinc-600">
          此頁面每次重整更新資料。如需即時更新，請升級為 Client Component 加入 Firestore 監聽。
        </div>
      </div>
    </main>
  )
}
