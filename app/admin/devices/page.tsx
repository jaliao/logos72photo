/*
 * ----------------------------------------------
 * 後台裝置管理頁
 * 2026-03-25
 * app/admin/devices/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { getDoc } from '@/lib/firebase-rest'
import DeviceToggle from './DeviceToggle'

const KNOWN_DEVICES = ['iphone-1', 'iphone-2', 'iphone-3']

async function fetchDeviceStatus(device_id: string): Promise<boolean> {
  try {
    const doc = await getDoc<{ enabled?: boolean }>('devices', device_id)
    return doc?.enabled !== false
  } catch {
    return true
  }
}

export default async function AdminDevicesPage() {
  const devices = await Promise.all(
    KNOWN_DEVICES.map(async (device_id) => ({
      device_id,
      enabled: await fetchDeviceStatus(device_id),
    })),
  )

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-xl font-bold text-white">裝置管理</h1>
        <p className="mb-6 text-sm text-zinc-400">
          停用裝置後，相機頁面將顯示下線訊息，且上傳請求將被拒絕。
        </p>
        <div className="flex flex-col gap-3">
          {devices.map((d) => (
            <DeviceToggle key={d.device_id} device_id={d.device_id} initialEnabled={d.enabled} />
          ))}
        </div>
      </div>
    </main>
  )
}
