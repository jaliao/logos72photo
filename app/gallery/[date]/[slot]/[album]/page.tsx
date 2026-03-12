/*
 * ----------------------------------------------
 * 1 小時相簿照片預覽與下載頁
 * 2026-02-21 (Updated: 2026-03-08)
 * app/gallery/[date]/[slot]/[album]/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
// 禁止靜態渲染，確保 Firebase 在 runtime 執行
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { queryPhotos } from '@/lib/firebase-rest'
import { formatSlot15m, type PhotoDoc } from '@/lib/types'
import GalleryBackground from '@/app/components/GalleryBackground'
import PhotoLightbox, { type LightboxPhoto } from '@/app/components/PhotoLightbox'

/** 從 R2 URL 建構 image-service 縮圖 URL */
function toThumbUrl(r2Url: string, width: number, quality: number): string {
  const imageServiceUrl = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL?.replace(/\/$/, '') ?? ''
  if (!imageServiceUrl) return r2Url
  try {
    const r2Key = new URL(r2Url).pathname.slice(1)
    return `${imageServiceUrl}/resizing/${width}/${quality}/${r2Key}`
  } catch {
    return r2Url
  }
}

interface Params {
  params: Promise<{ date: string; slot: string; album: string }>
}

async function getPhotos(
  date: string,
  slot8h: number,
  hourMin: number,
): Promise<{ photos: PhotoDoc[]; error?: string }> {
  try {
    const all = await queryPhotos([
      { field: 'date', value: date },
      { field: 'slot_8h', value: slot8h },
    ])
    // 過濾出該 1 小時範圍內的照片，依時間升冪排序
    return {
      photos: all
        .filter((p) => p.slot_15m >= hourMin && p.slot_15m < hourMin + 60)
        .sort((a, b) => a.timestamp - b.timestamp),
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[AlbumPage] queryPhotos 失敗：', msg)
    return { photos: [], error: msg }
  }
}

export default async function AlbumPage({ params }: Params) {
  const { date, slot, album } = await params
  const slot8h = parseInt(slot, 10)
  const hourMin = parseInt(album, 10)
  const { photos, error } = await getPhotos(date, slot8h, hourMin)

  const hourLabel = `${formatSlot15m(hourMin)} – ${formatSlot15m(hourMin + 60)}`

  // 準備 Lightbox 用的照片資料（Server Component 序列化為 props）
  const lightboxPhotos: LightboxPhoto[] = photos.map((photo) => ({
    r2Url: photo.r2_url,
    thumbUrl: toThumbUrl(photo.r2_url, 1280, 85),
    alt: `${photo.device_id} @ ${new Date(photo.timestamp).toLocaleTimeString('zh-TW')}`,
  }))

  return (
    <main className="relative min-h-screen px-4 py-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <GalleryBackground />
      <div className="relative z-10 mx-auto max-w-2xl">
        <Link
          href={`/gallery/${date}/${slot}`}
          className="text-sm text-white/70 hover:text-white"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,1)' }}
        >
          ← 返回
        </Link>

        <h1
          className="mb-1 mt-4 text-2xl font-bold text-zinc-900"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
        >
          2026 不間斷讀經接力
        </h1>
        <p className="mb-6 text-sm text-zinc-700">{date} · {hourLabel}　{photos.length} 張照片</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            查詢失敗：{error}
          </p>
        )}

        {photos.length === 0 && !error ? (
          <p className="text-center text-zinc-400">此時段尚無照片</p>
        ) : (
          <div
            className="rounded-2xl bg-white/50 p-5"
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
              animation: 'fadeIn 300ms ease-out forwards',
              opacity: 0,
            }}
          >
            {/* PhotoLightbox 包含縮圖 grid 與全螢幕預覽（Client Component）*/}
            <PhotoLightbox photos={lightboxPhotos} />
          </div>
        )}
      </div>
    </main>
  )
}
