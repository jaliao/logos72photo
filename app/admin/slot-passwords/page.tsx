/*
 * ----------------------------------------------
 * 後台：時段帳密查詢與列印
 * 2026-03-15 (Updated: 2026-03-16)
 * app/admin/slot-passwords/page.tsx
 * ----------------------------------------------
 */

'use client'

import { useState } from 'react'
import { generateAllSlotGroups, formatSlotGroupLabel } from '@/lib/slot-password'

const ALL_GROUPS = generateAllSlotGroups('2026-03-15', '2026-03-30')
const PAGE_SIZE = 48

export default function SlotPasswordsPage() {
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState<{ password: string } | null>(null)
  const [queryError, setQueryError] = useState('')
  const [queryLoading, setQueryLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [tablePasswords, setTablePasswords] = useState<Record<string, string>>({})
  const [tableLoading, setTableLoading] = useState(false)

  const totalPages = Math.ceil(ALL_GROUPS.length / PAGE_SIZE)
  const pageGroups = ALL_GROUPS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  async function handleQuery(e: React.FormEvent) {
    e.preventDefault()
    setQueryError('')
    setQueryResult(null)
    if (!/^\d{8}$/.test(query)) {
      setQueryError('格式錯誤（請輸入 8 位數字）')
      return
    }
    setQueryLoading(true)
    try {
      const res = await fetch(`/api/admin/slot-passwords?slotGroup=${query}`)
      const data = await res.json()
      if (!res.ok) { setQueryError(data.error ?? '查詢失敗'); return }
      setQueryResult(data)
    } catch {
      setQueryError('網路錯誤')
    } finally {
      setQueryLoading(false)
    }
  }

  async function loadPagePasswords() {
    setTableLoading(true)
    const results: Record<string, string> = {}
    await Promise.all(
      pageGroups.map(async (sg) => {
        if (tablePasswords[sg]) { results[sg] = tablePasswords[sg]; return }
        const res = await fetch(`/api/admin/slot-passwords?slotGroup=${sg}`)
        const data = await res.json()
        if (data.password) results[sg] = data.password
      })
    )
    setTablePasswords((prev) => ({ ...prev, ...results }))
    setTableLoading(false)
  }

return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-900">時段帳密管理</h1>

      {/* 單筆查詢 */}
      <section className="mb-8 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">單筆查詢</h2>
        <form onSubmit={handleQuery} className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={query}
            onChange={(e) => setQuery(e.target.value.replace(/\D/g, ''))}
            placeholder="分組號碼（8 碼）"
            className="w-40 rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={queryLoading}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {queryLoading ? '查詢中…' : '查詢'}
          </button>
        </form>
        {queryError && <p className="mt-2 text-sm text-red-600">{queryError}</p>}
        {queryResult && (
          <div className="mt-3 rounded-lg bg-zinc-50 p-3">
            <span className="font-mono text-sm text-zinc-600">{query}</span>
            <span className="mx-2 text-zinc-400">→</span>
            <span className="font-mono text-lg font-bold text-zinc-900">{queryResult.password}</span>
          </div>
        )}
      </section>

      {/* 全部帳密表格 */}
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">
            全部帳密（{ALL_GROUPS.length} 組，2026/03/15–03/30）
          </h2>
          <div className="flex gap-2">
            <button
              onClick={loadPagePasswords}
              disabled={tableLoading}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              {tableLoading ? '載入中…' : '顯示本頁密碼'}
            </button>
            <a
              href="/admin/slot-passwords/print"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-white hover:bg-zinc-700"
            >
              列印全部帳密
            </a>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-zinc-500">
              <th className="pb-2 font-medium">分組號碼</th>
              <th className="pb-2 font-medium">時段</th>
              <th className="pb-2 font-medium">密碼</th>
            </tr>
          </thead>
          <tbody>
            {pageGroups.map((sg) => (
              <tr key={sg} className="border-b border-zinc-50 hover:bg-zinc-50">
                <td className="py-1.5 font-mono text-zinc-900">{sg}</td>
                <td className="py-1.5 text-zinc-600">{formatSlotGroupLabel(sg)}</td>
                <td className="py-1.5 font-mono font-medium text-zinc-900">
                  {tablePasswords[sg] ?? '——'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分頁控制 */}
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
          <span>第 {page + 1} / {totalPages} 頁</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded px-2 py-1 hover:bg-zinc-100 disabled:opacity-30"
            >
              ← 上一頁
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="rounded px-2 py-1 hover:bg-zinc-100 disabled:opacity-30"
            >
              下一頁 →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
