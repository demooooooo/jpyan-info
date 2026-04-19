import Link from 'next/link'

import { toTemplateImageUrl } from '@/lib/frontend-data'
import { getPayloadClient } from '@/lib/payload'

export default async function BrandsPage() {
  const payload = await getPayloadClient()
  const [brands, products] = await Promise.all([
    payload.find({
      collection: 'brands',
      limit: 200,
      sort: 'sort',
      where: {
        isVisible: {
          equals: true,
        },
      },
    }),
    payload.find({
      collection: 'products',
      depth: 0,
      limit: 1000,
      where: {
        isMarketable: {
          equals: true,
        },
      },
    }),
  ])

  const counts = new Map<string, number>()
  for (const product of products.docs) {
    if (!product.brand) continue
    const key = String(product.brand)
    counts.set(key, (counts.get(key) || 0) + 1)
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-black/[0.06] bg-ink">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-muted/40 mb-3">Archive</p>
          <h1 className="font-chinese text-4xl sm:text-5xl font-bold text-ash mb-1">卷烟品牌</h1>
          <p className="text-[18px] text-muted/60">Cigarette Brands</p>
        </div>
      </div>

      <div className="border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 space-y-3">
          <div className="flex gap-1.5 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all bg-ink-2 text-muted/60 hover:text-ash border border-black/[0.06]" type="button">
              <span className="font-chinese">大陆</span>
              <span>Mainland China</span>
              <span className="text-muted/30">{brands.totalDocs}</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all bg-ink-2 text-muted/60 hover:text-ash border border-black/[0.06]" type="button">
              <span className="font-chinese">港澳台</span>
              <span>HK · Macau · Taiwan</span>
              <span className="text-muted/30">0</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all bg-ink-2 text-muted/60 hover:text-ash border border-black/[0.06]" type="button">
              <span className="font-chinese">国外</span>
              <span>International</span>
              <span className="text-muted/30">0</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all bg-ink-2 text-muted/60 hover:text-ash border border-black/[0.06]" type="button">
              <span className="font-chinese">历史</span>
              <span>Historical</span>
              <span className="text-muted/30">0</span>
            </button>
          </div>

          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/30 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="w-full pl-8 pr-8 py-1.5 bg-ink-2 border border-black/[0.07] rounded-full text-[13px] text-ash placeholder:text-muted/30 focus:outline-none focus:border-black/15 transition-colors"
              placeholder="Search brands…"
              readOnly
              type="text"
              value=""
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 space-y-14">
        <section id="mainland">
          <div className="flex items-center gap-2.5 mb-6">
            <span className="stamp text-gold border-gold/30 bg-gold/10">大陆</span>
            <h2 className="text-[15px] font-semibold text-ash">Mainland China</h2>
            <span className="text-[12px] text-muted/40">{brands.totalDocs}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
            {brands.docs.map((brand, index) => (
              <Link
                className="group overflow-hidden rounded-2xl border border-black/[0.08] hover:border-black/[0.18] bg-ink-2 hover:bg-ink-3 transition-all duration-200 fade-up"
                href={`/brand/${brand.legacyId}`}
                key={brand.id}
                style={{ animationDelay: `${index * 18}ms` }}
              >
                <div className="relative aspect-square bg-ink flex items-center justify-center p-3">
                  {brand.logoUrl ? (
                    <img
                      alt={brand.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      src={toTemplateImageUrl(brand.logoUrl, 'brands')}
                    />
                  ) : null}
                </div>
                <div className="px-2 py-2 space-y-0.5 border-t border-black/[0.06]">
                  <div className="flex items-center justify-between gap-1">
                    <div className="font-chinese text-[12px] font-semibold text-ash group-hover:text-gold transition-colors leading-snug truncate">
                      {brand.name}
                    </div>
                    <span className="text-[11px] font-semibold tabular-nums text-red-400/70 shrink-0 leading-none">
                      {counts.get(String(brand.id)) || 0}
                    </span>
                  </div>
                  <div className="text-[9px] text-muted/55 truncate tracking-wide">{brand.slug}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
