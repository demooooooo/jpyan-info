import fs from 'fs'
import path from 'path'

export type HomeGalleryPosition = {
  left: number
  top: number
}

const templateRoot = path.resolve(process.cwd(), 'template-site')
const homeTemplatePath = path.join(templateRoot, 'index.html')

const readTemplate = (filePath: string) => fs.readFileSync(filePath, 'utf-8')

export const getHomeGalleryPositions = (): HomeGalleryPosition[] => {
  const html = readTemplate(homeTemplatePath)
  const matches = [...html.matchAll(/left:\s*([0-9.]+)px;\s*top:\s*([0-9.]+)px;\s*width:\s*160px;\s*height:\s*192px/g)]

  return matches.map((match) => ({
    left: Number(match[1]),
    top: Number(match[2]),
  }))
}

export const getTemplateImagePath = (category: string, filename: string) =>
  path.join(templateRoot, 'api', 'img', category, filename)

export const templateAssetExists = (assetPath: string) => fs.existsSync(assetPath)
