'use client'
/*
 * ----------------------------------------------
 * 個人相簿照片檢視元件（訪客專用）
 * 2026-03-20
 * app/components/AlbumPhotoViewer.tsx
 * ----------------------------------------------
 *
 * 兩種模式：
 *   grid    — 縮圖網格（手機單欄、桌面雙欄）
 *   expand  — 白色圓角卡片展開，含下載、刪除、左右切換
 *
 * coverUrl（可選）：封面置首，展開時僅顯示下載按鈕，無刪除功能。
 */

import { useState } from 'react'
import Image from 'next/image'
import { toThumb640, toThumb1280 } from '@/lib/image'
import type { PhotoDocWithId } from '@/lib/types'

interface Props {
  initialPhotos: PhotoDocWithId[]
  /** 封面圖 URL（R2 covers/）；若存在則置於列表首位 */
  coverUrl?: string
}

export default function AlbumPhotoViewer({ initialPhotos, coverUrl }: Props) {
  const [photos, setPhotos] = useState<PhotoDocWithId[]>(initialPhotos)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // 封面佔 index 0，其餘照片從 index 1 開始
  const coverOffset = coverUrl ? 1 : 0
  const totalCount = coverOffset + photos.length

  // ── Grid 模式 ─────────────────────────────────────────────────────────────

  if (activeIndex === null) {
    if (totalCount === 0) {
      return <p className="text-center text-zinc-400">此時段尚無照片</p>
    }
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 封面（置首） */}
        {coverUrl && (
          <button
            key="__cover__"
            onClick={() => setActiveIndex(0)}
            className="block w-full cursor-pointer overflow-hidden rounded-xl focus:outline-none"
          >
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={coverUrl}
                alt="封面"
                fill
                className="object-cover"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
            </div>
          </button>
        )}
        {/* 一般照片 */}
        {photos.map((photo, i) => (
          <button
            key={photo.docId}
            onClick={() => setActiveIndex(coverOffset + i)}
            className="block w-full cursor-pointer overflow-hidden rounded-xl focus:outline-none"
          >
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={toThumb640(photo.r2_url)}
                alt={`照片 ${i + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
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
  const downloadUrl = isCover ? coverUrl! : photo!.r2_url
  const downloadFilename = isCover ? 'COVER.jpg' : `photo_${photo!.docId}.jpg`

  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < totalCount - 1

  const goBack = () => {
    setActiveIndex(null)
    setDeleteError(null)
  }

  const goPrev = () => {
    if (hasPrev) {
      setActiveIndex(activeIndex - 1)
      setDeleteError(null)
    }
  }

  const goNext = () => {
    if (hasNext) {
      setActiveIndex(activeIndex + 1)
      setDeleteError(null)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch(downloadUrl)
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

  const handleDelete = async () => {
    if (!photo) return
    if (!confirm('確定要刪除這張照片嗎？')) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/album/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ r2Url: photo.r2_url }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setDeleteError(data.error ?? '刪除失敗，請稍後再試')
        return
      }
      // 本地移除，返回列表
      setPhotos(photos.filter((_, i) => i !== activeIndex - coverOffset))
      setActiveIndex(null)
    } catch {
      setDeleteError('刪除失敗，請稍後再試')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* 返回列表 */}
      <button
        onClick={goBack}
        className="mb-3 text-sm text-zinc-600 hover:text-zinc-900"
      >
        ← 返回列表
      </button>

      {/* 照片 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl">
        <Image
          src={displayUrl}
          alt={isCover ? '封面' : `照片 ${activeIndex - coverOffset + 1}`}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />

        {/* 左右切換箭頭 */}
        {hasPrev && (
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            aria-label="上一張"
          >
            ‹
          </button>
        )}
        {hasNext && (
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            aria-label="下一張"
          >
            ›
          </button>
        )}
      </div>

      {/* 說明文字（封面不顯示） */}
      {!isCover && (
        <p className="mt-3 text-center text-xs text-zinc-500">
          本照片可能用於活動行銷，如不同意請點刪除
        </p>
      )}

      {/* 操作按鈕 */}
      <div className="mt-3 flex gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 rounded-lg bg-zinc-800 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-700"
        >
          {downloading ? '下載中…' : '下載'}
        </button>
        {/* 封面不可刪除 */}
        {!isCover && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-red-600"
          >
            {deleting ? '刪除中…' : '刪除'}
          </button>
        )}
      </div>

      {/* 錯誤提示 */}
      {deleteError && (
        <p className="mt-2 text-center text-xs text-red-500">{deleteError}</p>
      )}

      {/* 頁碼 */}
      <p className="mt-2 text-center text-xs text-zinc-400">
        {activeIndex + 1} / {totalCount}
      </p>
    </div>
  )
}
