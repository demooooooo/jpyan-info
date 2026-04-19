'use client'

import Link from 'next/link'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { getProductFormatTags, getProductPrice, toTemplateImageUrl } from '@/lib/frontend-data'

type ClientBrand = {
  id: number | string
  name: string
}

type ClientProduct = {
  brand?: ClientBrand | number | string | null
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
  brands: ClientBrand[]
  labels: {
    all: string
    format: string
    newest: string
    price: string
    searchPlaceholder: string
  }
  products: ClientProduct[]
}

const PRICE_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '50元以下', value: 'under-50' },
  { label: '50-80元', value: '50-80' },
  { label: '80元以上', value: '80-plus' },
]

const SORT_OPTIONS = [
  { label: '最新上架', value: 'newest' },
  { label: '价格从低到高', value: 'price-asc' },
  { label: '价格从高到低', value: 'price-desc' },
]

const matchesPrice = (value: number | null, filter: string) => {
  if (!filter || filter === 'all') return true
  if (value == null) return false
  if (filter === 'under-50') return value < 50
  if (filter === '50-80') return value >= 50 && value <= 80
  if (filter === '80-plus') return value > 80
  return true
}

const getBrandId = (product: ClientProduct) => {
  if (!product.brand) return ''
  return typeof product.brand === 'object' ? String(product.brand.id) : String(product.brand)
}

const getBrandName = (product: ClientProduct) => {
  if (!product.brand) return ''
  return typeof product.brand === 'object' ? product.brand.name : ''
}

export const filterCollectionProducts = (
  products: ClientProduct[],
  filters: {
    brandFilter: string
    formatFilter: string
    priceFilter: string
    query: string
    sortKey: string
  },
) => {
  const keyword = filters.query.trim().toLowerCase()
  const next = products.filter((product) => {
    const price = getProductPrice(product as unknown as Record<string, unknown>)
    const formatTags = getProductFormatTags(product)
    const searchable = [product.name, product.englishName, product.slug, product.brief, getBrandName(product)].filter(Boolean).join(' ').toLowerCase()

    if (keyword && !searchable.includes(keyword)) return false
    if (filters.brandFilter !== 'all' && getBrandId(product) !== filters.brandFilter) return false
    if (filters.formatFilter !== 'all' && !formatTags.includes(filters.formatFilter)) return false
    if (!matchesPrice(price, filters.priceFilter)) return false

    return true
  })

  next.sort((left, right) => {
    const leftPrice = getProductPrice(left as unknown as Record<string, unknown>) ?? -1
    const rightPrice = getProductPrice(right as unknown as Record<string, unknown>) ?? -1

    if (filters.sortKey === 'price-asc') return leftPrice - rightPrice
    if (filters.sortKey === 'price-desc') return rightPrice - leftPrice

    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime() || (right.sort || 0) - (left.sort || 0)
  })

  return next
}

