import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { ProductComments } from './ProductComments'
import { getCurrentFrontendUser } from '@/lib/auth-user'
import { getProductCommentList } from '@/lib/comment-store'
import { toTemplateImageUrl } from '@/lib/frontend-data'
import { getPayloadClient } from '@/lib/payload'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{
    legacyId: string
  }>
}

const splitDescription = (html?: string | null) => {
  if (!html) return { chinese: '', english: '' }
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const chineseMatch = plain.match(/[\u4e00-\u9fff].*$/)
  const chinese = chineseMatch?.[0] || ''
  const english = chinese ? plain.replace(chinese, '').trim() : plain
  return { chinese, english }
}

export default async function ProductDetailPage({ params }: Props) {
  const { legacyId } = await params
  const numericId = Number(legacyId)

  if (Number.isNaN(numericId)) notFound()

  const payload = await getPayloadClient()
  const requestHeaders = new Headers(await headers())
  const [result, currentUser, siteSettings] = await Promise.all([
    payload.find({
      collection: 'products',
      depth: 2,
      limit: 1,
      where: {
        legacyId: {
          equals: numericId,
        },
      },
    }),
    getCurrentFrontendUser(requestHeaders),
    getSiteSettings(),
  ])

  const product = result.docs[0]
  if (!product) notFound()

  const comments = await getProductCommentList(product.id)

  const gallery = [product.primaryImageUrl, ...(product.gallery?.map((item) => item.imageUrl) || [])]
    .map((value) => toTemplateImageUrl(value, 'products'))
    .filter(Boolean)

  const brand = typeof product.brand === 'object' ? product.brand : null
  const { english, chinese } = splitDescription(product.introHtml)
  const boxPrice = product.pricing?.price
  const cartonPrice = typeof boxPrice === 'number' ? boxPrice * 10 : null
  const wholesalePrice = typeof cartonPrice === 'number' ? Number((cartonPrice * 0.88).toFixed(2)) : null
  const stats = product.stats || {}
  const overall = Math.max(6.5, Math.min(9.8, 7 + (stats.commentsCount || 0) / 100))
  const ratingPercent = `${Math.round(overall * 10)}%`

  return (
    <div className="min-h-screen bg-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            alternateName: product.englishName || undefined,
            brand: brand?.name ? { '@type': 'Brand', name: brand.name } : undefined,
            image: gallery[0],
            offers:
              typeof boxPrice === 'number'
                ? {
                    '@type': 'Offer',
                    availability: 'https://schema.org/InStock',
                    price: boxPrice,
                    priceCurrency: 'CNY',
                  }
                : undefined,
          }),
        }}
      />

      <div className="border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-2 text-[11px] font-medium text-muted/50">
          <Link className="hover:text-ash transition-colors" href="/">
            商品库
          </Link>
          <span className="text-muted/20">›</span>
          {brand ? (
            <Link className="hover:text-ash transition-colors" href={`/brand/${brand.legacyId}`}>
              {brand.name}
            </Link>
          ) : (
            <span className="hover:text-ash transition-colors">Brand</span>
            
          )}
          <span className="text-muted/20">›</span>
          <span className="text-ash/60 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-10 lg:gap-16">
          <div className="space-y-8">
            <div className="flex flex-col gap-3">
              <div className="relative bg-ink-3 border border-gold/10 aspect-square sm:aspect-video flex items-center justify-center overflow-hidden">
                {gallery[0] ? <img alt="Image 1" className="max-h-full max-w-full object-contain p-4" src={gallery[0]} style={{ animation: 'fadeUp 0.2s ease both' }} /> : null}
                <button className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-ink/70 hover:bg-ink border border-gold/15 hover:border-gold/40 text-muted hover:text-gold transition-all flex items-center justify-center text-lg" type="button">
                  ‹
                </button>
                <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-ink/70 hover:bg-ink border border-gold/15 hover:border-gold/40 text-muted hover:text-gold transition-all flex items-center justify-center text-lg" type="button">
                  ›
                </button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <span className="font-mono text-[10px] text-muted/60 bg-ink/80 px-2 py-0.5">
                    1 / {gallery.length || 1}
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {gallery.map((imageUrl, index) => (
                  <button
                    className={`flex-shrink-0 w-14 h-14 bg-ink-3 border transition-colors overflow-hidden ${
                      index === 0 ? 'border-gold/50' : 'border-gold/8 hover:border-gold/25'
                    }`}
                    key={`${imageUrl}-${index}`}
                    type="button"
                  >
                    <img alt={`Thumb ${index + 1}`} className="w-full h-full object-contain p-1" loading="lazy" src={imageUrl} />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-ink-2 border border-black/[0.05]">
              <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-muted/40 mb-3">商品说明</p>
              {english ? <p className="text-[13px] text-ash/80 leading-relaxed mb-3">{english}</p> : null}
              {chinese ? <p className="font-chinese text-[12px] text-muted/40 leading-loose">{chinese}</p> : null}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <span className="stamp text-gold border-gold/30 bg-gold/10 mb-3 inline-flex">日本 · Japan</span>
              <h1 className="font-chinese text-3xl sm:text-4xl font-bold text-ash leading-tight mb-1">{product.name}</h1>
              {product.englishName ? <p className="text-[17px] text-muted/60 italic mb-2">{product.englishName}</p> : null}
              {brand ? (
                <Link className="text-[13px] text-muted/60 hover:text-ash transition-colors" href={`/brand/${brand.legacyId}`}>
                  {brand.name}
                </Link>
              ) : null}
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-[32px] font-bold text-ash leading-none">{typeof boxPrice === 'number' ? `¥${boxPrice}` : '--'}</span>
                <span className="text-[13px] text-muted/40">/ 包</span>
                {typeof boxPrice === 'number' ? <span className="text-[14px] text-muted/40 font-medium">≈ ${Math.max(1, Math.round(boxPrice / 7))}</span> : null}
              </div>

              <div className="mt-5">
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[13px] font-medium transition-all bg-ink-2 text-ash/60 hover:bg-ink-3 hover:text-ash" title="收藏商品" type="button">
                    <span className="text-base leading-none">☆</span>
                    收藏
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[13px] font-medium transition-all bg-ink-2 text-ash/60 hover:bg-ink-3 hover:text-ash" title="标记试过" type="button">
                    <span className="text-base leading-none">○</span>
                    标记试过
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[13px] font-medium transition-all bg-ink-2 text-ash/60 hover:bg-ink-3 hover:text-ash" title="加入想买清单" type="button">
                    <svg className="shrink-0" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="14">
                      <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    想买清单
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/[0.06] overflow-hidden">
              <div className="px-4 py-3 bg-ink-2 border-b border-black/[0.05]">
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted/50">规格参数</p>
              </div>
              <div className="divide-y divide-black/[0.04]">
                {(product.specifications || []).map((item, index) => (
                  <div className="flex items-center px-4 py-2.5" key={`${item.label}-${index}`}>
                    <span className="text-[12px] text-muted/60 w-36 shrink-0">{item.label}</span>
                    <span className="font-chinese text-[13px] text-ash/80">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/[0.06] overflow-hidden">
              <div className="px-4 py-3 bg-ink-2 border-b border-black/[0.05]">
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted/50">价格信息</p>
              </div>
              <div className="divide-y divide-black/[0.04]">
                <div className="flex items-center px-4 py-2.5">
                  <span className="text-[12px] text-muted/60 w-36 shrink-0">单包价格</span>
                  <span className="text-[14px] font-bold text-gold">{typeof boxPrice === 'number' ? `¥${boxPrice}` : '--'}</span>
                  {typeof boxPrice === 'number' ? <span className="text-[12px] text-muted/40 ml-2">≈ ${(boxPrice / 6.84).toFixed(2)}</span> : null}
                </div>
                <div className="flex items-center px-4 py-2.5">
                  <span className="text-[12px] text-muted/60 w-36 shrink-0">条装价格</span>
                  <span className="text-[14px] font-bold text-gold">{typeof cartonPrice === 'number' ? `¥${cartonPrice}` : '--'}</span>
                  {typeof cartonPrice === 'number' ? <span className="text-[12px] text-muted/40 ml-2">≈ ${(cartonPrice / 6.84).toFixed(2)}</span> : null}
                </div>
                <div className="flex items-center px-4 py-2.5">
                  <span className="text-[12px] text-muted/60 w-36 shrink-0">参考批发</span>
                  <span className="text-[14px] font-bold text-gold">{typeof wholesalePrice === 'number' ? `¥${wholesalePrice}` : '--'}</span>
                  {typeof wholesalePrice === 'number' ? <span className="text-[12px] text-muted/40 ml-2">≈ ${(wholesalePrice / 6.84).toFixed(2)}</span> : null}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted/40 px-0.5">条码信息</p>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-ink-2 rounded-xl">
                <span className="text-[11px] text-muted/50 w-28 shrink-0">单包条码</span>
                <span className="text-[12px] text-ash/60 font-mono tracking-wider">{product.inventory?.barcode || '--'}</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-ink-2 rounded-xl">
                <span className="text-[11px] text-muted/50 w-28 shrink-0">条装条码</span>
                <span className="text-[12px] text-ash/60 font-mono tracking-wider">{product.inventory?.skuCode || '--'}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-black/[0.06] overflow-hidden">
              <div className="px-4 py-3 bg-ink-2 border-b border-black/[0.05] flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted/50">评分</p>
                <span className="text-[11px] text-muted/35">{stats.commentsCount || 0} 次评分</span>
              </div>
              <div className="p-4 space-y-4">
                {['口感', '包装', '性价比', '综合'].map((label) => (
                  <div key={label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-[12px] text-ash/60 font-medium">{label}</span>
                      <span className="text-[12px] font-bold text-ash/80">{overall.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 bg-ink-3 rounded-full overflow-hidden">
                      <div className="h-full bg-ash/80 rounded-full transition-all" style={{ width: ratingPercent }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductComments
        comments={comments}
        currentUser={currentUser}
        productId={product.id}
        turnstile={{
          enabled: siteSettings.turnstileEnabled && Boolean(siteSettings.turnstileSiteKey),
          siteKey: siteSettings.turnstileSiteKey,
        }}
      />
    </div>
  )
}
