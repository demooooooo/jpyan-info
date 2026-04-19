import type { CollectionConfig } from 'payload'

import { formatSlug } from '@/fields/formatSlug'

export const ProductEntries: CollectionConfig = {
  slug: 'product-entries',
  admin: {
    group: '内容管理',
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'product', 'publishedAt', 'isVisible'],
  },
  access: {
    read: () => true,
  },
  labels: {
    plural: '社区内容',
    singular: '社区内容',
  },
  fields: [
    {
      name: 'title',
      label: '标题',
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
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'type',
      label: '内容类型',
      type: 'select',
      required: true,
      defaultValue: 'community',
      options: [
        { label: '社区', value: 'community' },
        { label: '动态', value: 'feed' },
        { label: '点评', value: 'review' }
      ],
    },
    {
      name: 'product',
      label: '关联商品',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'excerpt',
      label: '摘要',
      type: 'textarea',
    },
    {
      name: 'content',
      label: '正文',
      type: 'textarea',
    },
    {
      name: 'authorName',
      label: '作者名',
      type: 'text',
    },
    {
      name: 'publishedAt',
      label: '发布时间',
      type: 'text',
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: '使用 ISO 时间字符串，先保留排序和显示，减轻后台日期组件体积。',
      },
    },
    {
      name: 'isVisible',
      label: '是否显示',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'legacyId',
      label: '旧编号',
      type: 'number',
      index: true,
    },
  ],
}
