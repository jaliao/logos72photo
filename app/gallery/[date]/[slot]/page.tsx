/*
 * ----------------------------------------------
 * 15 分鐘子相簿列表頁（依 8 小時時段）
 * 2026-02-21
 * app/gallery/[date]/[slot]/page.tsx
 * ----------------------------------------------
 */

// 禁止靜態渲染，確保 Firebase 在 runtime 執行
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatSlot15m } from '@/lib/types'

interface Params {
  params: Promise<{ date: string; slot: string }>
}

// 產生該大時段內所有 15 分鐘子相簿（共 32 個）
function generateSubAlbums(slot8h: number): number[] {
  const albums: number[] = []
  const startMin = slot8h * 60
  const endMin = startMin + 8 * 60
  for (let m = startMin; m < endMin; m += 15) {
    albums.push(m)
  }
  return albums
}

// 查詢各子相簿是否有照片
async function getAlbumsWithPhotos(date: string, slot8h: number): Promise<Set<number>> {
  const q = query(
    collection(db, 'photos'),
    where('date', '==', date),
    where('slot_8h', '==', slot8h),
  )
  const snap = await getDocs(q)
  const withPhotos = new Set<number>()
  snap.forEach((doc) => {
    const data = doc.data()
    withPhotos.add(data.slot_15m as number)
  })
  return withPhotos
}

export default async function SlotPage({ params }: Params) {
  const { date, slot } = await params
  const slot8h = parseInt(slot, 10) as 0 | 8 | 16
  const albums = generateSubAlbums(slot8h)
  const withPhotos = await getAlbumsWithPhotos(date, slot8h)

  const slotLabel =
    slot8h === 0 ? '00:00 – 08:00' : slot8h === 8 ? '08:00 – 16:00' : '16:00 – 24:00'

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← 返回
        </Link>

        <h1 className="mb-1 mt-4 text-xl font-bold text-zinc-800">
          {date}
        </h1>
        <p className="mb-6 text-sm text-zinc-500">{slotLabel}</p>

        <div className="grid grid-cols-3 gap-3">
          {albums.map((albumMin) => {
            const hasPhotos = withPhotos.has(albumMin)
            return (
              <Link
                key={albumMin}
                href={`/gallery/${date}/${slot}/${albumMin}`}
                className={[
                  'flex flex-col items-center justify-center rounded-xl p-4 text-sm font-medium transition',
                  hasPhotos
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                    : 'bg-zinc-200 text-zinc-400 hover:bg-zinc-300',
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
    </main>
  )
}
