import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: '系统管理',
    useAsTitle: 'fileUrl',
  },
  access: {
    read: () => true,
  },
  labels: {
    plural: '媒体资源',
    singular: '媒体资源',
  },
  fields: [
    {
      name: 'alt',
      label: '图片说明',
      type: 'text',
      required: true,
    },
    {
      name: 'sourceUrl',
      label: '原始地址',
      type: 'text',
    },
    {
      name: 'fileUrl',
      label: '本地文件地址',
      type: 'text',
      required: true,
    },
    {
      name: 'filename',
      label: '文件名',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'category',
      label: '图片分类',
      type: 'select',
      options: [
        { label: '品牌', value: 'brands' },
        { label: '商品', value: 'products' },
        { label: '头像', value: 'avatars' },
      ],
    },
    {
      name: 'mimeType',
      label: '文件类型',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'byteSize',
      label: '文件大小',
      type: 'number',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'fileDataBase64',
      label: '文件内容',
      type: 'textarea',
      admin: {
        hidden: true,
      },
    },
  ],
}
