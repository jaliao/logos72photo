/*
 * ----------------------------------------------
 * 15 分鐘相簿照片預覽與下載頁
 * 2026-02-21
 * app/gallery/[date]/[slot]/[album]/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
// 禁止靜態渲染，確保 Firebase 在 runtime 執行
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatSlot15m, type PhotoDoc } from '@/lib/types'

interface Params {
  params: Promise<{ date: string; slot: string; album: string }>
}

async function getPhotos(date: string, slot8h: number, slot15m: number): Promise<PhotoDoc[]> {
  const q = query(
    collection(db, 'photos'),
    where('date', '==', date),
    where('slot_8h', '==', slot8h),
    where('slot_15m', '==', slot15m),
    orderBy('timestamp', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as PhotoDoc)
}

export default async function AlbumPage({ params }: Params) {
  const { date, slot, album } = await params
  const slot8h = parseInt(slot, 10)
  const slot15m = parseInt(album, 10)
  const photos = await getPhotos(date, slot8h, slot15m)

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/gallery/${date}/${slot}`}
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← 返回
        </Link>

        <h1 className="mb-1 mt-4 text-xl font-bold text-zinc-800">
          {date} · {formatSlot15m(slot15m)}
        </h1>
        <p className="mb-6 text-sm text-zinc-500">{photos.length} 張照片</p>

        {photos.length === 0 ? (
          <p className="text-center text-zinc-400">此時段尚無照片</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.r2_url}
                className="group relative overflow-hidden rounded-xl bg-zinc-200"
              >
                <Image
                  src={photo.r2_url}
                  alt={`${photo.device_id} @ ${new Date(photo.timestamp).toLocaleTimeString('zh-TW')}`}
                  width={400}
                  height={300}
                  className="h-40 w-full object-cover transition group-hover:opacity-80"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                  <span>{photo.device_id}</span>
                  {/* 下載按鈕 */}
                  <a
                    href={photo.r2_url}
                    download
                    className="rounded bg-white/20 px-2 py-0.5 hover:bg-white/40"
                  >
                    下載
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
