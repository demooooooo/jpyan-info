import Link from 'next/link'

import { getBrandName, slugifyName, toTemplateImageUrl } from '@/lib/frontend-data'
import { getPayloadClient } from '@/lib/payload'

const timeAgo = (value?: string | null) => {
  if (!value) return ''

  const diff = Date.now() - new Date(value).getTime()
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)))

  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function FeedPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'product-entries',
    depth: 2,
    limit: 100,
    sort: '-publishedAt',
    where: {
      isVisible: {
        equals: true,
      },
    },
  })

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-ash tracking-tight">Community Feed</h1>
          <p className="text-[13px] text-muted/50 mt-1">Recent activity from the community</p>
        </div>

        <div className="space-y-2">
          {result.docs.map((entry) => {
            const product = typeof entry.product === 'object' ? entry.product : null
            const productImage = toTemplateImageUrl(product?.primaryImageUrl || product?.gallery?.[0]?.imageUrl, 'products')
            const authorPath = `/u/${slugifyName(entry.authorName || 'anonymous')}`
            const action = entry.type === 'feed' ? 'favorited' : entry.type === 'review' ? 'reviewed' : 'tried'

            return (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-ink-2 border border-black/[0.05] hover:border-black/10 transition-colors" key={entry.id}>
                <Link className="shrink-0" href={authorPath}>
                  <div className="w-8 h-8 rounded-full border border-white/10 bg-ink-3 flex items-center justify-center text-[11px] text-ash/70">
                    {(entry.authorName || 'A').slice(0, 1).toUpperCase()}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-ash/80 leading-tight truncate">
                    <Link className="font-semibold text-ash hover:text-gold transition-colors" href={authorPath}>
                      @{entry.authorName || 'anonymous'}
                    </Link>
                    <span className="text-muted/40 mx-1.5">{action}</span>
                    {product ? (
                      <Link className="hover:text-gold transition-colors" href={`/sku/${product.legacyId}`}>
                        {product.name}
                        <span className="text-muted/40 ml-1 font-normal">
                          · {product.englishName || getBrandName(product)}
                        </span>
                      </Link>
                    ) : (
                      <span>{entry.title}</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted/30 mt-0.5">{timeAgo(entry.publishedAt)}</p>
                </div>
                <span className={`text-[13px] shrink-0 ${entry.type === 'feed' ? 'text-accent' : 'text-ash'}`}>{entry.type === 'feed' ? '◇' : '✓'}</span>
                {product ? (
                  <Link className="shrink-0" href={`/sku/${product.legacyId}`}>
                    <img alt="" className="w-10 h-10 rounded-xl object-cover bg-ink-3" src={productImage} />
                  </Link>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
