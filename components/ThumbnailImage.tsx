/*
 * ----------------------------------------------
 * 縮圖元件（image-service 支援 + fallback）
 * 2026-03-05
 * components/ThumbnailImage.tsx
 * ----------------------------------------------
 */

'use client'

import { useState, useEffect } from 'react'

interface ThumbnailImageProps {
  /** image-service 縮圖 URL */
  src: string
  /** 載入失敗時的備援 URL（原始 R2 URL） */
  fallbackSrc: string
  alt: string
  className?: string
}

/**
 * 縮圖圖片元件
 * - 優先使用 image-service URL（WebP 縮圖）
 * - 載入失敗時自動降級至原始 R2 URL
 */
export function ThumbnailImage({ src, fallbackSrc, alt, className }: ThumbnailImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  // src prop 變更時（例如 Firestore onSnapshot 更新最新照片 URL）重設為新 src
  useEffect(() => {
    setImgSrc(src)
  }, [src])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc)
      }}
    />
  )
}
