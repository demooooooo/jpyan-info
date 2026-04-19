import { NextResponse } from 'next/server'

import { getCurrentFrontendUser } from '@/lib/auth-user'
import { createProductComment, productExists } from '@/lib/comment-store'
import { getTurnstileServerSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

type CommentRequestBody = {
  authorEmail?: string
  authorName?: string
  content?: string
  productId?: number
  turnstileToken?: string
}

const trimText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const getRemoteIp = (request: Request) => {
  const candidates = [
    request.headers.get('cf-connecting-ip'),
    request.headers.get('x-forwarded-for')?.split(',')[0],
    request.headers.get('x-real-ip'),
  ]

  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() || ''
}

const verifyTurnstileToken = async (token: string, remoteIp: string, secretKey: string) => {
  const body = new URLSearchParams({
    response: token,
    secret: secretKey,
  })

  if (remoteIp) {
    body.set('remoteip', remoteIp)
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    body: body.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })

  if (!response.ok) return false

  const payload = (await response.json()) as { success?: boolean }
  return payload.success === true
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CommentRequestBody
    const content = trimText(body.content)
    const guestName = trimText(body.authorName)
    const guestEmail = trimText(body.authorEmail)
    const productId = Number(body.productId)

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json({ message: '商品信息无效，暂时无法提交评论。' }, { status: 400 })
    }

    if (content.length < 2) {
      return NextResponse.json({ message: '评论内容至少填写两个字。' }, { status: 400 })
    }

    if (content.length > 1200) {
      return NextResponse.json({ message: '评论内容太长了，请控制在 1200 字以内。' }, { status: 400 })
    }

    const currentUser = await getCurrentFrontendUser(new Headers(request.headers))
    const captcha = await getTurnstileServerSettings()

    if (captcha.enabled) {
      const token = trimText(body.turnstileToken)

      if (!captcha.secretKey) {
        return NextResponse.json({ message: '后台还没有配置 Cloudflare 验证码密钥。' }, { status: 500 })
      }

      if (!token) {
        return NextResponse.json({ message: '请先完成验证码验证。' }, { status: 400 })
      }

      const verified = await verifyTurnstileToken(token, getRemoteIp(request), captcha.secretKey)

      if (!verified) {
        return NextResponse.json({ message: '验证码验证没有通过，请重新尝试。' }, { status: 400 })
      }
    }

    if (!currentUser && !guestName) {
      return NextResponse.json({ message: '游客评论请先填写昵称。' }, { status: 400 })
    }

    if (!(await productExists(productId))) {
      return NextResponse.json({ message: '商品不存在，暂时无法提交评论。' }, { status: 404 })
    }

    const created = await createProductComment({
      authorEmail: currentUser?.email || guestEmail || undefined,
      authorName: currentUser?.displayName || guestName,
      authorUserId: currentUser?.id,
      content,
      productId,
      source: currentUser ? 'user' : 'guest',
    })

    return NextResponse.json({
      comment: {
        ...created,
      },
      message: '评论已提交。',
    })
  } catch (error) {
    console.error('[comments] submit failed', error)
    return NextResponse.json({ message: '评论提交失败，请稍后再试。' }, { status: 500 })
  }
}
