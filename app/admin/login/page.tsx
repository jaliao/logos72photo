/*
 * ----------------------------------------------
 * Admin 登入頁
 * 2026-02-21
 * app/admin/login/page.tsx
 * ----------------------------------------------
 */

import { loginAction } from '@/app/admin/login/actions'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-800 p-8 shadow-xl">
        <h1 className="mb-1 text-xl font-bold text-white">管理員登入</h1>
        <p className="mb-6 text-sm text-zinc-400">讀經接力相機系統</p>

        <form action={loginAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-300">
              密碼
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-lg bg-zinc-700 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none ring-1 ring-zinc-600 focus:ring-blue-500"
              placeholder="輸入管理員密碼"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-900/50 px-3 py-2 text-sm text-red-400">
              密碼錯誤，請再試一次
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 active:bg-blue-700"
          >
            登入
          </button>
        </form>
      </div>
    </main>
  )
}
