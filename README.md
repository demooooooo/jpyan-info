# jpyan-info

这个仓库现在按前后台分成两个独立目录管理：

- `frontend-cloudflare`
  - 给 Cloudflare 用的前台站点模板
  - 当前内容来自之前确认过的 `site` 静态镜像
- `admin-vercel`
  - 给 Vercel 用的 Payload 后台
  - 负责商品、品牌、首页展示等内容管理

推荐部署方式：

1. `frontend-cloudflare` 部署到 Cloudflare Pages
2. `admin-vercel` 部署到 Vercel
3. 前台后面再按需要对接后台接口或内容源

当前重构目标是先把代码管理结构拆清楚，不再把前后台混在一个目录里。
