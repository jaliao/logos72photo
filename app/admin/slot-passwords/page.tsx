/*
 * ----------------------------------------------
 * 後台：時段帳密查詢與列印
 * 2026-03-15 (Updated: 2026-03-17)
 * app/admin/slot-passwords/page.tsx
 * ----------------------------------------------
 */

'use client'

import { useState } from 'react'
import { generateAllSlotGroups, formatSlotGroupLabel } from '@/lib/slot-password'

// 可選日期清單（MMDD），供下拉選單使用
const DATE_OPTIONS: { value: string; label: string }[] = []
for (let d = 15; d <= 30; d++) {
  const mmdd = `03${String(d).padStart(2, '0')}`
  const date = new Date(`2026-03-${String(d).padStart(2, '0')}`)
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  DATE_OPTIONS.push({ value: mmdd, label: `03/${String(d).padStart(2, '0')} (${weekday})` })
}

export default function SlotPasswordsPage() {
  // 日期查詢
  const [selectedDate, setSelectedDate] = useState('')
  const [dateResults, setDateResults] = useState<Array<{ sg: string; password: string }>>([])
  const [dateLoading, setDateLoading] = useState(false)

  // 單筆查詢
  const [singleQuery, setSingleQuery] = useState('')
  const [queryResult, setQueryResult] = useState<{ password: string } | null>(null)
  const [queryError, setQueryError] = useState('')
  const [queryLoading, setQueryLoading] = useState(false)

  // 匯出
  const [downloading, setDownloading] = useState(false)

  async function handleDateQuery(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDate) return
    const mm = selectedDate.slice(0, 2)
    const dd = selectedDate.slice(2, 4)
    const dateGroups = generateAllSlotGroups(`2026-${mm}-${dd}`, `2026-${mm}-${dd}`)
    setDateResults([])
    setDateLoading(true)
    try {
      const results = await Promise.all(
        dateGroups.map(async (sg) => {
          const res = await fetch(`/api/admin/slot-passwords?slotGroup=${sg}`)
          const data = await res.json()
          return { sg, password: data.password ?? '—' }
        })
      )
      setDateResults(results)
    } finally {
      setDateLoading(false)
    }
  }

  async function handleSingleQuery(e: React.FormEvent) {
    e.preventDefault()
    setQueryError('')
    setQueryResult(null)
    if (!/^\d{8}$/.test(singleQuery)) {
      setQueryError('格式錯誤（請輸入 8 位數字）')
      return
    }
    setQueryLoading(true)
    try {
      const res = await fetch(`/api/admin/slot-passwords?slotGroup=${singleQuery}`)
      const data = await res.json()
      if (!res.ok) { setQueryError(data.error ?? '查詢失敗'); return }
      setQueryResult(data)
    } catch {
      setQueryError('網路錯誤')
    } finally {
      setQueryLoading(false)
    }
  }

  async function handleExport() {
    setDownloading(true)
    try {
      const res = await fetch('/api/admin/slot-passwords/export')
      if (!res.ok) { alert('匯出失敗'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `slot-passwords-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('網路錯誤')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-900">時段帳密管理</h1>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        {/* 日期查詢 */}
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">日期查詢</h2>
          <form onSubmit={handleDateQuery} className="flex gap-2">
            <select
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setDateResults([]) }}
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
            >
              <option value="">選擇日期…</option>
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!selectedDate || dateLoading}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {dateLoading ? '查詢中…' : '查詢'}
            </button>
          </form>

          {dateResults.length > 0 && (
            <div className="mt-3 max-h-80 overflow-y-auto">
              <p className="mb-2 text-xs text-zinc-500">共 {dateResults.length} 筆</p>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b text-left text-xs text-zinc-500">
                    <th className="pb-2 font-medium">時段</th>
                    <th className="pb-2 font-medium">帳號</th>
                    <th className="pb-2 font-medium">密碼</th>
                  </tr>
                </thead>
                <tbody>
                  {dateResults.map(({ sg, password }) => (
                    <tr key={sg} className="border-b border-zinc-50 hover:bg-zinc-50">
                      <td className="py-1.5 text-zinc-600">{formatSlotGroupLabel(sg)}</td>
                      <td className="py-1.5 font-mono text-zinc-900">{sg}</td>
                      <td className="py-1.5 font-mono font-medium text-zinc-900">{password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 單筆查詢 */}
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">單筆查詢</h2>
          <form onSubmit={handleSingleQuery} className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={singleQuery}
              onChange={(e) => setSingleQuery(e.target.value.replace(/\D/g, ''))}
              placeholder="帳號（8 碼）"
              className="w-40 rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-500"
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
              <span className="text-sm text-zinc-600">{formatSlotGroupLabel(singleQuery)}</span>
              <span className="mx-2 font-mono text-sm text-zinc-500">{singleQuery}</span>
              <span className="mx-2 text-zinc-400">→</span>
              <span className="font-mono text-lg font-bold text-zinc-900">{queryResult.password}</span>
            </div>
          )}
        </section>
      </div>

      {/* 匯出與列印 */}
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700">匯出與列印</h2>
        <p className="mb-4 text-xs text-zinc-500">資料範圍：2026/03/25 18:30 – 2026/03/30 23:45</p>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={downloading}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {downloading ? '匯出中…' : '匯出 Excel'}
          </button>
          <a
            href="/admin/slot-passwords/print"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            列印全部帳密
          </a>
          <a
            href="/admin/slot-passwords/postcard"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-600"
          >
            列印明信片
          </a>
        </div>
      </section>
    </div>
  )
}
