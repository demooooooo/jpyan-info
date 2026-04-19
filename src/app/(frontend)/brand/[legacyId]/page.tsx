import Link from 'next/link'
import { notFound } from 'next/navigation'

import { toTemplateImageUrl } from '@/lib/frontend-data'
import { getPayloadClient } from '@/lib/payload'
import { getHomeGalleryPositions } from '@/lib/site-template'

export const dynamic = 'force-dynamic'

const positions = getHomeGalleryPositions()

type Props = {
  params: Promise<{
    legacyId: string
  }>
}

export default async function BrandDetailPage({ params }: Props) {
  const { legacyId } = await params
  const numericId = Number(legacyId)

  if (Number.isNaN(numericId)) notFound()

  const payload = await getPayloadClient()
  const brandResult = await payload.find({
    collection: 'brands',
    limit: 1,
    where: {
      legacyId: {
        equals: numericId,
      },
    },
  })

  const brand = brandResult.docs[0]
  if (!brand) notFound()

  const products = await payload.find({
    collection: 'products',
    depth: 0,
    limit: Math.min(positions.length, 240),
    sort: '-sort',
    where: {
      and: [
        { isMarketable: { equals: true } },
        { brand: { equals: brand.id } },
      ],
    },
  })

  return (
    <div className="min-h-screen bg-ink">
      <div className="border-b border-black/[0.06] bg-ink">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-muted/40 mb-3">Brand</p>
          <div className="flex items-center gap-4">
            {brand.logoUrl ? (
              <img alt={brand.name} className="w-16 h-16 object-contain" src={toTemplateImageUrl(brand.logoUrl, 'brands')} />
            ) : null}
            <div>
              <h1 className="font-chinese text-4xl sm:text-5xl font-bold text-ash mb-1">{brand.name}</h1>
              <p className="text-[18px] text-muted/60">{brand.slug}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-[calc(100vh-228px)] overflow-hidden">
        <div className="absolute inset-0" style={{ cursor: 'grab' }}>
          <div
            style={{
              position: 'absolute',
              transform: 'translate(-6199.55px, -7203.99px) scale(1.01758)',
              transformOrigin: '0px 0px',
              willChange: 'transform',
            }}
          >
            {products.docs.map((product, index) => {
              const position = positions[index]
              const imageUrl = toTemplateImageUrl(product.primaryImageUrl || product.gallery?.[0]?.imageUrl, 'products')

              if (!position) return null

              return (
                <Link
                  className="gallery-item"
                  href={`/sku/${product.legacyId}`}
                  key={product.id}
                  style={{
                    cursor: 'pointer',
                    display: 'block',
                    height: '192px',
                    left: `${position.left}px`,
                    position: 'absolute',
                    top: `${position.top}px`,
                    width: '160px',
                  }}
                >
                  <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    {imageUrl ? (
                      <img
                        alt=""
                        draggable="false"
                        src={imageUrl}
                        style={{
                          display: 'block',
                          height: 'auto',
                          maxHeight: '170px',
                          maxWidth: '160px',
                          userSelect: 'none',
                          width: 'auto',
                        }}
                      />
                    ) : null}
                  </div>
                  <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6px' }}>
                    <span
                      className="gallery-label"
                      style={{
                        fontFamily: 'var(--font-noto), STSong, serif',
                        fontSize: '11px',
                        lineHeight: 1,
                        maxWidth: '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.name}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
