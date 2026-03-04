/*
 * ----------------------------------------------
 * 錯誤日誌後台頁面（/admin/errors）
 * 2026-03-04
 * app/admin/errors/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'

import { queryErrorLogs } from '@/lib/firebase-rest'
import { logoutAction } from '@/app/admin/login/actions'
import type { ErrorLogDoc } from '@/lib/types'

const TW_OFFSET_MS = 8 * 60 * 60 * 1000

function todayTW(): string {
  return new Date(Date.now() + TW_OFFSET_MS).toISOString().slice(0, 10)
}

function formatTs(ts: number): string {
  return new Date(ts).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    hour12: false,
  })
}

// source 標籤顏色
function sourceColor(source: string): string {
  if (source.startsWith('camera:')) return 'bg-yellow-700 text-yellow-100'
  if (source.startsWith('api:')) return 'bg-red-800 text-red-100'
  return 'bg-zinc-600 text-zinc-200'
}

interface Props {
  searchParams: Promise<{ date?: string }>
}

export default async function ErrorsPage({ searchParams }: Props) {
  const params = await searchParams
  const date = params.date ?? todayTW()

  let logs: ErrorLogDoc[] = []
  let fetchError: string | null = null

  try {
    logs = await queryErrorLogs(date)
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err)
  }

  return (
    <main className="min-h-screen bg-zinc-900 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        {/* 標題列 */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold">錯誤日誌</h1>
            <p className="text-sm text-zinc-400">保留 7 天，自動清除</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/monitoring"
              className="rounded-lg bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-600"
            >
              監控儀表板
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

        {/* 日期選擇器 */}
        <form method="GET" className="mb-6 flex items-center gap-3">
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium hover:bg-blue-600"
          >
            查詢
          </button>
          <span className="text-xs text-zinc-500">台灣時間</span>
        </form>

        {/* 錯誤訊息 */}
        {fetchError && (
          <div className="mb-4 rounded-xl bg-red-900/50 p-4 text-sm text-red-300">
            查詢失敗：{fetchError}
          </div>
        )}

        {/* 結果列表 */}
        {!fetchError && logs.length === 0 ? (
          <p className="text-center text-zinc-500 py-12">
            {date} 無錯誤紀錄
          </p>
        ) : (
          <div className="space-y-2">
            <p className="mb-3 text-xs text-zinc-500">{date}，共 {logs.length} 筆</p>
            {logs.map((log, i) => (
              <div key={i} className="rounded-xl bg-zinc-800 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sourceColor(log.source)}`}>
                    {log.source}
                  </span>
                  <span className="text-xs text-zinc-400">{log.device_id}</span>
                  <span className="ml-auto text-xs text-zinc-500">{formatTs(log.timestamp)}</span>
                </div>
                <p className="break-all font-mono text-xs text-red-300">{log.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
