import React from 'react'

import './ciggies.css'
import './styles.css'

import { NavBar } from './NavBar'

export const metadata = {
  description:
    'The only comprehensive English-language archive of Chinese cigarettes — browse brands, specs, pricing, imagery, and community activity.',
  title: '中国卷烟博物馆 · Chinese Cigarette Museum',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html className="__variable_1ceda5" lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`:root { --font-noto: 'Noto Serif SC'; }`}</style>
      </head>
      <body className="min-h-screen bg-ink antialiased" style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
        <div hidden />
        <NavBar />
        <div className="layout-main pt-[56px] pb-16 sm:pb-0">{children}</div>
      </body>
    </html>
  )
}
