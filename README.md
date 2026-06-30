# Bazi Novel Engine

基于八字命盘的 AI 小说角色与故事工作台。

## 功能

- 公历、农历、干支三种出生输入
- 自动换算四柱八字、五行、纳音、日主与五行分布
- 基于命盘生成角色档案，支持换名与自定义姓名
- 使用 Supabase Postgres 保存角色库
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
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
```

## Supabase

在 Supabase SQL Editor 中执行 `supabase.schema.sql`，创建：

- `characters`
- `bonds`

当前版本按个人创作工具设计，不包含登录隔离。公开部署前建议加访问控制或 Supabase Auth。

## 命理边界

命盘转换使用 `lunar-typescript`，定位为“创作用准确”。当前不做出生地、真太阳时、专业起运、早晚子时等专业排盘规则。

## 安全提醒

DeepSeek 密钥只应使用 `DEEPSEEK_API_KEY`，不要放在 `NEXT_PUBLIC_*` 环境变量中。若曾经把密钥暴露在前端环境变量里，建议立即轮换。
