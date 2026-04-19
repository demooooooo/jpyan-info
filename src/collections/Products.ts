import type { CollectionConfig } from 'payload'

import { formatSlug } from '@/fields/formatSlug'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'legacyId', 'brand', 'showOnHome', 'isMarketable'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'legacyId',
      type: 'number',
      required: true,
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
      name: 'englishName',
      type: 'text',
    },
    {
      name: 'brief',
      type: 'textarea',
    },
    {
      name: 'introHtml',
      label: 'Description HTML',
      type: 'textarea',
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
    },
    {
      name: 'primaryImageUrl',
      type: 'text',
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'imageUrl',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        { name: 'price', type: 'number' },
        { name: 'marketPrice', type: 'number' },
        { name: 'costPrice', type: 'number' }
      ],
    },
    {
      name: 'inventory',
      type: 'group',
      fields: [
        { name: 'stock', type: 'number' },
        { name: 'barcode', type: 'text' },
        { name: 'skuCode', type: 'text' }
      ],
    },
    {
      name: 'specifications',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      fields: [
        { name: 'commentsCount', type: 'number', defaultValue: 0 },
        { name: 'viewCount', type: 'number', defaultValue: 0 },
        { name: 'buyCount', type: 'number', defaultValue: 0 }
      ],
    },
    {
      name: 'showOnHome',
      label: 'Show on home page',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isMarketable',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'isRecommend',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isHot',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'sort',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'legacyParametersRaw',
      type: 'textarea',
      admin: {
        description: '保留旧库参数原始内容，方便后续继续映射。',
      },
    },
  ],
}
