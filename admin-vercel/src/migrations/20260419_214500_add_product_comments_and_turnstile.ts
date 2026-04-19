import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    create table if not exists "product_comments" (
      "id" serial primary key not null,
      "product_id" integer not null references "products"("id") on delete cascade,
      "content" text not null,
      "author_name" text not null,
      "author_email" text,
      "author_user_id" integer references "users"("id") on delete set null,
      "source" text not null default 'guest',
      "is_visible" boolean not null default true,
      "updated_at" timestamp(3) with time zone default now() not null,
      "created_at" timestamp(3) with time zone default now() not null
    );
  `)

  await db.execute(sql`create index if not exists "product_comments_product_idx" on "product_comments" ("product_id");`)
  await db.execute(sql`create index if not exists "product_comments_author_user_idx" on "product_comments" ("author_user_id");`)
  await db.execute(sql`create index if not exists "product_comments_updated_at_idx" on "product_comments" ("updated_at");`)
  await db.execute(sql`create index if not exists "product_comments_created_at_idx" on "product_comments" ("created_at");`)
  await db.execute(sql`alter table "payload_locked_documents_rels" add column if not exists "product_comments_id" integer references "product_comments"("id") on delete cascade;`)
  await db.execute(sql`create index if not exists "payload_locked_documents_rels_product_comments_id_idx" on "payload_locked_documents_rels" ("product_comments_id");`)

  await db.execute(sql`alter table "site_settings" add column if not exists "turnstile_enabled" boolean default false;`)
  await db.execute(sql`alter table "site_settings" add column if not exists "turnstile_site_key" text;`)
  await db.execute(sql`alter table "site_settings" add column if not exists "turnstile_secret_key" text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`alter table "payload_locked_documents_rels" drop column if exists "product_comments_id";`)
  await db.execute(sql`alter table "site_settings" drop column if exists "turnstile_secret_key";`)
  await db.execute(sql`alter table "site_settings" drop column if exists "turnstile_site_key";`)
  await db.execute(sql`alter table "site_settings" drop column if exists "turnstile_enabled";`)
  await db.execute(sql`drop table if exists "product_comments";`)
}
