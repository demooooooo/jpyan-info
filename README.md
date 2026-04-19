# Payload-CMS

## 本地运行

```bash
npm install
npm run generate:types
npm run generate:importmap
npm run import:yyanhub
npm run dev
```

打开：

- 前台：`http://127.0.0.1:3000`
- 后台：`http://127.0.0.1:3000/admin`

首次进入后台时，按页面提示创建管理员账号即可。

## 当前阶段已完成

- 已建立独立 Payload 项目
- 已导入品牌、商品和一部分商品关联内容
- 商品支持 `Show on home page`
- 首页、品牌页、商品详情页、Community、Feed 已接到 Payload 数据
- 已把之前抓下来的网页模板放进 `template-source/ciggies`

## 旧数据来源

- MySQL：`yyanhub`
- 本地图片目录：`E:/EasyLink/yyanhub/信息站-WP/yyanhub/image/upload`

## 旧数据再次导入

```bash
npm run import:yyanhub
```

## Vercel / Neon

项目在检测到 `DATABASE_URL` 或 `POSTGRES_URL` 后，会自动改走 Postgres。

常用命令：

```bash
npm run migrate:postgres
npm run build:vercel
```
