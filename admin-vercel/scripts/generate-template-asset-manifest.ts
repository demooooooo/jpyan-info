import 'dotenv/config'

import fs from 'fs/promises'
import path from 'path'

import mysql from 'mysql2/promise'

type BrandRow = {
  logoImageUrl: string | null
}

type ProductRow = {
  image: string | null
  images: string | null
}

const root = process.cwd()
const outputPath = path.join(root, 'src', 'lib', 'generated', 'template-asset-manifest.json')

const getFilename = (value?: string | null) => {
  if (!value) return null
  const clean = String(value).replace(/\\/g, '/').split('?')[0]
  const parts = clean.split('/').filter(Boolean)
  return parts.at(-1) || null
}

const addMany = (set: Set<string>, values: Array<string | null | undefined>) => {
  for (const value of values) {
    const filename = getFilename(value)
    if (filename) {
      set.add(filename)
    }
  }
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '123456',
    database: process.env.MYSQL_DATABASE || 'yyanhub',
  })

  try {
    const [brandRowsResult] = await connection.query(
      'select logoImageUrl from corecmsbrand order by id asc',
    )
    const brandRows = brandRowsResult as BrandRow[]

    const [productRowsResult] = await connection.query(
      `select image, images
       from corecmsgoods
       where isDel = 0
       order by id asc`,
    )
    const productRows = productRowsResult as ProductRow[]

    const productFilenames = new Set<string>()
    const brandFilenames = new Set<string>()

    for (const row of brandRows) {
      addMany(brandFilenames, [row.logoImageUrl])
    }

    for (const row of productRows) {
      const galleryValues = [row.image, row.images]
        .filter(Boolean)
        .flatMap((item) => String(item).split(','))
        .map((item) => item.trim())
        .filter(Boolean)

      addMany(productFilenames, galleryValues)
    }

    const data = {
      brands: [...brandFilenames].sort(),
      products: [...productFilenames].sort(),
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2) + '\n', 'utf8')

    console.log(
      `Generated template asset manifest with ${data.brands.length} brand images and ${data.products.length} product images.`,
    )
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
