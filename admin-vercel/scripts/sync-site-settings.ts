import { config as loadEnv } from 'dotenv'
import { Client } from 'pg'

loadEnv({ path: '.env' })
loadEnv({ path: '.env.local', override: true })

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL is required')
}

const siteSettings = {
  browseCollectionLabel: '浏览商品',
  collectionAllLabel: '全部',
  collectionFormatLabel: '规格',
  collectionNewestLabel: '最新',
  collectionPriceLabel: '价格',
  collectionSearchPlaceholder: '搜索商品…',
  homeHeroSubtitle: 'Japanese Cigarette Archive',
  homeHeroTitle: '日本香烟档案馆',
  homeHowButtonLabel: '如何使用',
  homeHowDialogItems: [
    { body: '首屏可以上下左右拖动，也支持缩放，先快速浏览你想看的商品。', glyph: '图', title: '拖动首屏' },
    { body: '点击浏览商品后，可以按品牌、规格、价格和最新排序来快速缩小范围。', glyph: '筛', title: '筛选商品' },
    { body: '每个商品卡片都可以进入详情页，查看图片、价格、参数和条码。', glyph: '详', title: '查看详情' },
  ],
  homeHowDialogSubtitle: '在首页浏览、筛选、搜索并查看每个商品的详细资料。',
  homeHowDialogTitle: '如何使用',
  homeWhyButtonLabel: '为什么做',
  homeWhyDialogParagraphs: [
    { content: '前台保留原有页面样式，后台负责统一管理品牌、商品、图片和首页展示内容。' },
    { content: '这样你后面补商品、换图片、改首页文案，都不用再手改页面文件。' },
  ],
  homeWhyDialogSubtitle: '把原来分散的商品内容整理成一个更清晰、更容易管理的站点。',
  homeWhyDialogTitle: '为什么做',
  logoImageUrl: '',
  logoMark: '烟',
  navAdminLabel: '后台登录',
  navBrandsLabel: '品牌',
  navCollectionLabel: '商品库',
  navCommunityLabel: '社区',
  navFeedLabel: '动态',
  siteDescription: '按品牌、规格、价格和社区动态浏览商品，并在后台统一管理站点内容。',
  siteName: '日本香烟档案馆',
  siteTitle: '日本香烟档案馆',
}

const main = async () => {
  const client = new Client({ connectionString })
  await client.connect()

  try {
    await client.query('begin')

    await client.query(
      `
      insert into site_settings (
        id, site_title, site_description, site_name, logo_mark, logo_image_url,
        home_hero_title, home_hero_subtitle, browse_collection_label,
        nav_collection_label, nav_brands_label, nav_community_label, nav_feed_label, nav_admin_label,
        collection_search_placeholder, collection_all_label, collection_format_label, collection_price_label, collection_newest_label,
        home_how_button_label, home_why_button_label, home_how_dialog_title, home_how_dialog_subtitle,
        home_why_dialog_title, home_why_dialog_subtitle, created_at, updated_at
      ) values (
        1, $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18,
        $19, $20, $21, $22,
        $23, $24, now(), now()
      )
      on conflict (id) do update set
        site_title = excluded.site_title,
        site_description = excluded.site_description,
        site_name = excluded.site_name,
        logo_mark = excluded.logo_mark,
        logo_image_url = excluded.logo_image_url,
        home_hero_title = excluded.home_hero_title,
        home_hero_subtitle = excluded.home_hero_subtitle,
        browse_collection_label = excluded.browse_collection_label,
        nav_collection_label = excluded.nav_collection_label,
        nav_brands_label = excluded.nav_brands_label,
        nav_community_label = excluded.nav_community_label,
        nav_feed_label = excluded.nav_feed_label,
        nav_admin_label = excluded.nav_admin_label,
        collection_search_placeholder = excluded.collection_search_placeholder,
        collection_all_label = excluded.collection_all_label,
        collection_format_label = excluded.collection_format_label,
        collection_price_label = excluded.collection_price_label,
        collection_newest_label = excluded.collection_newest_label,
        home_how_button_label = excluded.home_how_button_label,
        home_why_button_label = excluded.home_why_button_label,
        home_how_dialog_title = excluded.home_how_dialog_title,
        home_how_dialog_subtitle = excluded.home_how_dialog_subtitle,
        home_why_dialog_title = excluded.home_why_dialog_title,
        home_why_dialog_subtitle = excluded.home_why_dialog_subtitle,
        updated_at = now()
    `,
      [
        siteSettings.siteTitle,
        siteSettings.siteDescription,
        siteSettings.siteName,
        siteSettings.logoMark,
        siteSettings.logoImageUrl,
        siteSettings.homeHeroTitle,
        siteSettings.homeHeroSubtitle,
        siteSettings.browseCollectionLabel,
        siteSettings.navCollectionLabel,
        siteSettings.navBrandsLabel,
        siteSettings.navCommunityLabel,
        siteSettings.navFeedLabel,
        siteSettings.navAdminLabel,
        siteSettings.collectionSearchPlaceholder,
        siteSettings.collectionAllLabel,
        siteSettings.collectionFormatLabel,
        siteSettings.collectionPriceLabel,
        siteSettings.collectionNewestLabel,
        siteSettings.homeHowButtonLabel,
        siteSettings.homeWhyButtonLabel,
        siteSettings.homeHowDialogTitle,
        siteSettings.homeHowDialogSubtitle,
        siteSettings.homeWhyDialogTitle,
        siteSettings.homeWhyDialogSubtitle,
      ],
    )

    await client.query('delete from site_settings_home_how_dialog_items where _parent_id = 1')
    await client.query('delete from site_settings_home_why_dialog_paragraphs where _parent_id = 1')

    for (const [index, item] of siteSettings.homeHowDialogItems.entries()) {
      await client.query(
        'insert into site_settings_home_how_dialog_items (id, _order, _parent_id, glyph, title, body) values ($1, $2, 1, $3, $4, $5)',
        [`how-${index + 1}`, index + 1, item.glyph, item.title, item.body],
      )
    }

    for (const [index, item] of siteSettings.homeWhyDialogParagraphs.entries()) {
      await client.query(
        'insert into site_settings_home_why_dialog_paragraphs (id, _order, _parent_id, content) values ($1, $2, 1, $3)',
        [`why-${index + 1}`, index + 1, item.content],
      )
    }

    await client.query('commit')
    console.log('[site-settings] synced')
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
