import fs from 'fs/promises'
import path from 'path'

import { NextRequest } from 'next/server'

import { getTemplateImagePath, templateAssetExists } from '@/lib/site-template'

const contentTypes: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ category: string; filename: string }> },
) {
  const { category, filename } = await params
  const templatePath = getTemplateImagePath(category, filename)

  if (templateAssetExists(templatePath)) {
    const buffer = await fs.readFile(templatePath)
    const ext = path.extname(filename).toLowerCase()
    return new Response(buffer, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
      },
    })
  }

  const importedPath = path.resolve(process.cwd(), 'public', 'imported-media', filename)

  try {
    const buffer = await fs.readFile(importedPath)
    const ext = path.extname(filename).toLowerCase()
    return new Response(buffer, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
      },
    })
  } catch {
    return new Response('Not Found', { status: 404 })
  }
}
