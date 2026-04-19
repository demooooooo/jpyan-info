import type { CollectionConfig } from 'payload'

import { formatSlug } from '@/fields/formatSlug'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'legacyId', 'isVisible', 'sort'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'legacyId',
      type: 'number',
      index: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [formatSlug('name')],
      },
    },
    {
      name: 'logoUrl',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'isVisible',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'sort',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
