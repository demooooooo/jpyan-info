import { defineCloudflareConfig, type OpenNextConfig } from '@opennextjs/cloudflare/config'

const config: OpenNextConfig = defineCloudflareConfig({})

config.buildCommand = 'npm run build:next'

export default config
