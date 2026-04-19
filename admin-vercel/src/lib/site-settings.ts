import { cache } from 'react'
import { Pool } from 'pg'

import type { SiteSetting } from '@/payload-types'

import { getPayloadClient } from './payload'

export type SiteSettingsView = {
  siteTitle: string
  siteDescription: string
  siteName: string
  logoMark: string
  logoImageUrl: string
  homeHeroTitle: string
  homeHeroSubtitle: string
  browseCollectionLabel: string
  navCollectionLabel: string
  navBrandsLabel: string
  navCommunityLabel: string
  navFeedLabel: string
  navAdminLabel: string
  collectionSearchPlaceholder: string
  collectionAllLabel: string
  collectionFormatLabel: string
  collectionPriceLabel: string
  collectionNewestLabel: string
  homeHowButtonLabel: string
  homeWhyButtonLabel: string
  homeHowDialogTitle: string
  homeHowDialogSubtitle: string
  homeHowDialogItems: Array<{
    body: string
    glyph: string
    title: string
  }>
  homeWhyDialogTitle: string
  homeWhyDialogSubtitle: string
  homeWhyDialogParagraphs: Array<{
    content: string
  }>
  turnstileEnabled: boolean
  turnstileSiteKey: string
}

const DEFAULT_SITE_SETTINGS: SiteSettingsView = {
  siteTitle: '日本香烟档案馆',
  siteDescription: '按品牌、规格、价格和社区动态浏览商品，并在后台统一管理站点内容。',
  siteName: '日本香烟档案馆',
  logoMark: '烟',
  logoImageUrl: '',
  homeHeroTitle: '日本香烟档案馆',
  homeHeroSubtitle: 'Japanese Cigarette Archive',
  browseCollectionLabel: '浏览商品',
  navCollectionLabel: '商品库',
  navBrandsLabel: '品牌',
  navCommunityLabel: '社区',
  navFeedLabel: '动态',
  navAdminLabel: '登录',
  collectionSearchPlaceholder: '搜索商品…',
  collectionAllLabel: '全部',
  collectionFormatLabel: '规格',
  collectionPriceLabel: '价格',
  collectionNewestLabel: '最新',
  homeHowButtonLabel: '如何使用',
  homeWhyButtonLabel: '为什么做',
  homeHowDialogTitle: '如何使用',
  homeHowDialogSubtitle: '在首页浏览、筛选、搜索并查看每个商品的详细资料。',
  homeHowDialogItems: [
    { glyph: '图', title: '拖动首屏', body: '首屏可以上下左右拖动，也支持缩放，先快速浏览你想看的商品。' },
    { glyph: '筛', title: '筛选商品', body: '点击浏览商品后，可以按品牌、规格、价格和最新排序来快速缩小范围。' },
    { glyph: '详', title: '查看详情', body: '每个商品卡片都可以进入详情页，查看图片、价格、参数和条码。' },
  ],
  homeWhyDialogTitle: '为什么做',
  homeWhyDialogSubtitle: '把原来分散的商品内容整理成一个更清晰、更容易管理的站点。',
  homeWhyDialogParagraphs: [
    { content: '前台保留原有页面样式，后台负责统一管理品牌、商品、图片和首页展示内容。' },
    { content: '这样你后面补商品、换图片、改首页文案，都不用再手改页面文件。' },
  ],
  turnstileEnabled: false,
  turnstileSiteKey: '',
}

const textOr = (value: unknown, fallback: string) => (typeof value === 'string' && value.trim() ? value.trim() : fallback)
const boolOr = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback)

