/*
 * ----------------------------------------------
 * 照片全螢幕 Lightbox（點擊縮圖預覽、下載原圖）
 * 2026-03-08
 * app/components/PhotoLightbox.tsx
 * ----------------------------------------------
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

export interface LightboxPhoto {
  r2Url: string
  thumbUrl: string
  alt: string
}

interface Props {
  photos: LightboxPhoto[]
}

export default function PhotoLightbox({ photos }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])

  // 開啟時鎖定背景捲動
  useEffect(() => {
    if (openIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [openIndex])

  // ESC 鍵關閉
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close])

  const current = openIndex !== null ? photos[openIndex] : null

  return (
    <>
      {/* 縮圖 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, i) => (
          <div
            key={photo.r2Url}
            className="relative overflow-hidden rounded-xl bg-zinc-200 cursor-pointer"
            onClick={() => setOpenIndex(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbUrl}
              alt={photo.alt}
              className="h-40 w-full object-cover transition hover:opacity-80"
            />
          </div>
        ))}
      </div>

      {/* Lightbox 覆蓋層 */}
      {current !== null && openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          onClick={close}
        >
          {/* 關閉按鈕 */}
          <button
            className="absolute right-4 top-4 text-2xl text-white/80 hover:text-white"
            onClick={close}
            aria-label="關閉"
          >
            ✕
          </button>

          {/* 高解析縮圖（阻止點擊事件冒泡至背景）*/}
          <div
            className="flex flex-col items-center gap-4 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.thumbUrl}
              alt={current.alt}
              className="max-h-[75vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
            />

            {/* 下載工具列 */}
            <div className="flex flex-col items-center gap-1">
              <a
                href={current.r2Url}
                download
                className="rounded-lg bg-white/20 px-5 py-2 text-sm font-medium text-white hover:bg-white/30 active:scale-95 transition"
                onClick={(e) => e.stopPropagation()}
              >
                ↓ 下載原圖
              </a>
              <p className="text-xs text-white/50">iOS 請長按圖片 → 儲存到照片</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
