import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'

const syncProductCommentCount = async (payload: any, productValue: number | { id?: number | null } | null | undefined) => {
  const productId =
    typeof productValue === 'number' ? productValue : typeof productValue?.id === 'number' ? productValue.id : null

  if (!productId) return

  const [{ totalDocs }, product] = await Promise.all([
    payload.count({
      collection: 'product-comments',
      overrideAccess: true,
      where: {
        and: [
          {
            product: {
              equals: productId,
            },
          },
          {
            isVisible: {
              equals: true,
            },
          },
        ],
      },
    }),
    payload.findByID({
      collection: 'products',
      id: productId,
      overrideAccess: true,
    }),
  ])

  await payload.update({
    collection: 'products',
    id: productId,
    data: {
      stats: {
        buyCount: product.stats?.buyCount ?? 0,
        commentsCount: totalDocs,
        viewCount: product.stats?.viewCount ?? 0,
      },
    },
    overrideAccess: true,
  })
}

const afterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const productIds = new Set<number>()

  for (const value of [previousDoc?.product, doc?.product]) {
    if (typeof value === 'number') productIds.add(value)
    else if (typeof value?.id === 'number') productIds.add(value.id)
  }

  await Promise.all([...productIds].map((productId) => syncProductCommentCount(req.payload, productId)))

  return doc
}

const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await syncProductCommentCount(req.payload, doc?.product)

  return doc
}

export const ProductComments: CollectionConfig = {
  slug: 'product-comments',
  admin: {
    defaultColumns: ['authorName', 'product', 'source', 'isVisible', 'createdAt'],
    group: '内容管理',
    useAsTitle: 'authorName',
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => {
      if (req.user) return true

      return {
        isVisible: {
          equals: true,
        },
      }
    },
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  labels: {
    plural: '商品评论',
    singular: '商品评论',
  },
  fields: [
    {
      name: 'product',
      label: '关联商品',
      relationTo: 'products',
      required: true,
      type: 'relationship',
    },
    {
      name: 'content',
      label: '评论内容',
      maxLength: 1200,
      required: true,
      type: 'textarea',
    },
    {
      name: 'authorName',
      label: '显示名称',
      required: true,
      type: 'text',
    },
    {
      name: 'authorEmail',
      label: '邮箱',
      type: 'email',
    },
    {
      name: 'authorUser',
      admin: {
        position: 'sidebar',
      },
      label: '登录用户',
      relationTo: 'users',
      type: 'relationship',
    },
    {
      name: 'source',
      defaultValue: 'guest',
      label: '评论来源',
      options: [
        {
          label: '游客',
          value: 'guest',
        },
        {
          label: '登录用户',
          value: 'user',
        },
      ],
      required: true,
      type: 'select',
    },
    {
      name: 'isVisible',
      defaultValue: true,
      label: '前台显示',
      type: 'checkbox',
    },
  ],
}
