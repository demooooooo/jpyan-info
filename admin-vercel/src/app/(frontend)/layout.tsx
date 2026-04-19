import React from 'react'

import './ciggies.css'
import './styles.css'

import { NavBar } from './NavBar'
import { getSiteSettings } from '@/lib/site-settings'

export async function generateMetadata() {
  const settings = await getSiteSettings()

  return {
    description: settings.siteDescription,
    title: settings.siteTitle,
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const settings = await getSiteSettings()

  return (
    <html className="__variable_1ceda5" lang="zh-CN">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`:root { --font-noto: 'Noto Serif SC'; }`}</style>
      </head>
      <body className="min-h-screen bg-ink antialiased" style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
        <div hidden />
        <NavBar
          labels={{
            admin: settings.navAdminLabel,
            brands: settings.navBrandsLabel,
            collection: settings.navCollectionLabel,
            community: settings.navCommunityLabel,
            feed: settings.navFeedLabel,
          }}
          logoImageUrl={settings.logoImageUrl}
          logoMark={settings.logoMark}
          siteName={settings.siteName}
        />
        <div className="layout-main pt-[56px] pb-16 sm:pb-0">{children}</div>
      </body>
    </html>
  )
}
