import { randomUUID } from 'crypto'
import path from 'path'

import { getPayloadClient } from '@/lib/payload'

const ALLOWED_CATEGORIES = new Set(['brands', 'products', 'avatars'])

const sanitizeFilename = (value: string) => {
  const extension = path.extname(value || '').toLowerCase()
  const safeExtension = extension && extension.length <= 8 ? extension : '.bin'
  return `${Date.now()}_${randomUUID().replace(/-/g, '').slice(0, 10)}${safeExtension}`
}

export async function POST(request: Request) {
  try {
    const payload = await getPayloadClient()
    const authResult = await payload.auth({
      headers: new Headers(request.headers),
    })

    if (!authResult.user) {
      return Response.json({ error: '请先登录后台后再上传图片。' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const category = formData.get('category')
    const alt = formData.get('alt')

    if (!(file instanceof File)) {
      return Response.json({ error: '没有收到图片文件。' }, { status: 400 })
    }

    if (typeof category !== 'string' || !ALLOWED_CATEGORIES.has(category)) {
      return Response.json({ error: '图片分类不正确。' }, { status: 400 })
    }

    const uploadCategory = category as 'avatars' | 'brands' | 'products'

    if (!file.type.startsWith('image/')) {
      return Response.json({ error: '只支持上传图片文件。' }, { status: 400 })
    }

    if (file.size > 8 * 1024 * 1024) {
      return Response.json({ error: '图片不能超过 8MB。' }, { status: 400 })
    }

    const filename = sanitizeFilename(file.name)
    const fileUrl = `/api/img/${uploadCategory}/${filename}`
    const fileDataBase64 = Buffer.from(await file.arrayBuffer()).toString('base64')

    const doc = await payload.create({
      collection: 'media',
      data: {
        alt: typeof alt === 'string' && alt.trim() ? alt.trim() : file.name,
        byteSize: file.size,
        category: uploadCategory,
        fileDataBase64,
        filename,
        fileUrl,
        mimeType: file.type,
        sourceUrl: '',
      },
      overrideAccess: true,
    })

    return Response.json({
      id: doc.id,
      url: fileUrl,
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      {
        error: '上传失败，请稍后重试。',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
