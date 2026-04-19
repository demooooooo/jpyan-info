import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

let sharedPool: Pool | null = null

const getPool = () => {
  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL is required')
  }

  if (!sharedPool) {
    sharedPool = new Pool({ connectionString })
  }

  return sharedPool
}

export type ProductCommentRecord = {
  authorName: string
  content: string
  createdAt: string
  id: number
  source: 'guest' | 'user'
}

type CreateProductCommentArgs = {
  authorEmail?: string
  authorName: string
  authorUserId?: number
  content: string
  productId: number
  source: 'guest' | 'user'
}

export const createProductComment = async (args: CreateProductCommentArgs): Promise<ProductCommentRecord> => {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query('begin')

    const inserted = await client.query<{
      author_name: string
      content: string
      created_at: string
      id: number
      source: 'guest' | 'user'
    }>(
      `
        insert into product_comments (
          product_id, content, author_name, author_email, author_user_id, source, is_visible
        ) values ($1, $2, $3, $4, $5, $6, true)
        returning id, author_name, content, created_at, source
      `,
      [args.productId, args.content, args.authorName, args.authorEmail || null, args.authorUserId || null, args.source],
    )

    await client.query(
      `
        update products
        set stats_comments_count = (
          select count(*)::int from product_comments
          where product_id = $1 and is_visible = true
        )
        where id = $1
      `,
      [args.productId],
    )

    await client.query('commit')

    const row = inserted.rows[0]

    return {
      authorName: row.author_name,
      content: row.content,
      createdAt: row.created_at,
      id: row.id,
      source: row.source,
    }
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

export const getProductCommentList = async (productId: number): Promise<ProductCommentRecord[]> => {
  const pool = getPool()
  const result = await pool.query<{
    author_name: string
    content: string
    created_at: string
    id: number
    source: 'guest' | 'user'
  }>(
    `
      select id, author_name, content, created_at, source
      from product_comments
      where product_id = $1 and is_visible = true
      order by created_at desc
      limit 100
    `,
    [productId],
  )

  return result.rows.map((row) => ({
    authorName: row.author_name,
    content: row.content,
    createdAt: row.created_at,
    id: row.id,
    source: row.source,
  }))
}

export const productExists = async (productId: number) => {
  const pool = getPool()
  const result = await pool.query<{ id: number }>('select id from products where id = $1 limit 1', [productId])

  return (result.rowCount || 0) > 0
}
