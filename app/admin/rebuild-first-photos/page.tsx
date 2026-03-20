/*
 * ----------------------------------------------
 * 後台：重建照片封面索引（firstPhotos）
 * 2026-03-12
 * app/admin/rebuild-first-photos/page.tsx
 * ----------------------------------------------
 */

'use client'

export const runtime = 'edge'

import { useState } from 'react'

type RebuildResult = { date: string; slots: number[]; status: string }

type ApiResponse = {
  ok: boolean
  message?: string
  results?: RebuildResult[]
  error?: string
}

export default function RebuildFirstPhotosPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [results, setResults] = useState<RebuildResult[] | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  async function handleRebuild() {
    const secret = process.env.NEXT_PUBLIC_ADMIN_SECRET
    if (!secret) {
      setApiError('環境變數 NEXT_PUBLIC_ADMIN_SECRET 未設定')
      return
    }

    setLoading(true)
    setMessage(null)
    setResults(null)
    setApiError(null)

    try {
      const res = await fetch('/api/admin/rebuild-photo-index', {
        method: 'POST',
        headers: { 'x-admin-secret': secret },
      })

      const json = (await res.json()) as ApiResponse

      if (!res.ok || !json.ok) {
        setApiError(json.error ?? `伺服器錯誤（${res.status}）`)
      } else {
        setMessage(json.message ?? '重建完成')
        setResults(json.results ?? [])
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
        <h1 className="mb-1 text-xl font-bold">重建照片封面索引</h1>
        <p className="mb-6 text-sm text-zinc-400">
          掃描所有日期的照片，回補 <code className="rounded bg-zinc-800 px-1">photo_index.firstPhotos</code> 欄位。
          操作為冪等，可重複執行。
        </p>

        {/* 執行按鈕 */}
        <button
          onClick={handleRebuild}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '重建中…' : '執行重建'}
        </button>

        {/* API 錯誤 */}
        {apiError && (
          <p className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
            錯誤：{apiError}
          </p>
        )}

        {/* 成功結果 */}
        {message && (
          <div className="mt-6">
            <p className="mb-3 rounded-lg bg-zinc-900 p-3 text-sm font-medium text-green-400">
              ✓ {message}
            </p>

            {results && results.length > 0 && (
              <details className="rounded-lg bg-zinc-900">
                <summary className="cursor-pointer px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200">
                  各日期明細（{results.length} 個日期）
                </summary>
                <div className="divide-y divide-zinc-800 px-3 pb-2">
                  {results.map((r) => (
                    <div key={r.date} className="flex items-center justify-between py-2 text-sm">
                      <span className="font-mono text-zinc-300">{r.date}</span>
                      <span className="text-xs text-zinc-500">
                        slot: {r.slots.join(', ')} · {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
