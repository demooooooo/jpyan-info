import 'dotenv/config'

import fs from 'fs/promises'
import path from 'path'

import mysql from 'mysql2/promise'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import slugify from 'slugify'

type BrandRow = {
  id: number
  isShow: Buffer | number | null
  logoImageUrl: string | null
  name: string
  sort: number | null
}

type ProductRow = {
  brief: string | null
  brandId: number | null
  buyCount: number | null
  commentsCount: number | null
  id: number
  image: string | null
  images: string | null
  intro: string | null
  isHot: Buffer | number | null
  isMarketable: Buffer | number | null
  isRecommend: Buffer | number | null
  name: string
  parameters: string | null
  sort: number | null
  viewCount: number | null
}

type VariantRow = {
  barcode: string | null
  costprice: number | null
  goodsId: number
  mktprice: number | null
  price: number | null
  sn: string | null
  stock: number | null
}

type ArticleRow = {
  contentBody: string | null
  createTime: string | Date | null
  id: number
  title: string
}

const toBool = (value: Buffer | number | null | undefined) => {
  if (Buffer.isBuffer(value)) {
    return value[0] === 1
  }

  return value === 1
}

const makeSlug = (value: string, fallback: string, suffix?: string | number) => {
  const slug = slugify(value || fallback, { lower: true, strict: true, trim: true })
  const base = slug || fallback
  return suffix ? `${base}-${suffix}` : base
}

const uploadSourceDir =
  process.env.UPLOAD_SOURCE_DIR || 'E:/EasyLink/yyanhub/信息站-WP/yyanhub/image/upload'
const importedMediaDir = path.resolve(process.cwd(), 'public/imported-media')

const ensureImportedMediaDir = async () => {
  await fs.mkdir(importedMediaDir, { recursive: true })
}

const findLocalImage = async (sourceUrl?: string | null) => {
  if (!sourceUrl) return sourceUrl || null

  const cleanUrl = sourceUrl.replace(/\\/g, '/')
  const filename = cleanUrl.split('/').filter(Boolean).pop()

  if (!filename) return sourceUrl

  const matchingDir = cleanUrl
    .split('/')
    .find((part) => /^\d{8}$/.test(part))

  const directPath = matchingDir ? path.join(uploadSourceDir, matchingDir, filename) : null

  if (directPath) {
    try {
      await fs.access(directPath)
      const targetPath = path.join(importedMediaDir, filename)
      await fs.copyFile(directPath, targetPath)
      return `/imported-media/${filename}`
    } catch {
      // Fall back to external URL below.
    }
  }

  return sourceUrl
}

const parseParameters = (raw?: string | null) => {
  if (!raw) return []

  return raw
    .split('|')
    .map((segment, index) => {
      const [labelPart, valuePart] = segment.split(':')
      return {
        label: labelPart?.trim() || `参数 ${index + 1}`,
        value: valuePart?.trim() || '',
      }
    })
    .filter((item) => item.value)
}

const buildGallery = async (product: ProductRow) => {
  const source = [product.image, product.images]
    .filter(Boolean)
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean)

  const unique = [...new Set(source)]
  const copied = await Promise.all(unique.map((item) => findLocalImage(item)))

  return copied.filter(Boolean).map((imageUrl) => ({ imageUrl: imageUrl as string }))
}

