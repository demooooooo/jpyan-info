'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

type CommentItem = {
  authorName: string
  content: string
  createdAt: string
  id: number | string
  source: 'guest' | 'user'
}

type ProductCommentsProps = {
  comments: CommentItem[]
  currentUser: {
    displayName: string
    email: string
    id: number
  } | null
  productId: number
  turnstile: {
    enabled: boolean
    siteKey: string
  }
}

type TurnstileWindow = Window & {
  turnstile?: {
    remove: (widgetId: string) => void
    render: (
      container: HTMLElement,
      options: {
        callback: (token: string) => void
        'error-callback': () => void
        'expired-callback': () => void
        sitekey: string
        theme: 'light' | 'dark'
      },
    ) => string
    reset: (widgetId?: string) => void
  }
}

const formatCreatedAt = (value: string) => {
  try {
    return new Date(value).toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export function ProductComments({ comments: initialComments, currentUser, productId, turnstile }: ProductCommentsProps) {
  const [comments, setComments] = useState(initialComments)
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    const currentWindow = window as TurnstileWindow
    const container = turnstileContainerRef.current

    if (!turnstile.enabled || !turnstile.siteKey || !scriptReady || !container || !currentWindow.turnstile) return
    if (turnstileWidgetIdRef.current) return

    turnstileWidgetIdRef.current = currentWindow.turnstile.render(container, {
      callback: (token) => {
        setTurnstileToken(token)
      },
      'error-callback': () => {
        setTurnstileToken('')
      },
      'expired-callback': () => {
        setTurnstileToken('')
      },
      sitekey: turnstile.siteKey,
      theme: 'light',
    })

    return () => {
      if (turnstileWidgetIdRef.current && currentWindow.turnstile) {
        currentWindow.turnstile.remove(turnstileWidgetIdRef.current)
      }

      turnstileWidgetIdRef.current = null
    }
  }, [scriptReady, turnstile.enabled, turnstile.siteKey])

  const resetTurnstile = () => {
    const currentWindow = window as TurnstileWindow

    if (turnstileWidgetIdRef.current && currentWindow.turnstile) {
      currentWindow.turnstile.reset(turnstileWidgetIdRef.current)
    }

    setTurnstileToken('')
  }

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/comments', {
        body: JSON.stringify({
          authorEmail,
          authorName,
          content,
          productId,
          turnstileToken,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const result = (await response.json()) as {
        comment?: CommentItem
        message?: string
      }

      if (!response.ok || !result.comment) {
        setMessage(result.message || '评论提交失败，请稍后再试。')
        resetTurnstile()
        return
      }

      setComments((current) => [result.comment!, ...current])
      setContent('')
      setAuthorName('')
      setAuthorEmail('')
      setMessage('评论已提交，现在已经显示在列表里。')
      resetTurnstile()
    } catch {
      setMessage('评论提交失败，请稍后再试。')
      resetTurnstile()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-12 sm:pb-16">
      {turnstile.enabled ? (
        <Script onLoad={() => setScriptReady(true)} src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" />
      ) : null}

      <div className="rounded-2xl border border-black/[0.06] overflow-hidden bg-ink">
        <div className="px-5 py-4 bg-ink-2 border-b border-black/[0.05] flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted/50">评论</p>
            <p className="text-[12px] text-muted/45 mt-1">{comments.length} 条留言</p>
          </div>
          <span className="text-[11px] text-muted/35">{currentUser ? `已登录为 ${currentUser.displayName}` : '支持游客留言'}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="divide-y divide-black/[0.04]">
            {comments.length ? (
              comments.map((comment) => (
                <div className="px-5 py-4" key={comment.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ink-3 text-[11px] text-ash/80">
                      {comment.authorName.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-medium text-ash">{comment.authorName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                          {comment.source === 'user' ? '登录用户' : '游客'}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted/40 mt-0.5">{formatCreatedAt(comment.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-[15px] text-ash/75 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-[13px] text-muted/45">现在还没有评论，你可以来写第一条。</div>
            )}
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-black/[0.05] bg-ink-2/60">
            <form className="p-5 space-y-4" onSubmit={submitComment}>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted/45 mb-3">发表评论</p>
                {currentUser ? (
                  <div className="px-4 py-3 rounded-xl bg-ink-2 border border-black/[0.05]">
                    <p className="text-[13px] text-ash/75">{currentUser.displayName}</p>
                    <p className="text-[11px] text-muted/40 mt-1">{currentUser.email}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      className="w-full bg-ink-2 border border-black/[0.06] rounded-xl px-4 py-3 text-[13px] text-ash outline-none focus:border-gold/35"
                      onChange={(event) => setAuthorName(event.target.value)}
                      placeholder="昵称"
                      value={authorName}
                    />
                    <input
                      className="w-full bg-ink-2 border border-black/[0.06] rounded-xl px-4 py-3 text-[13px] text-ash outline-none focus:border-gold/35"
                      onChange={(event) => setAuthorEmail(event.target.value)}
                      placeholder="邮箱（可选）"
                      value={authorEmail}
                    />
                  </div>
                )}
              </div>

              <textarea
                className="w-full min-h-32 bg-ink-2 border border-black/[0.06] rounded-2xl px-4 py-3 text-[13px] text-ash outline-none focus:border-gold/35 resize-y"
                onChange={(event) => setContent(event.target.value)}
                placeholder="写下你的看法、口感体验或购买建议…"
                value={content}
              />

              {turnstile.enabled ? (
                <div className="rounded-2xl border border-black/[0.06] bg-ink-2 px-3 py-3">
                  <div className="min-h-[66px] [&_.cf-turnstile]:min-h-[66px]" ref={turnstileContainerRef} />
                </div>
              ) : null}

              {message ? <p className="text-[12px] text-muted/55 leading-relaxed">{message}</p> : null}

              <div className="pt-1 flex justify-end">
                <button
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all bg-gold text-ink border border-gold/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] hover:bg-[#e4bc66] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? '提交中…' : '提交评论'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
