import fs from 'fs/promises'
import path from 'path'

const root = process.cwd()
const templateRoot = path.join(root, 'template-site')
const templateIndexPath = path.join(templateRoot, 'index.html')
const templateImagesDir = path.join(templateRoot, 'api', 'img')
const publicTemplateImagesDir = path.join(root, 'public', 'template-api-img')
const outputPath = path.join(root, 'src', 'lib', 'generated', 'template-home-positions.ts')

const positionPattern = /left:\s*([0-9.]+)px;\s*top:\s*([0-9.]+)px;\s*width:\s*160px;\s*height:\s*192px/g

const copyDir = async (source: string, target: string) => {
  await fs.mkdir(target, { recursive: true })
  const entries = await fs.readdir(source, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      await copyDir(sourcePath, targetPath)
    } else {
      await fs.copyFile(sourcePath, targetPath)
    }
  }
}

const main = async () => {
  const html = await fs.readFile(templateIndexPath, 'utf8')
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

  await copyDir(templateImagesDir, publicTemplateImagesDir)

  console.log(`Generated ${positions.length} home gallery positions and synced template images.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