async function main() {
  await ensureImportedMediaDir()

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DATABASE || 'yyanhub',
  })

  const config = await configPromise
  const payload = await getPayload({ config })

  try {
    const [brandRowsResult] = await connection.query(
      'select id, name, logoImageUrl, sort, isShow from corecmsbrand order by id asc',
    )
    const brandRows = brandRowsResult as BrandRow[]
    const [productRowsResult] = await connection.query(
      `select id, name, brief, image, images, intro, parameters, brandId, isMarketable, sort, isRecommend, isHot, commentsCount, viewCount, buyCount
       from corecmsgoods
       where isDel = 0
       order by id asc`,
    )
    const productRows = productRowsResult as ProductRow[]
    const [variantRowsResult] = await connection.query(
      'select goodsId, barcode, sn, price, costprice, mktprice, stock from corecmsproducts where isDefalut = 1 and isDel = 0',
    )
    const variantRows = variantRowsResult as VariantRow[]
    const [articleRowsResult] = await connection.query(
      'select id, title, contentBody, createTime from corecmsarticle where isDel = 0 and isPub = 1 order by id asc',
    )
    const articleRows = articleRowsResult as ArticleRow[]

    const brandByLegacyId = new Map<number, number>()
    const productDocs: Array<{ id: number; legacyId: number; title: string }> = []

    for (const row of brandRows) {
      const logoUrl = await findLocalImage(row.logoImageUrl)
      const existing = await payload.find({
        collection: 'brands',
        limit: 1,
        where: {
          legacyId: {
            equals: row.id,
          },
        },
      })

      const data = {
        legacyId: row.id,
        name: row.name,
        slug: makeSlug(row.name, 'brand', row.id),
        logoUrl,
        isVisible: toBool(row.isShow),
        sort: row.sort || 0,
      }

      const doc = existing.docs[0]
        ? await payload.update({ collection: 'brands', id: existing.docs[0].id, data })
        : await payload.create({ collection: 'brands', data })

      brandByLegacyId.set(row.id, Number(doc.id))
    }

    const variantMap = new Map<number, VariantRow>()
    for (const row of variantRows) {
      variantMap.set(row.goodsId, row)
    }

    for (const row of productRows) {
      const variant = variantMap.get(row.id)
      const gallery = await buildGallery(row)
      const existing = await payload.find({
        collection: 'products',
        limit: 1,
        where: {
          legacyId: {
            equals: row.id,
          },
        },
      })

      const data = {
        legacyId: row.id,
        name: row.name,
        slug: makeSlug(row.name, 'sku', row.id),
        brief: row.brief,
        introHtml: row.intro,
        brand: row.brandId ? brandByLegacyId.get(row.brandId) : undefined,
        primaryImageUrl: gallery[0]?.imageUrl || null,
        gallery,
        pricing: {
          price: variant?.price || undefined,
          marketPrice: variant?.mktprice || undefined,
          costPrice: variant?.costprice || undefined,
        },
        inventory: {
          stock: variant?.stock || undefined,
          barcode: variant?.barcode || undefined,
          skuCode: variant?.sn || undefined,
        },
        specifications: parseParameters(row.parameters),
        stats: {
          commentsCount: row.commentsCount || 0,
          viewCount: row.viewCount || 0,
          buyCount: row.buyCount || 0,
        },
        showOnHome: toBool(row.isRecommend),
        isMarketable: toBool(row.isMarketable),
        isRecommend: toBool(row.isRecommend),
        isHot: toBool(row.isHot),
        sort: row.sort || 0,
        legacyParametersRaw: row.parameters,
      }

      const doc = existing.docs[0]
        ? await payload.update({ collection: 'products', id: existing.docs[0].id, data })
        : await payload.create({ collection: 'products', data })

      productDocs.push({ id: Number(doc.id), legacyId: row.id, title: row.name })
    }

    const visibleProducts = productDocs.slice(0, Math.min(productDocs.length, articleRows.length))

    for (let index = 0; index < articleRows.length; index += 1) {
      const article = articleRows[index]
      const product = visibleProducts[index]
      if (!product) break

      const existing = await payload.find({
        collection: 'product-entries',
        limit: 1,
        where: {
          legacyId: {
            equals: article.id,
          },
        },
      })

      const entryType: 'community' | 'feed' = index % 2 === 0 ? 'community' : 'feed'
      const data = {
        legacyId: article.id,
        title: article.title,
        slug: makeSlug(article.title, 'entry', article.id),
        type: entryType,
        product: product.id,
        excerpt: `${product.title} 关联的旧站内容导入占位。`,
        content: article.contentBody || '',
        authorName: '旧站导入',
        publishedAt: article.createTime ? new Date(article.createTime).toISOString() : new Date().toISOString(),
        isVisible: true,
      }

      if (existing.docs[0]) {
        await payload.update({ collection: 'product-entries', id: existing.docs[0].id, data })
      } else {
        await payload.create({ collection: 'product-entries', data })
      }
    }

    console.log(
      `Imported ${brandRows.length} brands, ${productRows.length} products and ${Math.min(articleRows.length, visibleProducts.length)} linked entries.`,
    )
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
