/*
 * ----------------------------------------------
 * Next.js Middleware：/admin 與 /album 路由保護
 * 2026-02-21 (Updated: 2026-03-15)
 * middleware.ts
 * ----------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAlbumSession } from '@/lib/slot-password'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── /admin 路由保護 ──────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname.startsWith('/admin/login')) return NextResponse.next()
    const session = req.cookies.get('admin_session')?.value
    if (!session || session !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  // ── /album 路由保護 ──────────────────────────────────
  if (pathname.startsWith('/album')) {
    if (pathname.startsWith('/album/login')) return NextResponse.next()

    const cookieValue = req.cookies.get('album_session')?.value
    if (!cookieValue) {
      return NextResponse.redirect(new URL('/album/login', req.url))
    }

    const slotGroup = await verifyAlbumSession(cookieValue)
    if (!slotGroup) {
      // 驗簽失敗，清除 cookie 並重導向
      const res = NextResponse.redirect(new URL('/album/login', req.url))
      res.cookies.set('album_session', '', { path: '/album', maxAge: 0 })
      return res
    }

    // 確認存取的路徑與 session 綁定的 slotGroup 一致
    const match = pathname.match(/^\/album\/(\d{8})(\/|$)/)
    if (match && match[1] !== slotGroup) {
      return NextResponse.redirect(new URL(`/album/${slotGroup}`, req.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/album/:path*'],
}
