import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
      defaultValue: 'YYanHub Product Archive',
      required: true,
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      defaultValue: 'A product-focused site powered by Payload CMS.',
    },
    {
      name: 'homeHeadline',
      type: 'text',
      defaultValue: 'Product-first catalog, ready for Payload management.',
    },
    {
      name: 'homeSubheadline',
      type: 'textarea',
      defaultValue:
        'Manage brands, products, featured items, and product-related feed or community entries from one backend.',
    },
  ],
}
