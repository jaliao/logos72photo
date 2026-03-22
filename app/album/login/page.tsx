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
  const [showPassword, setShowPassword] = useState(true)

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
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-8"
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
              className="w-full rounded-lg border border-zinc-300 bg-white/80 px-3 py-2 font-mono text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700">
              密碼（8 碼數字）
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-300 bg-white/80 px-3 py-2 pr-10 font-mono text-base text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-zinc-400 hover:text-zinc-600"
                tabIndex={-1}
                aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
              >
                {showPassword ? (
                  // 眼睛開（明文時顯示，點擊→隱藏）
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  // 眼睛關（隱藏時顯示，點擊→明文）
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
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
