/*
 * ----------------------------------------------
 * 後台共用 Shell Layout
 * 2026-03-20
 * app/admin/layout.tsx
 * ----------------------------------------------
 */

import { cookies } from 'next/headers'
import AdminNav from '@/app/components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const hasSession = !!cookieStore.get('admin_session')?.value

  // 無 session（登入頁）→ 直接渲染，不套用 Shell
  if (!hasSession) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <AdminNav />

      {/* 桌面版：左移主內容區留出 sidebar 空間 */}
      {/* 手機版：頂部 bar 高度 h-14，主內容向下推 */}
      <div className="md:ml-56 pt-14 md:pt-0">
        {children}
      </div>
    </div>
  )
}
