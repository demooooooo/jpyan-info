import type { CollectionConfig } from 'payload'

import { formatSlug } from '@/fields/formatSlug'

export const ProductEntries: CollectionConfig = {
  slug: 'product-entries',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'product', 'publishedAt', 'isVisible'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'community',
      options: [
        { label: 'Community', value: 'community' },
        { label: 'Feed', value: 'feed' },
        { label: 'Review', value: 'review' }
      ],
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'textarea',
    },
    {
      name: 'authorName',
      type: 'text',
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'isVisible',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'legacyId',
      type: 'number',
      index: true,
    },
  ],
}
