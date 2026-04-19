import { NextRequest } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; filename: string }> },
) {
  const { category, filename } = await params
  const candidates = [
    `/template-api-img/${category}/${filename}`,
    `/imported-media/${filename}`,
  ]

  for (const candidate of candidates) {
    const response = await fetch(new URL(candidate, request.url))
    if (response.ok) {
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      return new Response(response.body, { headers, status: response.status })
    }
  }

  try {
    const payload = await getPayloadClient()
    const fileUrl = `/api/img/${category}/${filename}`
    const result = await payload.find({
      collection: 'media',
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          {
            fileUrl: {
              equals: fileUrl,
            },
          },
          {
            category: {
              equals: category,
            },
          },
        ],
      },
    })

    const media = result.docs[0] as { byteSize?: number | null; fileDataBase64?: string | null; mimeType?: string | null } | undefined

    if (media?.fileDataBase64) {
      const headers = new Headers()
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      headers.set('Content-Type', media.mimeType || 'application/octet-stream')
      if (typeof media.byteSize === 'number' && media.byteSize > 0) {
        headers.set('Content-Length', String(media.byteSize))
      }

      return new Response(Buffer.from(media.fileDataBase64, 'base64'), {
        headers,
        status: 200,
      })
    }
  } catch (error) {
    console.error(error)
  }

  return new Response('Not Found', { status: 404 })
}
