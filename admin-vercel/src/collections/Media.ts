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
  ],
}
