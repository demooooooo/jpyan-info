'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Collection' },
  { href: '/brands', label: 'Brands' },
  { href: '/community', label: 'Community' },
  { href: '/feed', label: 'Feed' },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-ink/95 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
        <Link className="flex items-center gap-2.5 group shrink-0" href="/">
          <div className="w-7 h-7 rounded-lg bg-ash flex items-center justify-center transition-all group-hover:bg-gold group-hover:scale-105">
            <span className="font-chinese text-ink text-[13px] font-bold leading-none select-none">烟</span>
          </div>
          <span className="text-[14px] font-semibold text-ash tracking-[-0.01em] hidden sm:block" style={{ fontFamily: 'var(--font-dm-sans)' }}>
            ciggies.app
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                className={`hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 ${
                  active ? 'bg-ash text-ink' : 'text-ash/50 hover:text-ash hover:bg-ink-3'
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            )
          })}
          <div className="w-px h-4 bg-black/8 mx-1 hidden sm:block" />
          <a className="px-4 py-1.5 rounded-full text-[13px] font-medium bg-ash text-ink hover:bg-ash/90 transition-all" href="/admin">
            Sign In
          </a>
        </div>
      </div>
    </nav>
  )
}
