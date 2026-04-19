import { config as loadEnv } from 'dotenv'
import { Client } from 'pg'

loadEnv({ path: '.env' })
loadEnv({ path: '.env.local', override: true })

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL is required')
}

const statements = [
  `
    create table if not exists product_comments (
      id serial primary key,
      product_id integer not null references products(id) on delete cascade,
      content text not null,
      author_name text not null,
      author_email text,
      author_user_id integer references users(id) on delete set null,
      source text not null default 'guest',
      is_visible boolean not null default true,
      updated_at timestamptz not null default now(),
      created_at timestamptz not null default now()
    )
  `,
  `create index if not exists product_comments_product_idx on product_comments (product_id)`,
  `create index if not exists product_comments_author_user_idx on product_comments (author_user_id)`,
  `create index if not exists product_comments_updated_at_idx on product_comments (updated_at)`,
  `create index if not exists product_comments_created_at_idx on product_comments (created_at)`,
  `alter table payload_locked_documents_rels add column if not exists product_comments_id integer references product_comments(id) on delete cascade`,
  `create index if not exists payload_locked_documents_rels_product_comments_id_idx on payload_locked_documents_rels (product_comments_id)`,
  `alter table site_settings add column if not exists turnstile_enabled boolean default false`,
  `alter table site_settings add column if not exists turnstile_site_key text`,
  `alter table site_settings add column if not exists turnstile_secret_key text`,
]

const main = async () => {
  const client = new Client({ connectionString })
  await client.connect()

  try {
    await client.query('begin')

    for (const statement of statements) {
      await client.query(statement)
    }

    await client.query('commit')
    console.log('[comment-feature-schema] synced')
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
