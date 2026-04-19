import { CollectionBrowser } from './CollectionBrowser'
import { HomeHero } from './HomeHero'

import { getPayloadClient } from '@/lib/payload'
import { getSiteSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [products, entries, brands, siteSettings] = await Promise.all([
    payload.find({
      collection: 'products',
      depth: 1,
      limit: 1000,
    }),
    payload.find({
      collection: 'product-entries',
      depth: 0,
      limit: 18,
      sort: '-publishedAt',
      where: {
        isVisible: {
          equals: true,
        },
      },
    }),
    payload.find({
      collection: 'brands',
      depth: 0,
      limit: 200,
      sort: 'sort',
      where: {
        isVisible: {
          equals: true,
        },
      },
    }),
    getSiteSettings(),
  ])

  const sortedProducts = [...products.docs].sort((a, b) => {
    if (a.showOnHome !== b.showOnHome) {
      return a.showOnHome ? -1 : 1
    }

    return (b.sort || 0) - (a.sort || 0)
  })

  return (
    <div>
      <HomeHero
        brandCount={brands.totalDocs}
        entries={entries.docs}
        labels={{
          browseCollection: siteSettings.browseCollectionLabel,
          howButton: siteSettings.homeHowButtonLabel,
          heroSubtitle: siteSettings.homeHeroSubtitle,
          heroTitle: siteSettings.homeHeroTitle,
          howDialogItems: siteSettings.homeHowDialogItems,
          howDialogSubtitle: siteSettings.homeHowDialogSubtitle,
          howDialogTitle: siteSettings.homeHowDialogTitle,
          whyButton: siteSettings.homeWhyButtonLabel,
          whyDialogParagraphs: siteSettings.homeWhyDialogParagraphs,
          whyDialogSubtitle: siteSettings.homeWhyDialogSubtitle,
          whyDialogTitle: siteSettings.homeWhyDialogTitle,
        }}
        products={sortedProducts}
        productCount={products.totalDocs}
      />
      <CollectionBrowser
        labels={{
          searchPlaceholder: siteSettings.collectionSearchPlaceholder,
        }}
        products={products.docs}
      />
    </div>
  )
}
