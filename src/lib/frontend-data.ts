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

export const toTemplateImageUrl = (value: string | null | undefined, category: 'products' | 'brands' | 'avatars') => {
  const filename = getFilenameFromUrl(value)
  if (!filename) return ''
  return `/api/img/${category}/${filename}`
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
