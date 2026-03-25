/*
 * ----------------------------------------------
 * 裝置啟停切換卡片（Client Component）
 * 2026-03-25
 * app/admin/devices/DeviceToggle.tsx
 * ----------------------------------------------
 */

'use client'

import { useState, useTransition } from 'react'

interface DeviceToggleProps {
  device_id: string
  initialEnabled: boolean
}

export default function DeviceToggle({ device_id, initialEnabled }: DeviceToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    const next = !enabled
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/devices/${device_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: next }),
        })
        if (res.ok) setEnabled(next)
      } catch {
        // 靜默失敗，UI 維持原狀
      }
    })
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-800 px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-white">{device_id}</p>
        <p className={`mt-0.5 text-xs ${enabled ? 'text-green-400' : 'text-red-400'}`}>
          {enabled ? '啟用中' : '已停用'}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        className={[
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50',
          enabled
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-green-600 text-white hover:bg-green-700',
        ].join(' ')}
      >
        {isPending ? '處理中…' : enabled ? '停用' : '啟用'}
      </button>
    </div>
  )
}
