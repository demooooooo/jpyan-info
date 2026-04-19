import Link from 'next/link'

import { slugifyName, toTemplateImageUrl } from '@/lib/frontend-data'
import { getPayloadClient } from '@/lib/payload'
import { getHomeGalleryPositions } from '@/lib/site-template'

const positions = getHomeGalleryPositions()

const toMoney = (value: unknown) => {
  let parsed: number | null = null

  if (typeof value === 'number') {
    parsed = Number.isFinite(value) && value > 0 ? value : null
  } else if (typeof value === 'string') {
    const next = Number(value)
    parsed = Number.isFinite(next) && next > 0 ? next : null
  }

  if (parsed == null) return null

  // Legacy source mixes yuan values like 350 and cent-like values such as 4300.00.
  if (parsed >= 1000) {
    parsed = parsed / 100
  }

  return Number.isInteger(parsed) ? parsed : Number(parsed.toFixed(2))
}

const getProductPrice = (product: Record<string, unknown>) => {
  const pricing = 'pricing' in product && product.pricing && typeof product.pricing === 'object' ? (product.pricing as Record<string, unknown>) : null

  return toMoney(pricing?.price) ?? toMoney(pricing?.marketPrice)
}

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [products, entries] = await Promise.all([
    payload.find({
      collection: 'products',
      depth: 1,
      limit: Math.min(positions.length, 240),
    }),
    payload.find({
      collection: 'product-entries',
      depth: 0,
      limit: 18,
      sort: '-publishedAt',
      where: {
        isVisible: {
          equals: true,
        },
      },
    }),
  ])

  const sortedProducts = [...products.docs].sort((a, b) => {
    if (a.showOnHome !== b.showOnHome) {
      return a.showOnHome ? -1 : 1
    }

    return (b.sort || 0) - (a.sort || 0)
  })

  const brandCount = await payload.count({
    collection: 'brands',
    where: {
      isVisible: {
        equals: true,
      },
    },
  })

  return (
    <div>
      <section className="relative h-[calc(100vh-56px)]">
        <div className="relative w-full h-full bg-ink overflow-hidden">
          <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2">
            <div
              className="flex items-center rounded-xl overflow-hidden"
              style={{
                backdropFilter: 'blur(20px)',
                background: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: 'rgba(0, 0, 0, 0.08) 0px 4px 12px',
              }}
            >
              <button
                aria-label="Zoom out"
                className="w-9 h-9 flex items-center justify-center text-ash/50 hover:text-ash hover:bg-black/[0.04] transition-colors text-lg leading-none select-none"
                type="button"
              >
                −
              </button>
              <div className="w-px h-4 bg-black/[0.08]" />
              <button
                aria-label="Zoom in"
                className="w-9 h-9 flex items-center justify-center text-ash/50 hover:text-ash hover:bg-black/[0.04] transition-colors text-lg leading-none select-none"
                type="button"
              >
                +
              </button>
            </div>
            <span className="text-[11px] text-muted/40 pointer-events-none tabular-nums" style={{ fontVariantNumeric: 'tabular-nums' }}>
              79%
            </span>
          </div>

          <div className="absolute inset-0" style={{ cursor: 'grab' }}>
            <div
              style={{
                position: 'absolute',
                transform: 'translate(-4522.36px, -6011.29px) scale(0.790274)',
                transformOrigin: '0px 0px',
                willChange: 'transform',
              }}
            >
              {sortedProducts.map((product, index) => {
                const position = positions[index]
                const imageUrl = toTemplateImageUrl(product.primaryImageUrl || product.gallery?.[0]?.imageUrl, 'products')

                if (!position) return null

                return (
                  <Link
                    className="gallery-item"
                    href={`/sku/${product.legacyId}`}
                    key={product.id}
                    style={{
                      cursor: 'pointer',
                      display: 'block',
                      height: '192px',
                      left: `${position.left}px`,
                      position: 'absolute',
                      top: `${position.top}px`,
                      width: '160px',
                    }}
                  >
                    <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      {imageUrl ? (
                        <img
                          alt=""
                          draggable="false"
                          src={imageUrl}
                          style={{
                            display: 'block',
                            height: 'auto',
                            maxHeight: '170px',
                            maxWidth: '160px',
                            userSelect: 'none',
                            width: 'auto',
                          }}
                        />
                      ) : null}
                    </div>
                    <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6px' }}>
                      <span
                        className="gallery-label"
                        style={{
                          fontFamily: 'var(--font-noto), STSong, serif',
                          fontSize: '11px',
                          lineHeight: 1,
                          maxWidth: '160px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.name}
                      </span>
                    </div>
                  </Link>
                )
              })}

              <div
                style={{
                  position: 'absolute',
                  left: '6480px',
                  top: '8133px',
                  transform: 'translateY(-50%)',
                  width: '640px',
                  zIndex: 5,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 0,
                }}
              >
                <h1
                  style={{
                    fontFamily: 'var(--font-noto), STSong, serif',
                    fontSize: '96px',
                    fontWeight: 700,
                    color: 'rgb(11, 11, 13)',
                    lineHeight: 1.05,
                    marginBottom: '20px',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  中国卷烟博物馆
                </h1>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                    fontSize: '20px',
                    fontWeight: 500,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'rgba(108, 108, 118, 0.5)',
                    marginBottom: '20px',
                  }}
                >
                  Chinese Cigarette Museum
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                    fontSize: '18px',
                    color: 'rgba(108, 108, 118, 0.35)',
                    letterSpacing: '0.02em',
                    marginBottom: '32px',
                  }}
                >
                  {brandCount.totalDocs} brands&#8194;·&#8194;{products.totalDocs} products
                </p>
                <a
                  href="#collection"
                  style={{
                    pointerEvents: 'auto',
                    fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                    fontSize: '17px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: 'rgb(255, 255, 255)',
                    background: 'rgb(11, 11, 13)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'background 0.15s, transform 0.1s',
                    marginBottom: '28px',
                    padding: '12px 28px',
                    borderRadius: '40px',
                    cursor: 'pointer',
                  }}
                >
                  Browse collection
                  <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 10 10" width="16">
                    <path d="M5 2v6M2 6l3 3 3-3" />
                  </svg>
                </a>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '36px', pointerEvents: 'auto' }}>
                  <button
                    style={{
                      fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      color: 'rgba(108, 108, 118, 0.45)',
                      background: 'rgba(108, 108, 118, 0.07)',
                      border: 'none',
                      borderRadius: '28px',
                      padding: '10px 22px',
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    type="button"
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-noto), STSong, serif',
                        fontSize: '18px',
                        fontWeight: 700,
                        opacity: 0.7,
                        lineHeight: 1,
                      }}
                    >
                      说
                    </span>
                    How it works
                  </button>
                  <button
                    style={{
                      fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      color: 'rgba(108, 108, 118, 0.45)',
                      background: 'rgba(108, 108, 118, 0.07)',
                      border: 'none',
                      borderRadius: '28px',
                      padding: '10px 22px',
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    type="button"
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-noto), STSong, serif',
                        fontSize: '18px',
                        fontWeight: 700,
                        opacity: 0.7,
                        lineHeight: 1,
                      }}
                    >
                      缘
                    </span>
                    Why this exists
                  </button>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
                    fontSize: '14px',
                    color: 'rgba(108, 108, 118, 0.38)',
                    letterSpacing: '0.02em',
                  }}
                >
                  X by @0x_ultra
                </p>
              </div>
            </div>
          </div>

          <div className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 z-20">
            <div className="w-80 h-[70vh] max-h-[720px] bg-white border border-black/[0.08] rounded-l-2xl shadow-md overflow-hidden flex flex-col">
              <button className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 px-2 py-3 bg-white border border-r-0 border-black/[0.08] rounded-l-xl shadow-md hover:shadow-lg transition-shadow" type="button">
                <svg className="text-ash/50" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="14">
                  <path d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <span className="text-[8px] font-bold text-green-500 leading-none">{entries.docs.length}</span>
              </button>
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-ash">Ciggie Chat</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    {entries.docs.length} online
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollBehavior: 'smooth' }}>
                {entries.docs.map((entry) => (
                  <div className="flex gap-2" key={entry.id}>
                    <Link className="flex-shrink-0 mt-0.5" href={`/u/${slugifyName(entry.authorName || 'anonymous')}`}>
                      <div className="w-6 h-6 rounded-full bg-ink-3 text-[10px] text-ash/80 flex items-center justify-center">
                        {(entry.authorName || 'A').slice(0, 1).toUpperCase()}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Link className="text-[11px] font-semibold truncate max-w-[120px] transition-colors text-ash/80 hover:text-ash" href={`/u/${slugifyName(entry.authorName || 'anonymous')}`}>
                          {entry.authorName || 'anonymous'}
                        </Link>
                        <span className="text-[10px] text-muted/30 flex-shrink-0">now</span>
                      </div>
                      <p className="text-[12px] text-ash/70 break-words leading-snug">{entry.excerpt || entry.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[56px] z-40 bg-ink/95 backdrop-blur-xl border-b border-black/[0.05]" id="collection">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-2">
          <div className="w-44 sm:w-56 shrink-0">
            <div className="relative w-full">
              <form action="/" method="GET">
                <div className="relative flex items-center">
                  <svg className="absolute left-3 w-3.5 h-3.5 text-muted/40 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    autoComplete="off"
                    className="w-full bg-ink-2 rounded-full pl-9 pr-3 py-[6px] text-ash placeholder:text-muted/40 focus:outline-none focus:bg-ink-3 transition-colors border border-black/[0.07] focus:border-black/[0.12]"
                    name="q"
                    placeholder="Search products…"
                    readOnly
                    style={{ fontSize: '16px' }}
                    type="text"
                    value=""
                  />
                </div>
              </form>
            </div>
          </div>
          <div className="w-px h-4 bg-black/8 shrink-0 mx-0.5" />
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar flex-1">
            <div className="relative shrink-0">
              <button className="chip transition-all duration-150 chip-active" type="button">
                <span>
                  All<span className="font-chinese ml-1 opacity-50">全部</span>
                </span>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-150" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 12 7">
                  <polyline points="1 1 6 6 11 1" />
                </svg>
              </button>
            </div>
            <div className="relative shrink-0">
              <button className="chip transition-all duration-150 chip-default" type="button">
                <span>
                  Format<span className="font-chinese ml-1 opacity-35">规格</span>
                </span>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-150" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 12 7">
                  <polyline points="1 1 6 6 11 1" />
                </svg>
              </button>
            </div>
            <div className="relative shrink-0">
              <button className="chip transition-all duration-150 chip-default" type="button">
                <span>
                  Price<span className="font-chinese ml-1 opacity-35">价格</span>
                </span>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-150" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 12 7">
                  <polyline points="1 1 6 6 11 1" />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-w-0" />
            <div className="relative shrink-0">
              <button className="chip transition-all duration-150 chip-active" type="button">
                <span>Newest</span>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-150" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 12 7">
                  <polyline points="1 1 6 6 11 1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-5 pb-3">
        <p className="text-[12px] text-muted/50 font-medium">{products.totalDocs} products</p>
      </div>
      <main className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
          {sortedProducts.map((product, index) => {
            const imageUrl = toTemplateImageUrl(product.primaryImageUrl || product.gallery?.[0]?.imageUrl, 'products')
            const brandName = typeof product.brand === 'object' ? product.brand?.name || '' : ''
            const priceValue = getProductPrice(product as unknown as Record<string, unknown>)
            const price = typeof priceValue === 'number' ? `¥${priceValue}` : ''

            return (
              <Link
                className="sku-card group block relative bg-ink border border-black/[0.07] rounded-2xl overflow-hidden transition-all duration-200 fade-up"
                href={`/sku/${product.legacyId}`}
                key={`collection-${product.id}`}
                style={{ animationDelay: `${index * 15}ms` }}
              >
                <div className="aspect-square bg-ink-2 relative flex items-center justify-center overflow-hidden rounded-t-2xl">
                  {imageUrl ? (
                    <img
                      alt={product.name}
                      className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.05]"
                      loading="lazy"
                      src={imageUrl}
                    />
                  ) : null}
                </div>
                <div className="px-3 py-2.5 border-t border-black/[0.05]">
                  <div className="font-chinese text-[12px] font-medium text-ash truncate leading-tight">{product.name}</div>
                  <div className="text-[11px] text-muted/70 truncate mt-0.5 leading-tight">{brandName}</div>
                </div>
                <div className="sku-card-overlay">
                  <span className="stamp w-fit mb-2 text-[9px] text-gold border-gold/30 bg-gold/10">大陆 · Mainland China</span>
                  <div className="text-[10px] text-ash/60 leading-tight mb-1 break-words">{product.englishName || product.slug}</div>
                  <div className="text-[11px] text-muted/60 mb-2">{brandName}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-gold">{price}</span>
                    <div className="flex gap-1.5">
                      <button aria-label="Add to favorites" className="w-6 h-6 rounded-full flex items-center justify-center transition-all text-sm text-ash/25 hover:text-ash/60" type="button">
                        ☆
                      </button>
                      <button aria-label="Mark as tried" className="w-6 h-6 rounded-full flex items-center justify-center transition-all text-[11px] text-ash/25 hover:text-ash/60" type="button">
                        ○
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
