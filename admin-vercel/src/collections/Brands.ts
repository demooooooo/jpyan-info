import type { CollectionConfig } from 'payload'

import { formatSlug } from '@/fields/formatSlug'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    group: '内容管理',
    useAsTitle: 'name',
    defaultColumns: ['name', 'legacyId', 'isVisible', 'sort'],
  },
  access: {
    read: () => true,
  },
  labels: {
    plural: '品牌',
    singular: '品牌',
  },
  fields: [
    {
      name: 'legacyId',
      label: '旧编号',
      type: 'number',
      index: true,
      unique: true,
    },
    {
      name: 'name',
      label: '品牌名称',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: '链接标识',
      type: 'text',
      required: true,
      unique: true,
      hooks: {
        beforeValidate: [formatSlug('name')],
      },
    },
    {
      name: 'logoUrl',
      label: '品牌图片',
      type: 'text',
    },
    {
      name: 'description',
      label: '品牌说明',
      type: 'textarea',
    },
    {
      name: 'isVisible',
      label: '是否显示',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'sort',
      label: '排序值',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
