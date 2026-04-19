import * as migration_20260419_102704_init_cloudflare from './20260419_102704_init_cloudflare';
import * as migration_20260419_214500_add_product_comments_and_turnstile from './20260419_214500_add_product_comments_and_turnstile';

export const migrations = [
  {
    up: migration_20260419_102704_init_cloudflare.up,
    down: migration_20260419_102704_init_cloudflare.down,
    name: '20260419_102704_init_cloudflare'
  },
  {
    up: migration_20260419_214500_add_product_comments_and_turnstile.up,
    down: migration_20260419_214500_add_product_comments_and_turnstile.down,
    name: '20260419_214500_add_product_comments_and_turnstile'
  },
];
