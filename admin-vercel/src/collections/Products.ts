import type { CollectionConfig } from 'payload'

import { formatSlug } from '@/fields/formatSlug'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    group: '内容管理',
    useAsTitle: 'name',
    defaultColumns: ['name', 'legacyId', 'brand', 'showOnHome', 'isMarketable'],
  },
  access: {
    read: () => true,
  },
  labels: {
    plural: '商品',
    singular: '商品',
  },
  fields: [
    {
      name: 'legacyId',
      label: '旧编号',
      type: 'number',
      required: true,
      index: true,
      unique: true,
    },
    {
      name: 'name',
      label: '商品名称',
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
      name: 'englishName',
      label: '英文名',
      type: 'text',
    },
    {
      name: 'brief',
      label: '简介',
      type: 'textarea',
    },
    {
      name: 'introHtml',
      label: '商品说明',
      type: 'textarea',
    },
    {
      name: 'brand',
      label: '所属品牌',
      type: 'relationship',
      relationTo: 'brands',
    },
    {
      name: 'primaryImageUrl',
      label: '主图地址',
      type: 'text',
    },
    {
      name: 'gallery',
      label: '商品图集',
      type: 'array',
      fields: [
        {
          name: 'imageUrl',
          label: '图片地址',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'pricing',
      label: '价格信息',
      type: 'group',
      fields: [
        { name: 'price', label: '售价', type: 'number' },
        { name: 'marketPrice', label: '市场价', type: 'number' },
        { name: 'costPrice', label: '成本价', type: 'number' }
      ],
    },
    {
      name: 'inventory',
      label: '库存信息',
      type: 'group',
      fields: [
        { name: 'stock', label: '库存', type: 'number' },
        { name: 'barcode', label: '条码', type: 'text' },
        { name: 'skuCode', label: 'SKU 编码', type: 'text' }
      ],
    },
    {
      name: 'specifications',
      label: '规格参数',
      type: 'array',
      fields: [
        {
          name: 'label',
          label: '参数名',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          label: '参数值',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'stats',
      label: '统计信息',
      type: 'group',
      fields: [
        { name: 'commentsCount', label: '评论数', type: 'number', defaultValue: 0 },
        { name: 'viewCount', label: '浏览数', type: 'number', defaultValue: 0 },
        { name: 'buyCount', label: '购买数', type: 'number', defaultValue: 0 }
      ],
    },
    {
      name: 'showOnHome',
      label: '首页显示',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isMarketable',
      label: '是否上架',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'isRecommend',
      label: '是否推荐',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isHot',
      label: '是否热门',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'sort',
      label: '排序值',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'legacyParametersRaw',
      label: '旧参数原文',
      type: 'textarea',
      admin: {
        description: '保留旧库参数原始内容，方便后续继续映射。',
      },
    },
  ],
}
