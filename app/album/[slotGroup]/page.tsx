/*
 * ----------------------------------------------
 * 個人時段相簿頁
 * 2026-03-15 (Updated: 2026-03-20)
 * app/album/[slotGroup]/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getPhotosBySlotGroup, getSlotGroupDoc } from '@/lib/firebase-rest'
import GalleryBackground from '@/app/components/GalleryBackground'
import GalleryHeading from '@/app/components/GalleryHeading'
import AlbumPhotoViewer from '@/app/components/AlbumPhotoViewer'

interface Params {
  params: Promise<{ slotGroup: string }>
}

/** 將 8 碼分組號碼解析為可讀時段說明，例如 "03130103" → "03/13 01:30" */
function formatSlotGroupLabel(sg: string): string {
  const mm = sg.slice(0, 2)
  const dd = sg.slice(2, 4)
  const hh = parseInt(sg.slice(4, 6), 10)
  const ss = parseInt(sg.slice(6, 8), 10) // 1–4
  const startMin = (ss - 1) * 15
  const fmt = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return `${mm}/${dd} ${fmt(hh, startMin)}`
}

export default async function SlotGroupAlbumPage({ params }: Params) {
  const { slotGroup } = await params

  // 格式驗證：必須為 8 位數字
  if (!/^\d{8}$/.test(slotGroup)) {
    notFound()
  }

  const r2PublicUrl = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
  const coverUrl = `${r2PublicUrl}/covers/${slotGroup}.jpg`

  const [photos, { hasCover: coverExists }] = await Promise.all([
    getPhotosBySlotGroup(slotGroup),
    getSlotGroupDoc(slotGroup),
  ])

  const timeLabel = formatSlotGroupLabel(slotGroup)

  return (
    <main className="relative min-h-screen px-4 py-4 md:py-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <GalleryBackground />
      <div className="relative z-10 mx-auto max-w-2xl">
        <GalleryHeading
          subtitle={
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              {timeLabel}
            </span>
          }
          headingClassName="mt-4"
          subtitleClassName="mb-3"
        />

        {photos.length === 0 ? (
          <div className="rounded-lg bg-white/70 px-4 py-3 text-center font-semibold text-black">此時段尚無照片</div>
        ) : (
          <div
            className="rounded-2xl bg-white/50 p-5"
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
              animation: 'fadeIn 300ms ease-out forwards',
              opacity: 0,
            }}
          >
            <AlbumPhotoViewer initialPhotos={photos} coverUrl={coverExists ? coverUrl : undefined} />
          </div>
        )}
      </div>
    </main>
  )
}
