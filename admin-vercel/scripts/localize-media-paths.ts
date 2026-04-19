import { config as loadEnv } from 'dotenv'
import path from 'path'
import { Client } from 'pg'

loadEnv({ path: '.env' })
loadEnv({ path: '.env.local', override: true })

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL is required')
}

const toLocalPath = (value: string | null | undefined, category: 'products' | 'brands') => {
  if (!value) return value
  if (value.startsWith(`/api/img/${category}/`)) return value

  const clean = value.split('?')[0]
  const filename = path.basename(clean)
  if (!filename || filename === '.' || filename === '/' || filename === '\\') return value

  return `/api/img/${category}/${filename}`
}

const replaceHtmlImageUrls = (value: string | null | undefined, category: 'products' | 'brands') => {
  if (!value) return value

  return value.replace(/https?:\/\/[^"'\\s>]+/gi, (match) => toLocalPath(match, category) || match)
}

const main = async () => {
  const client = new Client({ connectionString })
  await client.connect()

  try {
    const brands = await client.query<{ id: number; logo_url: string | null }>('select id, logo_url from brands')
    let updatedBrands = 0

    for (const brand of brands.rows) {
      const nextLogo = toLocalPath(brand.logo_url, 'brands')
      if (!nextLogo || nextLogo === brand.logo_url) continue

      await client.query('update brands set logo_url = $1 where id = $2', [nextLogo, brand.id])
      updatedBrands += 1
    }
    console.log(`[media] brands done: ${updatedBrands}/${brands.rowCount ?? 0}`)

    const products = await client.query<{ id: number; intro_html: string | null; primary_image_url: string | null }>('select id, primary_image_url, intro_html from products')
    let updatedProducts = 0
    let updatedIntroHtml = 0

    for (const product of products.rows) {
      const nextPrimary = toLocalPath(product.primary_image_url, 'products')
      const nextIntroHtml = replaceHtmlImageUrls(product.intro_html, 'products')
      const primaryChanged = !!nextPrimary && nextPrimary !== product.primary_image_url
      const introChanged = (nextIntroHtml || null) !== (product.intro_html || null)

      if (!primaryChanged && !introChanged) continue

      await client.query('update products set primary_image_url = $1, intro_html = $2 where id = $3', [nextPrimary || product.primary_image_url, nextIntroHtml || product.intro_html, product.id])
      updatedProducts += 1
      if (introChanged) updatedIntroHtml += 1
    }
    console.log(`[media] products done: ${updatedProducts}/${products.rowCount ?? 0}`)

    const gallery = await client.query<{ id: string; image_url: string }>('select id, image_url from products_gallery')
    let updatedGallery = 0

    for (const item of gallery.rows) {
      const nextImage = toLocalPath(item.image_url, 'products')
      if (!nextImage || nextImage === item.image_url) continue

      await client.query('update products_gallery set image_url = $1 where id = $2', [nextImage, item.id])
      updatedGallery += 1
    }

    console.log(`[media] updated brands: ${updatedBrands}`)
    console.log(`[media] updated products: ${updatedProducts}`)
    console.log(`[media] updated intro html: ${updatedIntroHtml}`)
    console.log(`[media] updated gallery images: ${updatedGallery}`)
  } finally {
    await client.end()
  }

  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
