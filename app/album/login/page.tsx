/*
 * ----------------------------------------------
 * 來賓時段相簿登入頁
 * 2026-03-15
 * app/album/login/page.tsx
 * ----------------------------------------------
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GalleryBackground from '@/app/components/GalleryBackground'

export default function AlbumLoginPage() {
  const router = useRouter()
  const [slotGroup, setSlotGroup] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!/^\d{8}$/.test(slotGroup)) {
      setError('帳號格式錯誤（請輸入 8 位數字）')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/album/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotGroup, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '登入失敗，請再試一次')
        return
      }
      router.push(`/album/${slotGroup}`)
    } catch {
      setError('網路錯誤，請再試一次')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <GalleryBackground />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white/50 p-8"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
          animation: 'fadeIn 300ms ease-out forwards',
          opacity: 0,
        }}
      >
        <h1
          className="mb-1 text-2xl font-bold text-zinc-900"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
        >
          2026 不間斷讀經接力
        </h1>
        <p className="mb-6 text-sm text-zinc-600">請輸入時段帳號與密碼</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700">
              時段帳號（8 碼數字）
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={slotGroup}
              onChange={(e) => setSlotGroup(e.target.value.replace(/\D/g, ''))}
              placeholder="例：03150101"
              className="w-full rounded-lg border border-zinc-300 bg-white/80 px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700">
              密碼（8 碼數字）
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-300 bg-white/80 px-3 py-2 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? '登入中…' : '登入'}
          </button>
        </form>
      </div>
    </main>
  )
}
