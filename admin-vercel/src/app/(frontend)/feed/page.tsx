import Link from 'next/link'

import { getBrandName, slugifyName, toTemplateImageUrl } from '@/lib/frontend-data'
import { getPayloadClient } from '@/lib/payload'
import type { Product, ProductComment, ProductEntry } from '@/payload-types'

export const dynamic = 'force-dynamic'

const timeAgo = (value?: string | null) => {
  if (!value) return ''

  const diff = Date.now() - new Date(value).getTime()
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)))

  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

type FeedRow = {
  authorName: string
  authorPath: string
  body: string
  glyph: string
  id: string
  product: Product | null
  publishedAt: string
  title: string
}

const getProductRecord = (value: ProductEntry['product'] | ProductComment['product']) => {
  return typeof value === 'object' && value ? (value as Product) : null
}

const buildCommentRows = (comments: ProductComment[]): FeedRow[] => {
  return comments
    .map((comment) => {
      const product = getProductRecord(comment.product)
      const authorName = comment.authorName?.trim() || 'anonymous'

      return {
        authorName,
        authorPath: `/u/${slugifyName(authorName)}`,
        body: comment.content?.trim() || '写下了一条评论',
        glyph: '✎',
        id: `comment-${comment.id}`,
        product,
        publishedAt: comment.createdAt,
        title: '评论了',
      }
    })
    .filter((item) => item.product?.legacyId)
}

const buildEntryRows = (entries: ProductEntry[]): FeedRow[] => {
  return entries
    .map((entry) => {
      const product = getProductRecord(entry.product)
      const authorName = entry.authorName?.trim() || 'anonymous'

      return {
        authorName,
        authorPath: `/u/${slugifyName(authorName)}`,
        body: (entry.content || entry.excerpt || '').trim(),
        glyph: entry.type === 'feed' ? '◇' : entry.type === 'review' ? '✦' : '✓',
        id: `entry-${entry.id}`,
        product,
        publishedAt: entry.publishedAt || entry.updatedAt || entry.createdAt,
        title: entry.type === 'feed' ? '收藏了' : entry.type === 'review' ? '点评了' : '试过了',
      }
    })
    .filter((item) => item.product?.legacyId)
}

export default async function FeedPage() {
  const payload = await getPayloadClient()
  const [entriesResult, commentsResult] = await Promise.all([
    payload.find({
      collection: 'product-entries',
      depth: 2,
      limit: 100,
      sort: '-publishedAt',
      where: {
        isVisible: {
          equals: true,
        },
      },
    }),
    payload.find({
      collection: 'product-comments',
      depth: 2,
      limit: 100,
      sort: '-createdAt',
      where: {
        isVisible: {
          equals: true,
        },
      },
    }),
  ])

  const rows = [...buildCommentRows(commentsResult.docs), ...buildEntryRows(entriesResult.docs)].sort((left, right) => {
    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  })

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-ash tracking-tight">社区动态</h1>
          <p className="text-[13px] text-muted/50 mt-1">最近的评论、收藏和体验记录</p>
        </div>

        <div className="space-y-2">
          {rows.map((entry) => {
            const productImage = toTemplateImageUrl(entry.product?.primaryImageUrl || entry.product?.gallery?.[0]?.imageUrl, 'products')

            return (
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-ink-2 border border-black/[0.05] hover:border-black/10 transition-colors" key={entry.id}>
                <Link className="shrink-0 mt-0.5" href={entry.authorPath}>
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-ink-3 flex items-center justify-center text-[11px] text-ash/70">
                    {(entry.authorName || 'A').slice(0, 1).toUpperCase()}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-ash/80 leading-tight">
                    <Link className="font-semibold text-ash hover:text-gold transition-colors" href={entry.authorPath}>
                      @{entry.authorName || 'anonymous'}
                    </Link>
                    <span className="text-muted/40 mx-1.5">{entry.title}</span>
                    {entry.product ? (
                      <Link className="hover:text-gold transition-colors" href={`/sku/${entry.product.legacyId}`}>
                        {entry.product.name}
                        <span className="text-muted/40 ml-1 font-normal">· {entry.product.englishName || getBrandName(entry.product)}</span>
                      </Link>
                    ) : null}
                  </p>
                  {entry.body ? <p className="text-[12px] text-muted/55 mt-1 leading-relaxed break-words line-clamp-2">{entry.body}</p> : null}
                  <p className="text-[11px] text-muted/30 mt-1.5">{timeAgo(entry.publishedAt)}</p>
                </div>
                <span className="text-[13px] shrink-0 text-ash mt-0.5">{entry.glyph}</span>
                {entry.product ? (
                  <Link className="shrink-0" href={`/sku/${entry.product.legacyId}`}>
                    <img alt="" className="w-10 h-10 rounded-xl object-cover bg-ink-3" src={productImage} />
                  </Link>
                ) : null}
              </div>
            )
          })}

          {rows.length === 0 ? <div className="py-20 text-center text-muted/45 text-[13px]">暂时还没有可展示的动态。</div> : null}
        </div>
      </div>
    </div>
  )
}

