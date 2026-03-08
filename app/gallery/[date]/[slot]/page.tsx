/*
 * ----------------------------------------------
 * 1 小時子相簿列表頁（依 8 小時時段）
 * 2026-02-21 (Updated: 2026-03-08)
 * app/gallery/[date]/[slot]/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
// 禁止靜態渲染，確保 Firebase 在 runtime 執行
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getPhotoIndexByDate } from '@/lib/firebase-rest'
import { formatSlot15m } from '@/lib/types'
import GalleryBackground from '@/app/components/GalleryBackground'

interface Params {
  params: Promise<{ date: string; slot: string }>
}

// 產生該大時段內所有 1 小時子相簿（共 8 個）
function generateSubAlbums(slot8h: number): number[] {
  const albums: number[] = []
  const startMin = slot8h * 60
  const endMin = startMin + 8 * 60
  for (let m = startMin; m < endMin; m += 60) {
    albums.push(m)
  }
  return albums
}

export default async function SlotPage({ params }: Params) {
  const { date, slot } = await params
  const slot8h = parseInt(slot, 10) as 0 | 8 | 16
  const albums = generateSubAlbums(slot8h)

  // 讀取 photo_index/{date} 單一文件（1 read），取代掃描 photos 集合
  let withPhotos = new Set<number>()
  let error: string | undefined
  try {
    const hoursMap = await getPhotoIndexByDate(date)
    const hours = hoursMap[String(slot8h)] ?? []
    withPhotos = new Set(hours)
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
    console.error('[SlotPage] getPhotoIndexByDate 失敗：', error)
  }

  const slotLabel =
    slot8h === 0 ? '00:00 – 08:00' : slot8h === 8 ? '08:00 – 16:00' : '16:00 – 24:00'

  return (
    <main className="relative min-h-screen px-4 py-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <GalleryBackground />
      <div className="relative z-10 mx-auto max-w-lg">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← 返回
        </Link>

        <h1
          className="mb-1 mt-4 text-2xl font-bold text-zinc-900"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
        >
          不間斷讀經接力相簿
        </h1>
        <p className="mb-6 text-sm text-zinc-700">{date} · {slotLabel}</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            查詢失敗：{error}
          </p>
        )}

        <div
          className="rounded-2xl bg-white/50 p-5"
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
            animation: 'fadeIn 300ms ease-out forwards',
            opacity: 0,
          }}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {albums.map((albumMin) => {
              const hasPhotos = withPhotos.has(albumMin)
              return (
                <Link
                  key={albumMin}
                  href={`/gallery/${date}/${slot}/${albumMin}`}
                  className={[
                    'flex flex-col items-center justify-center rounded-xl p-4 text-sm font-medium transition',
                    hasPhotos
                      ? 'bg-zinc-800/50 text-white hover:bg-zinc-700/60'
                      : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200',
                  ].join(' ')}
                >
                  {formatSlot15m(albumMin)}
                  {hasPhotos && (
                    <span className="mt-1 text-xs text-zinc-300">有照片</span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
