'use client'

import Link from 'next/link'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { getProductPrice, toTemplateImageUrl } from '@/lib/frontend-data'

type ClientProduct = {
  brand?: { id: number | string; name: string } | number | string | null
  brief?: string | null
  createdAt?: string
  englishName?: string | null
  gallery?: Array<{ imageUrl?: string | null }> | null
  id: number | string
  legacyId?: number | string | null
  name: string
  pricing?: {
    marketPrice?: number | null
    price?: number | null
  } | null
  primaryImageUrl?: string | null
  slug?: string | null
  sort?: number | null
}

type CollectionBrowserProps = {
  labels: {
    searchPlaceholder: string
  }
  products: ClientProduct[]
}

const getBrandName = (product: ClientProduct) => {
  if (!product.brand) return ''
  return typeof product.brand === 'object' ? product.brand.name : ''
}

export const filterCollectionProducts = (
  products: ClientProduct[],
  filters: {
    query: string
  },
) => {
  const keyword = filters.query.trim().toLowerCase()
  const next = products.filter((product) => {
    const searchable = [product.name, product.englishName, product.slug, product.brief, getBrandName(product)].filter(Boolean).join(' ').toLowerCase()

    if (keyword && !searchable.includes(keyword)) return false

    return true
  })

  next.sort((left, right) => {
    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime() || (right.sort || 0) - (left.sort || 0)
  })

  return next
}

export function CollectionBrowser({ labels, products }: CollectionBrowserProps) {
  const [draftQuery, setDraftQuery] = useState('')
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pendingInputTopRef = useRef<number | null>(null)
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const [lockedResultsMinHeight, setLockedResultsMinHeight] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(draftQuery)
    }, 180)

    return () => {
      window.clearTimeout(timer)
    }
  }, [draftQuery])

  useEffect(() => {
    if (document.activeElement === inputRef.current && resultsRef.current) {
      const nextHeight = resultsRef.current.offsetHeight
      setLockedResultsMinHeight((current) => {
        if (current == null) return nextHeight
        return Math.max(current, nextHeight)
      })
      return
    }

    setLockedResultsMinHeight(null)
  }, [draftQuery])

  const filteredProducts = useMemo(() => {
    return filterCollectionProducts(products, {
      query,
    })
  }, [products, query])

  useLayoutEffect(() => {
    const expectedTop = pendingInputTopRef.current
    if (expectedTop == null) return
    if (document.activeElement !== inputRef.current) {
      pendingInputTopRef.current = null
      return
    }

    const currentTop = inputRef.current?.getBoundingClientRect().top
    if (typeof currentTop === 'number') {
      const offset = currentTop - expectedTop
      if (Math.abs(offset) > 1) {
        window.scrollBy({
          top: offset,
          left: 0,
          behavior: 'auto',
        })
      }
    }

    const reset = window.requestAnimationFrame(() => {
      pendingInputTopRef.current = null
    })

    return () => window.cancelAnimationFrame(reset)
  }, [filteredProducts.length, query])

  return (
    <>
      <div className="sticky top-[56px] z-40 bg-ink/95 backdrop-blur-xl border-b border-black/[0.05]" id="collection" style={{ overflowAnchor: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-2">
          <div className="w-44 sm:w-56 shrink-0">
            <div className="relative w-full">
              <div className="relative flex items-center">
                <svg className="absolute left-3 w-3.5 h-3.5 text-muted/40 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  autoComplete="off"
                  className="w-full bg-ink-2 rounded-full pl-9 pr-3 py-[6px] text-ash placeholder:text-muted/40 focus:outline-none focus:bg-ink-3 transition-colors border border-black/[0.07] focus:border-black/[0.12]"
                  name="q"
                  onChange={(event) => {
                    pendingInputTopRef.current = inputRef.current?.getBoundingClientRect().top ?? null
                    if (resultsRef.current) {
                      setLockedResultsMinHeight(resultsRef.current.offsetHeight)
                    }
                    setDraftQuery(event.target.value)
                  }}
                  onBlur={() => {
                    pendingInputTopRef.current = null
                    setLockedResultsMinHeight(null)
                  }}
                  placeholder={labels.searchPlaceholder}
                  ref={inputRef}
                  style={{ fontSize: '16px' }}
                  type="text"
                  value={draftQuery}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-5 pb-3">
        <p className="text-[12px] text-muted/50 font-medium">共 {filteredProducts.length} 个商品</p>
      </div>
      <main className="max-w-7xl mx-auto px-5 sm:px-8 pb-16" style={{ overflowAnchor: 'none' }}>
        <div ref={resultsRef} style={{ minHeight: lockedResultsMinHeight ?? undefined, overflowAnchor: 'none' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3" style={{ overflowAnchor: 'none' }}>
          {filteredProducts.map((product, index) => {
            const imageUrl = toTemplateImageUrl(product.primaryImageUrl || product.gallery?.[0]?.imageUrl, 'products')
            const brandName = getBrandName(product)
            const priceValue = getProductPrice(product as unknown as Record<string, unknown>)
            const price = typeof priceValue === 'number' ? `JPY ${priceValue}` : ''

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
                  <span className="stamp w-fit mb-2 text-[9px] text-gold border-gold/30 bg-gold/10">日本 · Japan</span>
                  <div className="text-[10px] text-ash/60 leading-tight mb-1 break-words">{product.englishName || product.slug}</div>
                  <div className="text-[11px] text-muted/60 mb-2">{brandName}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-gold">{price}</span>
                    <div className="flex gap-1.5">
                      <button aria-label="收藏商品" className="w-6 h-6 rounded-full flex items-center justify-center transition-all text-sm text-ash/25 hover:text-ash/60" type="button">
                        ☆
                      </button>
                      <button aria-label="标记尝试" className="w-6 h-6 rounded-full flex items-center justify-center transition-all text-[11px] text-ash/25 hover:text-ash/60" type="button">
                        ○
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          </div>
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-muted/45 text-[13px]">没有找到符合条件的商品。</div>
          ) : null}
        </div>
      </main>
    </>
  )
}
