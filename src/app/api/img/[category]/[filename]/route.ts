import { NextRequest } from 'next/server'

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

  return new Response('Not Found', { status: 404 })
}
