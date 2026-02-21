/*
 * ----------------------------------------------
 * Admin 登入／登出 Server Actions
 * 2026-02-21
 * app/admin/login/actions.ts
 * ----------------------------------------------
 */

'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/** 登入：驗證密碼後設定 HttpOnly session cookie */
export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string

  if (password && password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', process.env.ADMIN_PASSWORD!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: '/',
    })
    redirect('/admin/monitoring')
  }

  redirect('/admin/login?error=1')
}

/** 登出：清除 session cookie 並導向登入頁 */
export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}
