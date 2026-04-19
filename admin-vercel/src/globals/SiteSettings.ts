import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: '网站设置',
  },
  access: {
    read: () => true,
  },
  label: '站点设置',
  fields: [
    {
      name: 'siteTitle',
      label: '站点标题',
      type: 'text',
      defaultValue: 'YYanHub Product Archive',
      required: true,
    },
    {
      name: 'siteDescription',
      label: '站点说明',
      type: 'textarea',
      defaultValue: '按品牌、规格、价格和社区动态浏览商品，并在后台统一管理站点内容。',
    },
    {
      name: 'siteName',
      label: '左上角站点名称',
      type: 'text',
      defaultValue: '日本香烟档案馆',
    },
    {
      name: 'logoMark',
      label: '左上角文字 Logo',
      type: 'text',
      defaultValue: '烟',
    },
    {
      name: 'logoImageUrl',
      label: '左上角图片 Logo',
      type: 'text',
    },
    {
      name: 'homeHeroTitle',
      label: '首页主标题',
      type: 'text',
      defaultValue: '日本香烟档案馆',
      required: true,
    },
    {
      name: 'homeHeroSubtitle',
      label: '首页副标题',
      type: 'text',
      defaultValue: 'Japanese Cigarette Archive',
    },
    {
      name: 'browseCollectionLabel',
      label: '首页按钮文字',
      type: 'text',
      defaultValue: '浏览商品',
    },
    {
      name: 'navCollectionLabel',
      label: '导航-商品库',
      type: 'text',
      defaultValue: '商品库',
    },
    {
      name: 'navBrandsLabel',
      label: '导航-品牌',
      type: 'text',
      defaultValue: '品牌',
    },
    {
      name: 'navCommunityLabel',
      label: '导航-社区',
      type: 'text',
      defaultValue: '社区',
    },
    {
      name: 'navFeedLabel',
      label: '导航-动态',
      type: 'text',
      defaultValue: '动态',
    },
    {
      name: 'navAdminLabel',
      label: '导航-后台登录',
      type: 'text',
      defaultValue: '后台登录',
    },
    {
      name: 'collectionSearchPlaceholder',
      label: '首页搜索提示',
      type: 'text',
      defaultValue: '搜索商品…',
    },
    {
      name: 'collectionAllLabel',
      label: '筛选-全部',
      type: 'text',
      defaultValue: '全部',
    },
    {
      name: 'collectionFormatLabel',
      label: '筛选-规格',
      type: 'text',
      defaultValue: '规格',
    },
    {
      name: 'collectionPriceLabel',
      label: '筛选-价格',
      type: 'text',
      defaultValue: '价格',
    },
    {
      name: 'collectionNewestLabel',
      label: '筛选-最新',
      type: 'text',
      defaultValue: '最新',
    },
    {
      name: 'homeHowButtonLabel',
      label: '按钮-如何使用',
      type: 'text',
      defaultValue: '如何使用',
    },
    {
      name: 'homeWhyButtonLabel',
      label: '按钮-为什么做',
      type: 'text',
      defaultValue: '为什么做',
    },
    {
      name: 'homeHowDialogTitle',
      label: '弹窗-如何使用标题',
      type: 'text',
      defaultValue: '如何使用',
    },
    {
      name: 'homeHowDialogSubtitle',
      label: '弹窗-如何使用副标题',
      type: 'textarea',
      defaultValue: '在首页浏览、筛选、搜索并查看每个商品的详细资料。',
    },
    {
      name: 'homeHowDialogItems',
      label: '弹窗-如何使用内容',
      type: 'array',
      fields: [
        {
          name: 'glyph',
          label: '图标字',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          label: '小标题',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          label: '说明文字',
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
      label: '弹窗-为什么做标题',
      type: 'text',
      defaultValue: '为什么做',
    },
    {
      name: 'homeWhyDialogSubtitle',
      label: '弹窗-为什么做副标题',
      type: 'textarea',
      defaultValue: '把原来分散的商品内容整理成一个更清晰、更容易管理的站点。',
    },
    {
      name: 'homeWhyDialogParagraphs',
      label: '弹窗-为什么做内容',
      type: 'array',
      fields: [
        {
          name: 'content',
          label: '段落内容',
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
    {
      name: 'turnstileEnabled',
      label: '启用 Cloudflare 验证码',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'turnstileSiteKey',
      label: 'Cloudflare 验证码 Site Key',
      type: 'text',
      admin: {
        description: '前台会使用这个公开 Key 渲染验证码。',
      },
    },
    {
      name: 'turnstileSecretKey',
      label: 'Cloudflare 验证码 Secret Key',
      type: 'text',
      access: {
        read: ({ req }) => Boolean(req.user),
      },
      admin: {
        description: '提交评论时，服务端会用这个密钥向 Cloudflare 校验验证码。',
      },
    },
  ],
}
