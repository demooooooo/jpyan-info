import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
      defaultValue: 'YYanHub Product Archive',
      required: true,
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      defaultValue: '按品牌、规格、价格和社区动态浏览商品，并在后台统一管理站点内容。',
    },
    {
      name: 'siteName',
      type: 'text',
      defaultValue: '日本香烟档案馆',
    },
    {
      name: 'logoMark',
      type: 'text',
      defaultValue: '烟',
    },
    {
      name: 'logoImageUrl',
      type: 'text',
    },
    {
      name: 'homeHeroTitle',
      type: 'text',
      defaultValue: '日本香烟档案馆',
      required: true,
    },
    {
      name: 'homeHeroSubtitle',
      type: 'text',
      defaultValue: 'Japanese Cigarette Archive',
    },
    {
      name: 'browseCollectionLabel',
      type: 'text',
      defaultValue: '浏览商品',
    },
    {
      name: 'navCollectionLabel',
      type: 'text',
      defaultValue: '商品库',
    },
    {
      name: 'navBrandsLabel',
      type: 'text',
      defaultValue: '品牌',
    },
    {
      name: 'navCommunityLabel',
      type: 'text',
      defaultValue: '社区',
    },
    {
      name: 'navFeedLabel',
      type: 'text',
      defaultValue: '动态',
    },
    {
      name: 'navAdminLabel',
      type: 'text',
      defaultValue: '后台登录',
    },
    {
      name: 'collectionSearchPlaceholder',
      type: 'text',
      defaultValue: '搜索商品…',
    },
    {
      name: 'collectionAllLabel',
      type: 'text',
      defaultValue: '全部',
    },
    {
      name: 'collectionFormatLabel',
      type: 'text',
      defaultValue: '规格',
    },
    {
      name: 'collectionPriceLabel',
      type: 'text',
      defaultValue: '价格',
    },
    {
      name: 'collectionNewestLabel',
      type: 'text',
      defaultValue: '最新',
    },
    {
      name: 'homeHowButtonLabel',
      type: 'text',
      defaultValue: '如何使用',
    },
    {
      name: 'homeWhyButtonLabel',
      type: 'text',
      defaultValue: '为什么做',
    },
    {
      name: 'homeHowDialogTitle',
      type: 'text',
      defaultValue: '如何使用',
    },
    {
      name: 'homeHowDialogSubtitle',
      type: 'textarea',
      defaultValue: '在首页浏览、筛选、搜索并查看每个商品的详细资料。',
    },
    {
      name: 'homeHowDialogItems',
      type: 'array',
      fields: [
        {
          name: 'glyph',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
        },
      ],
      defaultValue: [
        {
          glyph: '图',
          title: '拖动首屏',
          body: '首屏可以上下左右拖动，也支持缩放，先快速浏览你想看的商品。',
        },
        {
          glyph: '筛',
          title: '筛选商品',
          body: '点击浏览商品后，可以按品牌、规格、价格和最新排序来快速缩小范围。',
        },
        {
          glyph: '详',
          title: '查看详情',
          body: '每个商品卡片都可以进入详情页，查看图片、价格、参数和条码。',
        },
      ],
    },
    {
      name: 'homeWhyDialogTitle',
      type: 'text',
      defaultValue: '为什么做',
    },
    {
      name: 'homeWhyDialogSubtitle',
      type: 'textarea',
      defaultValue: '把原来分散的商品内容整理成一个更清晰、更容易管理的站点。',
    },
    {
      name: 'homeWhyDialogParagraphs',
      type: 'array',
      fields: [
        {
          name: 'content',
          type: 'textarea',
          required: true,
        },
      ],
      defaultValue: [
        {
          content: '前台保留原有页面样式，后台负责统一管理品牌、商品、图片和首页展示内容。',
        },
        {
          content: '这样你后面补商品、换图片、改首页文案，都不用再手改页面文件。',
        },
      ],
    },
  ],
}
