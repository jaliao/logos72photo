/*
 * ----------------------------------------------
 * 1 小時子相簿列表頁（依 8 小時時段）
 * 2026-02-21 (Updated: 2026-03-12)
 * app/gallery/[date]/[slot]/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
// 禁止靜態渲染，確保 Firebase 在 runtime 執行
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
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
  let firstPhotos: Record<string, string> = {}
  let error: string | undefined
  try {
    const { firstPhotos: allFirstPhotos } = await getPhotoIndexByDate(date)
    firstPhotos = allFirstPhotos[String(slot8h)] ?? {}
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
        <Link href="/" className="text-sm text-white/70 hover:text-white" style={{ textShadow: '0 1px 8px rgba(0,0,0,1)' }}>
          ← 返回
        </Link>

        <h1
          className="mb-1 mt-4 text-2xl font-bold text-zinc-900"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
        >
          2026 不間斷讀經接力
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
              const coverUrl = firstPhotos[String(albumMin)]
              const timeLabel = formatSlot15m(albumMin)

              if (coverUrl) {
                // 有照片：顯示封面背景 + 70% 遮罩 + 白色時間文字
                return (
                  <Link
                    key={albumMin}
                    href={`/gallery/${date}/${slot}/${albumMin}`}
                    className="relative overflow-hidden rounded-xl aspect-square"
                  >
                    <Image
                      src={coverUrl}
                      alt={timeLabel}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/70" />
                    <span className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white">
                      {timeLabel}
                    </span>
                  </Link>
                )
              }

              // 無照片：灰色背景，不可點擊
              return (
                <div
                  key={albumMin}
                  className="flex aspect-square items-center justify-center rounded-xl bg-zinc-500 cursor-default text-sm font-medium text-white opacity-60"
                >
                  {timeLabel}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