const normalizeSiteSettings = (value?: Partial<SiteSetting> | null): SiteSettingsView => ({
  siteTitle: textOr(value?.siteTitle, DEFAULT_SITE_SETTINGS.siteTitle),
  siteDescription: textOr(value?.siteDescription, DEFAULT_SITE_SETTINGS.siteDescription),
  siteName: textOr(value?.siteName, DEFAULT_SITE_SETTINGS.siteName),
  logoMark: textOr(value?.logoMark, DEFAULT_SITE_SETTINGS.logoMark),
  logoImageUrl: textOr(value?.logoImageUrl, DEFAULT_SITE_SETTINGS.logoImageUrl),
  homeHeroTitle: textOr(value?.homeHeroTitle, DEFAULT_SITE_SETTINGS.homeHeroTitle),
  homeHeroSubtitle: textOr(value?.homeHeroSubtitle, DEFAULT_SITE_SETTINGS.homeHeroSubtitle),
  browseCollectionLabel: textOr(value?.browseCollectionLabel, DEFAULT_SITE_SETTINGS.browseCollectionLabel),
  navCollectionLabel: textOr(value?.navCollectionLabel, DEFAULT_SITE_SETTINGS.navCollectionLabel),
  navBrandsLabel: textOr(value?.navBrandsLabel, DEFAULT_SITE_SETTINGS.navBrandsLabel),
  navCommunityLabel: textOr(value?.navCommunityLabel, DEFAULT_SITE_SETTINGS.navCommunityLabel),
  navFeedLabel: textOr(value?.navFeedLabel, DEFAULT_SITE_SETTINGS.navFeedLabel),
  navAdminLabel: textOr(value?.navAdminLabel, DEFAULT_SITE_SETTINGS.navAdminLabel),
  collectionSearchPlaceholder: textOr(value?.collectionSearchPlaceholder, DEFAULT_SITE_SETTINGS.collectionSearchPlaceholder),
  collectionAllLabel: textOr(value?.collectionAllLabel, DEFAULT_SITE_SETTINGS.collectionAllLabel),
  collectionFormatLabel: textOr(value?.collectionFormatLabel, DEFAULT_SITE_SETTINGS.collectionFormatLabel),
  collectionPriceLabel: textOr(value?.collectionPriceLabel, DEFAULT_SITE_SETTINGS.collectionPriceLabel),
  collectionNewestLabel: textOr(value?.collectionNewestLabel, DEFAULT_SITE_SETTINGS.collectionNewestLabel),
  homeHowButtonLabel: textOr(value?.homeHowButtonLabel, DEFAULT_SITE_SETTINGS.homeHowButtonLabel),
  homeWhyButtonLabel: textOr(value?.homeWhyButtonLabel, DEFAULT_SITE_SETTINGS.homeWhyButtonLabel),
  homeHowDialogTitle: textOr(value?.homeHowDialogTitle, DEFAULT_SITE_SETTINGS.homeHowDialogTitle),
  homeHowDialogSubtitle: textOr(value?.homeHowDialogSubtitle, DEFAULT_SITE_SETTINGS.homeHowDialogSubtitle),
  homeHowDialogItems:
    value?.homeHowDialogItems?.length
      ? value.homeHowDialogItems.map((item) => ({
          body: textOr(item?.body, ''),
          glyph: textOr(item?.glyph, '•'),
          title: textOr(item?.title, ''),
        }))
      : DEFAULT_SITE_SETTINGS.homeHowDialogItems,
  homeWhyDialogTitle: textOr(value?.homeWhyDialogTitle, DEFAULT_SITE_SETTINGS.homeWhyDialogTitle),
  homeWhyDialogSubtitle: textOr(value?.homeWhyDialogSubtitle, DEFAULT_SITE_SETTINGS.homeWhyDialogSubtitle),
  homeWhyDialogParagraphs:
    value?.homeWhyDialogParagraphs?.length
      ? value.homeWhyDialogParagraphs.map((item) => ({
          content: textOr(item?.content, ''),
        }))
      : DEFAULT_SITE_SETTINGS.homeWhyDialogParagraphs,
  turnstileEnabled: boolOr(value?.turnstileEnabled, DEFAULT_SITE_SETTINGS.turnstileEnabled),
  turnstileSiteKey: textOr(value?.turnstileSiteKey, DEFAULT_SITE_SETTINGS.turnstileSiteKey),
})

export const getSiteSettings = cache(async () => {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({
      slug: 'site-settings',
    })

    return normalizeSiteSettings(settings)
  } catch {
    return DEFAULT_SITE_SETTINGS
  }
})

export const defaultSiteSettings = DEFAULT_SITE_SETTINGS

let turnstilePool: Pool | null = null

const getTurnstilePool = () => {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL is required')
  }

  if (!turnstilePool) {
    turnstilePool = new Pool({ connectionString })
  }

  return turnstilePool
}

export const getTurnstileServerSettings = async () => {
  try {
    const pool = getTurnstilePool()
    const result = await pool.query<{
      turnstile_enabled: boolean | null
      turnstile_secret_key: string | null
      turnstile_site_key: string | null
    }>(
      `
        select turnstile_enabled, turnstile_site_key, turnstile_secret_key
        from site_settings
        where id = 1
        limit 1
      `,
    )

    const settings = result.rows[0]

    return {
      enabled: boolOr(settings?.turnstile_enabled, false),
      secretKey: textOr(settings?.turnstile_secret_key, ''),
      siteKey: textOr(settings?.turnstile_site_key, ''),
    }
  } catch {
    return {
      enabled: false,
      secretKey: '',
      siteKey: '',
    }
  }
}
