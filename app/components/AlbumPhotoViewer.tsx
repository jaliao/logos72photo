'use client'
/*
 * ----------------------------------------------
 * 個人相簿照片檢視元件（訪客專用）
 * 2026-03-20 (Updated: 2026-03-20)
 * app/components/AlbumPhotoViewer.tsx
 * ----------------------------------------------
 *
 * 兩種模式：
 *   grid    — 縮圖網格（手機單欄、桌面雙欄）
 *   expand  — 展開卡片：提示框、下載（iOS 開新頁）、modal 二次確認刪除
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { toThumb640, toThumb1280 } from '@/lib/image'
import type { PhotoDocWithId } from '@/lib/types'

interface Props {
  initialPhotos: PhotoDocWithId[]
  /** 封面圖 URL（R2 covers/）；若存在則置於列表首位 */
  coverUrl?: string
}

export default function AlbumPhotoViewer({ initialPhotos, coverUrl: initialCoverUrl }: Props) {
  const [photos, setPhotos] = useState<PhotoDocWithId[]>(initialPhotos)
  const [coverUrl, setCoverUrl] = useState<string | undefined>(initialCoverUrl)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  // iOS 偵測（mount 後才能讀 navigator）
  const [ios, setIos] = useState(false)
  useEffect(() => {
    setIos(/iPhone|iPad|iPod/.test(navigator.userAgent))
  }, [])

  const coverOffset = coverUrl ? 1 : 0
  const totalCount = coverOffset + photos.length

  // ── Grid 模式 ─────────────────────────────────────────────────────────────

  if (activeIndex === null) {
    if (totalCount === 0) {
      return <p className="text-center text-zinc-400">此時段尚無照片</p>
    }
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {coverUrl && (
          <button
            key="__cover__"
            onClick={() => setActiveIndex(0)}
            className="block w-full cursor-pointer overflow-hidden rounded-xl focus:outline-none"
          >
            <div className="relative aspect-[3/4] w-full">
              <Image src={coverUrl} alt="封面" fill className="object-cover" sizes="(min-width: 640px) 50vw, 100vw" />
            </div>
          </button>
        )}
        {photos.map((photo, i) => (
          <button
            key={photo.docId}
            onClick={() => setActiveIndex(coverOffset + i)}
            className="block w-full cursor-pointer overflow-hidden rounded-xl focus:outline-none"
          >
            <div className="relative aspect-[3/4] w-full">
              <Image src={toThumb640(photo.r2_url)} alt={`照片 ${i + 1}`} fill className="object-cover" sizes="(min-width: 640px) 50vw, 100vw" />
            </div>
          </button>
        ))}
      </div>
    )
  }

  // ── Expand 模式 ───────────────────────────────────────────────────────────

  const isCover = coverUrl !== undefined && activeIndex === 0
  const photo = isCover ? null : photos[activeIndex - coverOffset]
  const displayUrl = isCover ? coverUrl! : toThumb1280(photo!.r2_url)
  const rawUrl = isCover ? coverUrl! : photo!.r2_url
  const downloadFilename = isCover ? 'COVER.jpg' : `photo_${photo!.docId}.jpg`

  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < totalCount - 1

  const resetExpandState = () => {
    setShowDeleteModal(false)
    setDeleteError(null)
  }

  const goBack = () => { setActiveIndex(null); resetExpandState() }
  const goPrev = () => { if (hasPrev) { setActiveIndex(activeIndex - 1); resetExpandState() } }
  const goNext = () => { if (hasNext) { setActiveIndex(activeIndex + 1); resetExpandState() } }

  const handleDownload = async () => {
    if (ios) {
      window.open(rawUrl, '_blank')
      return
    }
    setDownloading(true)
    try {
      const res = await fetch(rawUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadFilename
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      if (isCover) {
        const res = await fetch('/api/album/cover', { method: 'DELETE' })
        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string }
          setDeleteError(data.error ?? '刪除失敗，請稍後再試')
          return
        }
        setShowDeleteModal(false)
        setCoverUrl(undefined)
        setActiveIndex(null)
      } else {
        const res = await fetch('/api/album/photos', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ r2Url: photo!.r2_url }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({})) as { error?: string }
          setDeleteError(data.error ?? '刪除失敗，請稍後再試')
          return
        }
        setShowDeleteModal(false)
        setPhotos(photos.filter((_, i) => i !== activeIndex - coverOffset))
        setActiveIndex(null)
      }
    } catch {
      setDeleteError('刪除失敗，請稍後再試')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* 照片 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl">
        <Image
          src={displayUrl}
          alt={isCover ? '封面' : `照片 ${activeIndex - coverOffset + 1}`}
          fill className="object-cover" sizes="100vw" priority
        />
        {hasPrev && (
          <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60" aria-label="上一張">‹</button>
        )}
        {hasNext && (
          <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60" aria-label="下一張">›</button>
        )}
      </div>

      {/* 頁碼（點點） */}
      <div className="mt-3 flex justify-center gap-2">
        {Array.from({ length: totalCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIndex(i); resetExpandState() }}
            className={`h-2.5 w-2.5 cursor-pointer rounded-full transition-colors ${
              i === activeIndex ? 'bg-zinc-800' : 'bg-zinc-300'
            }`}
            aria-label={`第 ${i + 1} 張`}
          />
        ))}
      </div>

      {/* 行銷使用說明 */}
      <div className="mt-3 rounded-lg border border-black bg-white/70 p-3 text-sm font-semibold text-black">
        本照片用於活動行銷宣傳，如不同意請點「刪除」自行移除。
      </div>

      {/* iOS 下載說明（mount 後偵測到 iOS 即顯示） */}
      {ios && (
        <div className="mt-2 rounded-lg border border-black bg-white/70 p-3 text-sm font-semibold text-black">
          iPhone 儲存照片：點「開啟照片」→ 在新頁長按圖片 → 選擇「儲存影像」
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="mt-3 flex gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 rounded-lg bg-zinc-800 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-700"
        >
          {downloading ? '下載中…' : ios ? '開啟照片' : '下載'}
        </button>
        <button
          onClick={() => { setDeleteError(null); setShowDeleteModal(true) }}
          className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          刪除
        </button>
      </div>

      {/* 返回列表 */}
      <button
        onClick={goBack}
        className="mt-3 w-full rounded-lg bg-zinc-800 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        返回列表
      </button>

      {/* 刪除確認 Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6">
            <p className="mb-1 text-base font-semibold text-zinc-900">確定要刪除這張照片嗎？</p>
            <p className="mb-5 text-sm text-zinc-500">刪除後無法復原。</p>
            {deleteError && (
              <p className="mb-3 text-center text-xs text-red-500">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteError(null) }}
                disabled={deleting}
                className="flex-1 rounded-lg bg-zinc-300 py-2 text-sm font-medium text-zinc-800 disabled:opacity-50 hover:bg-zinc-400"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-bold text-white disabled:opacity-50 hover:bg-red-700"
              >
                {deleting ? '刪除中…' : '確定刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
