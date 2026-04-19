declare namespace Cloudflare {
  interface Env {
    ASSETS: Fetcher
    D1: D1Database
  }
}

interface CloudflareEnv extends Cloudflare.Env {}
