/*
 * ----------------------------------------------
 * 後台共用側邊欄選單
 * 2026-03-20
 * app/components/AdminNav.tsx
 * ----------------------------------------------
 */

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/admin/login/actions'

const NAV_ITEMS = [
  { label: '相簿', href: '/admin', exact: true },
  { label: '監控', href: '/admin/monitoring' },
  { label: '帳密管理', href: '/admin/slot-passwords' },
  { label: '資料清除', href: '/admin/data-cleanup' },
  { label: '封面索引', href: '/admin/rebuild-first-photos' },
  { label: '錯誤日誌', href: '/admin/errors' },
  { label: '裝置管理', href: '/admin/devices' },
]

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white',
            ].join(' ')}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

export default function AdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ── 桌面版側邊欄 ─────────────────────────────── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-56 flex-col bg-zinc-900 border-r border-zinc-800">
        {/* 品牌標題 */}
        <div className="px-5 py-5 border-b border-zinc-800">
          <span className="text-sm font-bold text-white tracking-wide">logos72photo</span>
          <p className="mt-0.5 text-xs text-zinc-500">後台管理</p>
        </div>

        {/* 選單項目 */}
        <div className="flex-1 overflow-y-auto py-4">
          <NavItems pathname={pathname} />
        </div>

        {/* 登出 */}
        <div className="border-t border-zinc-800 p-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              登出
            </button>
          </form>
        </div>
      </aside>

      {/* ── 手機版頂部 bar ────────────────────────────── */}
      <header className="md:hidden fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-4 h-14">
        <span className="text-sm font-bold text-white">logos72photo 後台</span>
        <button
          onClick={() => setOpen(true)}
          className="text-zinc-400 hover:text-white p-1"
          aria-label="開啟選單"
        >
          {/* Hamburger icon */}
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* ── 手機版 sidebar overlay ────────────────────── */}
      {open && (
        <>
          {/* 背景遮罩 */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />
          {/* 側邊欄本體 */}
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-56 flex flex-col bg-zinc-900 border-r border-zinc-800">
            <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800">
              <span className="text-sm font-bold text-white">logos72photo 後台</span>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white p-1">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <NavItems pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-zinc-800 p-3">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  登出
                </button>
              </form>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
