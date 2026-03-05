/*
 * ----------------------------------------------
 * 相簿首頁日期卡片列表（進場淡入 + 退場淡出動畫）
 * 2026-03-05
 * app/components/GalleryDateList.tsx
 * ----------------------------------------------
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SLOTS = [
  { label: '早', sublabel: '00–08', value: 0 },
  { label: '中', sublabel: '08–16', value: 8 },
  { label: '晚', sublabel: '16–24', value: 16 },
] as const

interface Props {
  dateList: Array<{ date: string; slots: Set<0 | 8 | 16> }>
}

export default function GalleryDateList({ dateList }: Props) {
  const router = useRouter()
  const [exiting, setExiting] = useState(false)

  function handleNavigate(href: string) {
    if (exiting) return
    setExiting(true)
    setTimeout(() => router.push(href), 300)
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-8px); }
        }
      `}</style>

      <div className="flex flex-col gap-4">
        {dateList.map(({ date, slots }, index) => (
          <div
            key={date}
            className="rounded-2xl bg-white p-5 shadow-sm"
            style={{
              animation: exiting
                ? 'fadeOut 300ms ease-in forwards'
                : `fadeIn 400ms ease-out ${index * 80}ms forwards`,
              opacity: 0,
            }}
          >
            {/* 日期標題 */}
            <p className="mb-3 text-sm font-semibold text-zinc-800">{date}</p>

            {/* 三時段格 */}
            <div className="grid grid-cols-3 gap-2">
              {SLOTS.map((slot) => {
                const hasPhotos = slots.has(slot.value)
                const href = `/gallery/${date}/${slot.value}`
                return (
                  <div
                    key={slot.value}
                    role="link"
                    tabIndex={0}
                    onClick={() => handleNavigate(href)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNavigate(href)}
                    className={[
                      'flex flex-col items-center justify-center rounded-xl py-4 transition active:scale-95 cursor-pointer select-none',
                      hasPhotos
                        ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                        : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200',
                    ].join(' ')}
                  >
                    <span className="text-sm font-semibold">{slot.label}</span>
                    <span className={['text-xs', hasPhotos ? 'text-zinc-400' : 'text-zinc-300'].join(' ')}>
                      {slot.sublabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
