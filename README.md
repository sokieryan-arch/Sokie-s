# Bazi Novel Engine

AI 命理小说角色与故事工作台。

## 功能

- 公历、农历、干支三种出生输入
- 自动换算四柱八字、五行、纳音、日主与五行分布
- 基于命盘生成角色档案，支持换名与自定义姓名
- 使用服务器本地文件存储角色库与羁绊，不再依赖 Supabase
- 选择主角与配角，生成命格羁绊
- 基于角色阵容与羁绊生成导演大纲或完整章节

## 本地运行

```bash
npm install
copy .env.example .env.local
npm run dev
```

在 `.env.local` 中配置：

```bash
DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY"
BAZI_DATA_DIR=".data"
```

`BAZI_DATA_DIR` 用于保存角色库数据。生产服务器建议使用 `/var/lib/bazi-novel-engine`，这样重新拉代码、构建或重启服务都不会覆盖角色数据。

## 服务器部署

项目可以直接部署在火山服务器上：

```bash
npm ci --omit=dev
npm run build
BAZI_DATA_DIR=/var/lib/bazi-novel-engine npm run start
```

当前版本按个人创作工具设计，未加入登录隔离。公开部署前建议在 Nginx 或应用层增加访问密码、IP 白名单或登录系统。

## 命理边界

命盘转换使用 `lunar-typescript`，定位为“创作用准确”。当前不做出生地、真太阳时、专业起运、早晚子时等专业排盘规则。

## 安全提醒

DeepSeek 密钥只应使用 `DEEPSEEK_API_KEY`，不要放在 `NEXT_PUBLIC_*` 环境变量中。若曾经把密钥暴露在前端环境变量里，建议立即轮换。
