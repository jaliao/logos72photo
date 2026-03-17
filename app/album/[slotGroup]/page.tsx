/*
 * ----------------------------------------------
 * 個人時段相簿頁
 * 2026-03-15
 * app/album/[slotGroup]/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPhotosBySlotGroup } from '@/lib/firebase-rest'
import { toThumb640, toThumb1280 } from '@/lib/image'
import GalleryBackground from '@/app/components/GalleryBackground'
import GalleryHeading from '@/app/components/GalleryHeading'
import PhotoSlideshow, { type SlideshowPhoto } from '@/app/components/PhotoSlideshow'

interface Params {
  params: Promise<{ slotGroup: string }>
}

/** 將 8 碼分組號碼解析為可讀時段說明，例如 "03130103" → "03/13 01:30–01:44" */
function formatSlotGroupLabel(sg: string): string {
  const mm = sg.slice(0, 2)
  const dd = sg.slice(2, 4)
  const hh = parseInt(sg.slice(4, 6), 10)
  const ss = parseInt(sg.slice(6, 8), 10) // 1–4
  const startMin = (ss - 1) * 15
  const endMin = startMin + 14
  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return `${mm}/${dd} ${fmt(hh, startMin)}–${fmt(hh, endMin)}`
}

export default async function SlotGroupAlbumPage({ params }: Params) {
  const { slotGroup } = await params

  // 格式驗證：必須為 8 位數字
  if (!/^\d{8}$/.test(slotGroup)) {
    notFound()
  }

  const r2PublicUrl = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
  const coverUrl = `${r2PublicUrl}/covers/${slotGroup}.jpg`

  // 並行查詢：Firestore 照片 + 封面存在性確認
  const [photos, coverExists] = await Promise.all([
    getPhotosBySlotGroup(slotGroup),
    fetch(coverUrl, { method: 'HEAD' }).then(r => r.ok).catch(() => false),
  ])

  const coverPhoto: SlideshowPhoto | null = coverExists
    ? {
        r2Url: coverUrl,
        thumbUrl: coverUrl,
        slideUrl: coverUrl,
        alt: '封面',
        filename: 'COVER.jpg',
      }
    : null

  const slideshowPhotos: SlideshowPhoto[] = [
    ...(coverPhoto ? [coverPhoto] : []),
    ...photos.map((photo, index) => ({
      r2Url: photo.r2_url,
      thumbUrl: toThumb640(photo.r2_url),
      slideUrl: toThumb1280(photo.r2_url),
      alt: `${photo.device_id} @ ${new Date(photo.timestamp).toLocaleTimeString('zh-TW')}`,
      filename: `IMG_${String(index + 1).padStart(4, '0')}.jpg`,
    })),
  ]

  const timeLabel = formatSlotGroupLabel(slotGroup)

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
          href="/"
          className="text-sm text-white/70 hover:text-white"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,1)' }}
        >
          ← 返回
        </Link>

        <GalleryHeading subtitle={`${timeLabel}`} headingClassName="mt-4" subtitleClassName="mb-3 text-sm" />

        {photos.length === 0 ? (
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
            <PhotoSlideshow photos={slideshowPhotos} />
          </div>
        )}
      </div>
    </main>
  )
}
