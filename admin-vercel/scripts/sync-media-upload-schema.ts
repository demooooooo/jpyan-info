import { config as loadEnv } from 'dotenv'
import { Client } from 'pg'

loadEnv({ path: '.env' })
loadEnv({ path: '.env.local', override: true })

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL is required')
}

const statements = [
  `alter table media add column if not exists filename text`,
  `alter table media add column if not exists category text`,
  `alter table media add column if not exists mime_type text`,
  `alter table media add column if not exists byte_size numeric`,
  `alter table media add column if not exists file_data_base64 text`,
  `create index if not exists media_file_url_idx on media (file_url)`,
  `create index if not exists media_filename_idx on media (filename)`,
  `create index if not exists media_category_idx on media (category)`,
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
    console.log('[media-upload-schema] synced')
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

