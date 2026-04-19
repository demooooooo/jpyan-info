import fs from 'fs/promises'
import path from 'path'

type AssetManifest = {
  brands?: string[]
  products?: string[]
}

const root = process.cwd()
const manifestPath = path.join(root, 'src', 'lib', 'generated', 'template-asset-manifest.json')
const templateImgRoot = path.join(root, 'template-site', 'api', 'img')
const publicImgRoot = path.join(root, 'public', 'template-api-img')

const readManifest = async (): Promise<Record<string, Set<string>>> => {
  const raw = await fs.readFile(manifestPath, 'utf8')
  const data = JSON.parse(raw) as AssetManifest

  return {
    brands: new Set(data.brands || []),
    products: new Set(data.products || []),
  }
}

const pruneCategory = async (baseDir: string, category: string, keep: Set<string>) => {
  const categoryDir = path.join(baseDir, category)

  try {
    const entries = await fs.readdir(categoryDir, { withFileTypes: true })
    let removed = 0

    for (const entry of entries) {
      if (!entry.isFile()) continue
      if (keep.has(entry.name)) continue

      await fs.unlink(path.join(categoryDir, entry.name))
      removed += 1
    }

    return removed
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return 0
    }
    throw error
  }
}

async function main() {
  const manifest = await readManifest()

  const removedTemplateProducts = await pruneCategory(templateImgRoot, 'products', manifest.products)
  const removedPublicProducts = await pruneCategory(publicImgRoot, 'products', manifest.products)
  const removedTemplateBrands = await pruneCategory(templateImgRoot, 'brands', manifest.brands)
  const removedPublicBrands = await pruneCategory(publicImgRoot, 'brands', manifest.brands)

  console.log(
    [
      `Removed ${removedTemplateProducts} unused template product images.`,
      `Removed ${removedPublicProducts} unused public product images.`,
      `Removed ${removedTemplateBrands} unused template brand images.`,
      `Removed ${removedPublicBrands} unused public brand images.`,
    ].join(' '),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
