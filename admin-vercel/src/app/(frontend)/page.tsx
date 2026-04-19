import Link from 'next/link'

import { HomeHero } from './HomeHero'

import { slugifyName, toTemplateImageUrl } from '@/lib/frontend-data'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

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
      limit: 1000,
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
      <HomeHero
        brandCount={brandCount.totalDocs}
        entries={entries.docs}
        products={sortedProducts}
        productCount={products.totalDocs}
      />

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
