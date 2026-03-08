/*
 * ----------------------------------------------
 * 相簿首頁：有照片的日期列表（依日期由新到舊）
 * 2026-03-05
 * app/page.tsx
 * ----------------------------------------------
 */

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { queryPhotoIndex } from '@/lib/firebase-rest'
import GalleryBackground from '@/app/components/GalleryBackground'
import GalleryDateList from '@/app/components/GalleryDateList'

export default async function HomePage() {
  let dateList: Array<{ date: string; slots: Set<0 | 8 | 16> }> = []
  let error: string | null = null

  try {
    dateList = await queryPhotoIndex()
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  return (
    <main className="relative min-h-screen px-4 py-8">
      <GalleryBackground />
      <div className="relative z-10 mx-auto max-w-lg">
        {/* 標題 */}
        <h1 className="mb-1 text-2xl font-bold text-zinc-900" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
          不間斷讀經接力相簿
        </h1>
        <p className="mb-8 text-sm text-zinc-700">從白天到黑夜不停的運行</p>

        {/* 錯誤提示 */}
        {error && (
          <p className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            載入失敗：{error}
          </p>
        )}

        {/* 無資料空狀態 */}
        {!error && dateList.length === 0 && (
          <p className="text-center text-sm text-zinc-400">尚無拍攝紀錄</p>
        )}

        {/* 日期卡片列表（含進退場動畫） */}
        <GalleryDateList dateList={dateList} />
      </div>
    </main>
  )
}
