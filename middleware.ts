/*
 * ----------------------------------------------
 * Next.js Middleware：/admin 路由保護
 * 2026-02-21
 * middleware.ts
 * ----------------------------------------------
 */

import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // 登入頁本身不需要驗證，直接放行
  if (req.nextUrl.pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  const session = req.cookies.get('admin_session')?.value
  if (!session || session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
