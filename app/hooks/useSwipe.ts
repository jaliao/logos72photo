/*
 * ----------------------------------------------
 * useSwipe — 水平 Swipe 手勢 Hook
 * 2026-03-12
 * app/hooks/useSwipe.ts
 * ----------------------------------------------
 */

import { useRef } from 'react'

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

/**
 * 水平 Swipe 手勢偵測
 * @param onSwipeLeft  向左 Swipe（deltaX < -threshold）時呼叫
 * @param onSwipeRight 向右 Swipe（deltaX > threshold）時呼叫
 * @param threshold    觸發閾值（px），預設 50
 */
export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50,
): SwipeHandlers {
  const startX = useRef<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const deltaX = e.changedTouches[0].clientX - startX.current
    startX.current = null
    if (deltaX < -threshold) onSwipeLeft()
    else if (deltaX > threshold) onSwipeRight()
  }

  return { onTouchStart, onTouchEnd }
}
