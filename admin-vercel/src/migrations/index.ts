import * as migration_20260419_102704_init_cloudflare from './20260419_102704_init_cloudflare';

export const migrations = [
  {
    up: migration_20260419_102704_init_cloudflare.up,
    down: migration_20260419_102704_init_cloudflare.down,
    name: '20260419_102704_init_cloudflare'
  },
];
