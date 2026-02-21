/*
 * ----------------------------------------------
 * 全域 Layout（HTML shell、metadata、字型）
 * 2026-02-21
 * app/layout.tsx
 * ----------------------------------------------
 */

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '72 小時不間斷讀經接力自動拍照系統',
  description: '記錄 72 小時不間斷讀經接力活動的自動拍照成果，依日期與時段瀏覽兩台 iPhone 拍攝的照片。',
  icons: { icon: '/favicon.png' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
