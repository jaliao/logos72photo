/*
 * ----------------------------------------------
 * 相簿首頁：有照片的日期列表（依日期由新到舊）
 * 2026-03-05
 * app/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { queryDatesWithSlots } from '@/lib/firebase-rest'

// 時段定義
const SLOTS = [
  { label: '早', sublabel: '00–08', value: 0 },
  { label: '中', sublabel: '08–16', value: 8 },
  { label: '晚', sublabel: '16–24', value: 16 },
] as const

export default async function HomePage() {
  let dateList: Array<{ date: string; slots: Set<0 | 8 | 16> }> = []
  let error: string | null = null

  try {
    dateList = await queryDatesWithSlots()
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* 標題 */}
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">
          不間斷讀經接力相簿
        </h1>
        <p className="mb-8 text-sm text-zinc-500">依日期瀏覽拍攝紀錄</p>

        {/* 錯誤提示 */}
        {error && (
          <p className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            載入失敗：{error}
          </p>
        )}

        {/* 無資料空狀態 */}
        {!error && dateList.length === 0 && (
          <p className="text-center text-sm text-zinc-400">尚無拍攝紀錄</p>
        )}

        {/* 日期卡片列表 */}
        <div className="flex flex-col gap-4">
          {dateList.map(({ date, slots }) => (
            <div
              key={date}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              {/* 日期標題 */}
              <p className="mb-3 text-sm font-semibold text-zinc-800">{date}</p>

              {/* 三時段格 */}
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((slot) => {
                  const hasPhotos = slots.has(slot.value)
                  return (
                    <Link
                      key={slot.value}
                      href={`/gallery/${date}/${slot.value}`}
                      className={[
                        'flex flex-col items-center justify-center rounded-xl py-4 transition active:scale-95',
                        hasPhotos
                          ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                          : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200',
                      ].join(' ')}
                    >
                      <span className="text-sm font-semibold">{slot.label}</span>
                      <span className={['text-xs', hasPhotos ? 'text-zinc-400' : 'text-zinc-300'].join(' ')}>
                        {slot.sublabel}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
