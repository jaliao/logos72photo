/*
 * ----------------------------------------------
 * 照片幻燈片（Google Photos 風格全螢幕瀏覽）
 * 2026-03-12 (Updated: 2026-03-26)
 * app/components/PhotoSlideshow.tsx
 * ----------------------------------------------
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSwipe } from '@/app/hooks/useSwipe'

export interface SlideshowPhoto {
  r2Url: string
  thumbUrl: string
  /** 1280px 縮圖，用於幻燈片主畫面顯示與 iOS 分享 */
  slideUrl: string
  alt: string
  /** 下載時的預設檔名，例如 IMG_0001.jpg */
  filename: string
}

interface Props {
  photos: SlideshowPhoto[]
}

export default function PhotoSlideshow({ photos }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const isOpen = openIndex !== null
  const current = isOpen ? photos[openIndex] : null

  // 2.3：開啟時鎖定背景捲動
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const close = useCallback(() => setOpenIndex(null), [])

  const prev = useCallback(() => {
    setOpenIndex((i) => {
      if (i === null || i <= 0) return i
      setDirection('left')
      return i - 1
    })
  }, [])

  const next = useCallback(() => {
    setOpenIndex((i) => {
      if (i === null || i >= photos.length - 1) return i
      setDirection('right')
      return i + 1
    })
  }, [photos.length])

  // 3.4：鍵盤事件監聽
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close, prev, next])

  // 轉場：在初始 off-screen 位置 render 後，觸發滑入動畫
  useEffect(() => {
    if (direction === null) return
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setDirection(null))
    )
    return () => cancelAnimationFrame(id)
  }, [direction])

  // 4.2：Swipe 手勢
  const swipeHandlers = useSwipe(next, prev)

  // 下載原圖（所有平台統一使用 blob fetch + <a download>）
  const handleDownload = useCallback(async () => {
    if (!current || isDownloading) return
    setIsDownloading(true)
    try {
      const res = await fetch(current.r2Url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = current.filename
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // 下載失敗，靜默處理
    } finally {
      setIsDownloading(false)
    }
  }, [current, isDownloading])

  return (
    <>
      {/* 縮圖 Grid */}
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2${isOpen ? ' hidden' : ''}`}>
        {photos.map((photo, i) => (
          <div
            key={photo.r2Url}
            className="relative cursor-pointer overflow-hidden rounded-xl bg-zinc-200"
            onClick={() => setOpenIndex(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbUrl}
              alt={photo.alt}
              className="aspect-[3/4] w-full object-cover transition hover:opacity-80"
            />
          </div>
        ))}
      </div>

      {/* 幻燈片全螢幕覆蓋層 */}
      {isOpen && current !== null && openIndex !== null && (
        <div
          className="fixed inset-0 aspect-3/4 z-50 bg-black"
          onClick={close}
          {...swipeHandlers}
        >
          {/* 模糊背景（同一張照片 cover 填滿，消除黑底） */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.slideUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 brightness-50"
          />

          {/* 前景照片
              手機（預設）：inset-0 object-cover — 填滿整個手機畫面
              桌機（sm:+）：h-full w-auto aspect-[3/4] object-cover — 3/4 比例填滿視窗高度 */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div
              className={`absolute inset-0 sm:relative sm:inset-auto sm:max-h-screen sm:w-auto sm:aspect-[3/4] transition-transform duration-300 ${
                direction === 'right' ? 'translate-x-full' : direction === 'left' ? '-translate-x-full' : 'translate-x-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.slideUrl}
                alt={current.alt}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* 頂部工具列（浮於照片上，漸層背景確保可讀性） */}
          <div
            className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between px-2"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
          >
            {/* 左上角：返回按鈕 */}
            <button
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white active:scale-95 transition"
              onClick={close}
              aria-label="返回照片列表"
            >
              ← 返回
            </button>

            {/* 右上角：下載按鈕 */}
            <div className="flex items-center gap-1">
              {/* 下載按鈕 */}
              <button
                className="rounded-lg p-2 text-white/90 hover:bg-white/10 hover:text-white active:scale-95 transition disabled:opacity-40"
                onClick={handleDownload}
                disabled={isDownloading}
                aria-label={isDownloading ? '下載中…' : '下載照片'}
                title={isDownloading ? '下載中…' : `下載 ${current.filename}`}
              >
                {isDownloading ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 左側：上一張按鈕 */}
          <button
            className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-1 text-white/70 hover:text-white active:scale-95 transition disabled:opacity-20 disabled:pointer-events-none"
            onClick={(e) => { e.stopPropagation(); prev() }}
            disabled={openIndex === 0}
            aria-label="上一張"
          >
            <span className="rounded-full p-2 hover:bg-black/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
          </button>

          {/* 右側：下一張按鈕 */}
          <button
            className="absolute right-0 top-0 bottom-0 z-20 flex items-center px-1 text-white/70 hover:text-white active:scale-95 transition disabled:opacity-20 disabled:pointer-events-none"
            onClick={(e) => { e.stopPropagation(); next() }}
            disabled={openIndex === photos.length - 1}
            aria-label="下一張"
          >
            <span className="rounded-full p-2 hover:bg-black/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>


        </div>
      )}
    </>
  )
}
