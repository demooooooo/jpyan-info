import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: '系统管理',
    useAsTitle: 'email',
  },
  auth: true,
  labels: {
    plural: '管理员',
    singular: '管理员',
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
