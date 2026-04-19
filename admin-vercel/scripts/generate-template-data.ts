import fs from 'fs/promises'
import path from 'path'

const root = process.cwd()
const templateRoot = path.join(root, 'template-site')
const templateIndexPath = path.join(templateRoot, 'index.html')
const templateImagesDir = path.join(templateRoot, 'api', 'img')
const publicTemplateImagesDir = path.join(root, 'public', 'template-api-img')
const assetManifestPath = path.join(root, 'src', 'lib', 'generated', 'template-asset-manifest.json')
const outputPath = path.join(root, 'src', 'lib', 'generated', 'template-home-positions.ts')

const positionPattern = /left:\s*([0-9.]+)px;\s*top:\s*([0-9.]+)px;\s*width:\s*160px;\s*height:\s*192px/g

type AssetManifest = Record<string, string[]>

const readAssetManifest = async () => {
  try {
    const raw = await fs.readFile(assetManifestPath, 'utf8')
    const parsed = JSON.parse(raw) as AssetManifest

    return Object.fromEntries(
      Object.entries(parsed).map(([category, filenames]) => [category, new Set(filenames)]),
    ) as Record<string, Set<string>>
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {}
    }
    throw error
  }
}

const copyDir = async (source: string, target: string, allowedFiles?: Set<string>) => {
  await fs.mkdir(target, { recursive: true })
  const entries = await fs.readdir(source, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      await copyDir(sourcePath, targetPath)
    } else {
      if (allowedFiles && !allowedFiles.has(entry.name)) {
        continue
      }
      await fs.copyFile(sourcePath, targetPath)
    }
  }
}

const main = async () => {
  const html = await fs.readFile(templateIndexPath, 'utf8')
  const assetManifest = await readAssetManifest()
  const positions = [...html.matchAll(positionPattern)].map((match) => ({
    left: Number(match[1]),
    top: Number(match[2]),
  }))

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(
    outputPath,
    [
      'export type HomeGalleryPosition = {',
      '  left: number',
      '  top: number',
      '}',
      '',
      `export const homeGalleryPositions: HomeGalleryPosition[] = ${JSON.stringify(positions, null, 2)}`,
      '',
    ].join('\n'),
    'utf8',
  )

  await fs.rm(publicTemplateImagesDir, { recursive: true, force: true })
  await fs.mkdir(publicTemplateImagesDir, { recursive: true })

  const categories = await fs.readdir(templateImagesDir, { withFileTypes: true })

  for (const entry of categories) {
    if (!entry.isDirectory()) continue

    const sourcePath = path.join(templateImagesDir, entry.name)
    const targetPath = path.join(publicTemplateImagesDir, entry.name)
    const allowedFiles = assetManifest[entry.name]

    await copyDir(sourcePath, targetPath, allowedFiles)
  }

  console.log(`Generated ${positions.length} home gallery positions and synced template images.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