export function CollectionBrowser({ brands, labels, products }: CollectionBrowserProps) {
  const [draftQuery, setDraftQuery] = useState('')
  const [query, setQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [sortKey, setSortKey] = useState('newest')
  const [openMenu, setOpenMenu] = useState<null | 'brand' | 'format' | 'price' | 'sort'>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pendingInputTopRef = useRef<number | null>(null)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(draftQuery)
    }, 180)

    return () => {
      window.clearTimeout(timer)
    }
  }, [draftQuery])

  const formatOptions = useMemo(() => {
    const values = new Set<string>()
    for (const product of products) {
      for (const tag of getProductFormatTags(product)) {
        values.add(tag)
      }
    }

    return [{ label: labels.format, value: 'all' }, ...[...values].map((value) => ({ label: value, value }))]
  }, [labels.format, products])

  const brandOptions = useMemo(
    () => [{ label: labels.all, value: 'all' }, ...brands.map((brand) => ({ label: brand.name, value: String(brand.id) }))],
    [brands, labels.all],
  )

  const filteredProducts = useMemo(() => {
    return filterCollectionProducts(products, {
      brandFilter,
      formatFilter,
      priceFilter,
      sortKey,
      query,
    })
  }, [brandFilter, formatFilter, priceFilter, products, query, sortKey])

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

  const currentBrandLabel = brandOptions.find((item) => item.value === brandFilter)?.label || labels.all
  const currentFormatLabel = formatOptions.find((item) => item.value === formatFilter)?.label || labels.format
  const currentPriceLabel = PRICE_OPTIONS.find((item) => item.value === priceFilter)?.label || labels.price
  const currentSortLabel = SORT_OPTIONS.find((item) => item.value === sortKey)?.label || labels.newest

  const renderMenu = (items: Array<{ label: string; value: string }>, selected: string, onSelect: (value: string) => void) => (
    <div className="absolute top-full left-0 mt-2 min-w-[180px] rounded-2xl border border-black/[0.08] bg-ink p-2 shadow-2xl z-50">
      {items.map((item) => (
        <button
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] transition-colors ${
            item.value === selected ? 'bg-ink-3 text-ash' : 'text-muted/70 hover:bg-ink-2 hover:text-ash'
          }`}
          key={item.value}
          onClick={() => {
            onSelect(item.value)
            setOpenMenu(null)
          }}
          type="button"
        >
          <span>{item.label}</span>
          {item.value === selected ? <span className="text-gold">✓</span> : null}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <div className="sticky top-[56px] z-40 bg-ink/95 backdrop-blur-xl border-b border-black/[0.05]" id="collection" style={{ overflowAnchor: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-2" ref={menuRef}>
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
                    setDraftQuery(event.target.value)
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
          <div className="w-px h-4 bg-black/8 shrink-0 mx-0.5" />
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar flex-1">
            <div className="relative shrink-0">
              <button className={`chip transition-all duration-150 ${brandFilter === 'all' ? 'chip-active' : 'chip-default'}`} onClick={() => setOpenMenu(openMenu === 'brand' ? null : 'brand')} type="button">
                <span>{currentBrandLabel}</span>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-150" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 12 7">
                  <polyline points="1 1 6 6 11 1" />
                </svg>
              </button>
              {openMenu === 'brand' ? renderMenu(brandOptions, brandFilter, setBrandFilter) : null}
            </div>
            <div className="relative shrink-0">
              <button className={`chip transition-all duration-150 ${formatFilter === 'all' ? 'chip-default' : 'chip-active'}`} onClick={() => setOpenMenu(openMenu === 'format' ? null : 'format')} type="button">
                <span>{currentFormatLabel}</span>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-150" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 12 7">
                  <polyline points="1 1 6 6 11 1" />
                </svg>
              </button>
              {openMenu === 'format' ? renderMenu(formatOptions, formatFilter, setFormatFilter) : null}
            </div>
            <div className="relative shrink-0">
              <button className={`chip transition-all duration-150 ${priceFilter === 'all' ? 'chip-default' : 'chip-active'}`} onClick={() => setOpenMenu(openMenu === 'price' ? null : 'price')} type="button">
                <span>{currentPriceLabel}</span>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-150" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 12 7">
                  <polyline points="1 1 6 6 11 1" />
                </svg>
              </button>
              {openMenu === 'price' ? renderMenu(PRICE_OPTIONS, priceFilter, setPriceFilter) : null}
            </div>
            <div className="flex-1 min-w-0" />
            <div className="relative shrink-0">
              <button className="chip transition-all duration-150 chip-active" onClick={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')} type="button">
                <span>{currentSortLabel}</span>
                <svg className="w-3 h-3 shrink-0 transition-transform duration-150" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 12 7">
                  <polyline points="1 1 6 6 11 1" />
                </svg>
              </button>
              {openMenu === 'sort' ? renderMenu(SORT_OPTIONS, sortKey, setSortKey) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-5 pb-3">
        <p className="text-[12px] text-muted/50 font-medium">共 {filteredProducts.length} 个商品</p>
      </div>
      <main className="max-w-7xl mx-auto px-5 sm:px-8 pb-16" style={{ overflowAnchor: 'none' }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3" style={{ overflowAnchor: 'none' }}>
          {filteredProducts.map((product, index) => {
            const imageUrl = toTemplateImageUrl(product.primaryImageUrl || product.gallery?.[0]?.imageUrl, 'products')
            const brandName = getBrandName(product)
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
      </main>
    </>
  )
}
