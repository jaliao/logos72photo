/*
 * ----------------------------------------------
 * 首頁：日期選擇器 + 8 小時時段按鈕（公開，無需登入）
 * 2026-02-21
 * app/page.tsx
 * ----------------------------------------------
 */

import { redirect } from 'next/navigation'

// 時段定義
const SLOTS = [
  { label: '00:00 – 08:00', value: 0 },
  { label: '08:00 – 16:00', value: 8 },
  { label: '16:00 – 24:00', value: 16 },
] as const

// 今日日期預設值
function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// Server Action：導航至相簿列表頁
async function navigateToSlot(formData: FormData) {
  'use server'
  const date = formData.get('date') as string
  const slot = formData.get('slot') as string
  redirect(`/gallery/${date}/${slot}`)
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-zinc-800">
          讀經接力照片
        </h1>
        <p className="mb-8 text-center text-sm text-zinc-500">
          選擇日期與時段，瀏覽對應的 15 分鐘相簿
        </p>

        <form action={navigateToSlot} className="flex flex-col gap-6">
          {/* 日期選擇器 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              日期
            </label>
            <input
              type="date"
              name="date"
              defaultValue={todayStr()}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              required
            />
          </div>

          {/* 8 小時大時段按鈕 */}
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700">時段</p>
            <div className="flex flex-col gap-2">
              {SLOTS.map((slot) => (
                <button
                  key={slot.value}
                  type="submit"
                  name="slot"
                  value={String(slot.value)}
                  className="w-full rounded-xl bg-zinc-800 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 active:scale-95"
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
