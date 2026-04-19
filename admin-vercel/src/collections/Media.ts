import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'fileUrl',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'sourceUrl',
      type: 'text',
    },
    {
      name: 'fileUrl',
      type: 'text',
      required: true,
    },
  ],
}
