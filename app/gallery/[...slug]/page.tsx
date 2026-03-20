/*
 * ----------------------------------------------
 * /gallery/** 舊路徑 redirect → /admin/login
 * 2026-03-20
 * app/gallery/[...slug]/page.tsx
 * ----------------------------------------------
 */

import { redirect } from 'next/navigation'

export default function GalleryRedirect() {
  redirect('/admin/login')
}
