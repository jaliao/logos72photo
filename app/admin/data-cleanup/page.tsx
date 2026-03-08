/*
 * ----------------------------------------------
 * 後台：測試資料批次清除
 * 2026-03-08
 * app/admin/data-cleanup/page.tsx
 * ----------------------------------------------
 */

'use client'

import { useState } from 'react'

const TARGETS = [
  { id: 'r2', label: 'R2 原圖', desc: `{date}/ 前綴下所有 .jpg` },
  { id: 'photos', label: 'Firestore photos', desc: 'date 欄位符合的所有文件' },
  { id: 'photo_index', label: 'Firestore photo_index', desc: `photo_index/{date} 文件` },
  { id: 'error_logs', label: 'Firestore error_logs', desc: 'date 欄位符合的所有文件' },
  { id: 'devices', label: 'Firestore devices', desc: '清除所有裝置的照片欄位（last_photo_url、last_shot_at）' },
] as const

type TargetId = (typeof TARGETS)[number]['id']

type PurgeResult = { deleted?: number; updated?: number; error?: string }

// 台灣今日 YYYY-MM-DD
function taiwanToday(): string {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export default function DataCleanupPage() {
  const [date, setDate] = useState(taiwanToday)
  const [selected, setSelected] = useState<Set<TargetId>>(
    new Set(['r2', 'photos', 'photo_index', 'error_logs']),
  )
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, PurgeResult> | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  function toggleTarget(id: TargetId) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleSubmit() {
    if (selected.size === 0) return alert('請至少選擇一個清除目標')

    const targetLabels = TARGETS.filter((t) => selected.has(t.id))
      .map((t) => t.label)
      .join('、')
    const confirmed = window.confirm(
      `確定要清除以下資料？\n\n日期：${date}\n目標：${targetLabels}\n\n此操作無法復原！`,
    )
    if (!confirmed) return

    setLoading(true)
    setResults(null)
    setApiError(null)

    try {
      const res = await fetch('/api/admin/purge-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET ?? '',
        },
        body: JSON.stringify({ date, targets: Array.from(selected) }),
      })

      const json = (await res.json()) as { ok: boolean; results?: Record<string, PurgeResult>; error?: string }

      if (!res.ok || !json.ok) {
        setApiError(json.error ?? `伺服器錯誤（${res.status}）`)
      } else {
        setResults(json.results ?? {})
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-1 text-xl font-bold">測試資料清除</h1>
        <p className="mb-6 text-sm text-zinc-400">依日期批次清除 R2 與 Firestore 測試資料，操作無法復原</p>

        {/* 日期選擇 */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-zinc-300">清除日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* 目標勾選 */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-zinc-300">清除目標</p>
          <div className="space-y-2">
            {TARGETS.map((t) => (
              <label key={t.id} className="flex items-start gap-3 cursor-pointer rounded-lg bg-zinc-900 p-3">
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggleTarget(t.id)}
                  className="mt-0.5 accent-red-500"
                />
                <div>
                  <span className="text-sm font-medium">{t.label}</span>
                  <p className="text-xs text-zinc-500">{t.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 執行按鈕 */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? '清除中…' : '執行清除'}
        </button>

        {/* API 錯誤 */}
        {apiError && (
          <p className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
            錯誤：{apiError}
          </p>
        )}

        {/* 清除結果 */}
        {results && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-zinc-300">清除結果</p>
            <div className="space-y-2">
              {Object.entries(results).map(([target, result]) => {
                const label = TARGETS.find((t) => t.id === target)?.label ?? target
                const isError = Boolean(result.error)
                return (
                  <div
                    key={target}
                    className={`rounded-lg p-3 text-sm ${isError ? 'bg-red-950 text-red-300' : 'bg-zinc-900 text-zinc-200'}`}
                  >
                    <span className="font-medium">{label}：</span>
                    {result.error
                      ? `失敗 — ${result.error}`
                      : result.updated !== undefined
                        ? `已更新 ${result.updated} 筆裝置`
                        : `已刪除 ${result.deleted ?? 0} 筆`}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
