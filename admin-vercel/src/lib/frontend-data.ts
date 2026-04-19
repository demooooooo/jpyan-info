import path from 'path'

import type { ProductEntry, Product } from '@/payload-types'

const initials = (value?: string | null) => {
  if (!value) return '?'
  return value
    .replace(/^@/, '')
    .trim()
    .slice(0, 1)
    .toUpperCase()
}

export const slugifyName = (value?: string | null) =>
  (value || 'user')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'user'

export const getFilenameFromUrl = (value?: string | null) => {
  if (!value) return null

  const clean = value.split('?')[0]
  const filename = path.basename(clean)

  return filename || null
}

export const toLocalImagePath = (value: string | null | undefined, category: 'products' | 'brands' | 'avatars') => {
  if (!value) return ''

  if (value.startsWith(`/api/img/${category}/`)) {
    return value
  }

  const filename = getFilenameFromUrl(value)
  if (!filename) return ''

  return `/api/img/${category}/${filename}`
}

export const toTemplateImageUrl = (value: string | null | undefined, category: 'products' | 'brands' | 'avatars') => {
  return toLocalImagePath(value, category)
}

export const toMoney = (value: unknown) => {
  let parsed: number | null = null

  if (typeof value === 'number') {
    parsed = Number.isFinite(value) && value > 0 ? value : null
  } else if (typeof value === 'string') {
    const next = Number(value)
    parsed = Number.isFinite(next) && next > 0 ? next : null
  }

  if (parsed == null) return null

  if (parsed >= 1000) {
    parsed = parsed / 100
  }

  return Number.isInteger(parsed) ? parsed : Number(parsed.toFixed(2))
}

export const getProductPrice = (product: Record<string, unknown>) => {
  const pricing = 'pricing' in product && product.pricing && typeof product.pricing === 'object' ? (product.pricing as Record<string, unknown>) : null

  return toMoney(pricing?.price) ?? toMoney(pricing?.marketPrice)
}

const FORMAT_RULES = [
  { label: '爆珠', matcher: /爆珠|splash|capsule/i },
  { label: '细支', matcher: /细支|100's|100s|slim/i },
  { label: '长杆', matcher: /长杆|long/i },
  { label: '硬盒', matcher: /硬盒|box|ks/i },
  { label: '软盒', matcher: /软盒|soft/i },
  { label: '薄荷', matcher: /薄荷|menthol|mint/i },
]

export const getProductFormatTags = (product: Pick<Product, 'name' | 'brief' | 'englishName' | 'specifications'>) => {
  const haystack = [product.name, product.brief, product.englishName, ...(product.specifications?.map((item) => `${item.label} ${item.value}`) || [])]
    .filter(Boolean)
    .join(' ')

  return FORMAT_RULES.filter((rule) => rule.matcher.test(haystack)).map((rule) => rule.label)
}

export type CommunityRow = {
  authorName: string
  brands: number
  favorites: number
  initials: string
  profilePath: string
  tried: number
}

export const buildCommunityRows = (entries: ProductEntry[]): CommunityRow[] => {
  const stats = new Map<
    string,
    {
      brands: Set<string>
      favorites: number
      tried: number
    }
  >()

  for (const entry of entries) {
    const authorName = entry.authorName?.trim() || 'anonymous'
    const item =
      stats.get(authorName) ||
      {
        brands: new Set<string>(),
        favorites: 0,
        tried: 0,
      }

    const product = typeof entry.product === 'object' ? entry.product : null
    const brand = product && typeof product.brand === 'object' ? product.brand : null

    if (brand?.id) {
      item.brands.add(String(brand.id))
    }

    item.tried += 1
    if (entry.type === 'feed') {
      item.favorites += 1
    }

    stats.set(authorName, item)
  }

  return [...stats.entries()]
    .map(([authorName, item]) => ({
      authorName,
      brands: item.brands.size,
      favorites: item.favorites,
      initials: initials(authorName),
      profilePath: `/u/${slugifyName(authorName)}`,
      tried: item.tried,
    }))
    .sort((a, b) => {
      if (b.tried !== a.tried) return b.tried - a.tried
      if (b.brands !== a.brands) return b.brands - a.brands
      return a.authorName.localeCompare(b.authorName, 'zh-CN')
    })
}

export const getBrandName = (product?: Product | null) => {
  const brand = product && typeof product.brand === 'object' ? product.brand : null
  return brand?.name || ''
}
