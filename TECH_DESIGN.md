# 个人展示网站 · 技术设计文档（TECH DESIGN）

版本：v1.1
日期：2026-10-20
关联文档：`PRD.md`、`AGENTS.md`

> v1.1 变更：框架由 Next.js App Router 迁移为 **Vite + React 19 + TypeScript**；路由/MDX/主题/SEO 方案替换为 Vite 生态对应实现；Tailwind 采用 v4 `@theme` 配置；Linter 改为 oxlint。

## 0. 架构决策总览

个人展示网站内容更新频率低、读取远多于写入，采用 **静态优先架构**：内容以文件形式存于代码仓库，构建期读取并预渲染为静态 HTML，运行时无服务器负担。动态能力（联系表单、评论、阅读量）通过第三方服务补齐，避免维护自建后端。

| 维度 | 决策 |
|---|---|
| 整体架构 | 静态优先（SPA + 静态预渲染） |
| 内容来源 | Markdown/MDX 文件 + JSON 配置（Git 为唯一事实源） |
| 数据读取 | 构建期 `import.meta.glob` 导入文件 + zod 校验 |
| 静态生成 | SPA 客户端渲染；M4 引入 React Router `prerender` 预渲染 + 构建脚本 sitemap/feed |
| 动态能力 | 第三方服务（Formspree / Giscus / 可选的 Serverless Function） |

---

## 1. 技术栈选择

### 1.1 前端

| 用途 | 选择 | 理由 |
|---|---|---|
| 构建工具 | **Vite 8** | 极速冷启动与 HMR，生态成熟 |
| UI 框架 | **React 19** | 原生支持 `<title>/<meta>` 提升到 `<head>`，生态成熟 |
| 语言 | **TypeScript**（strict） | 类型安全，配合 frontmatter 校验 |
| 路由 | **react-router v8（library 模式，`createBrowserRouter`）** | 声明式路由、懒加载、SPA 导航 |
| SEO / 预渲染 | React 19 原生 `<title>/<meta>` + `scripts/generate-meta.mjs`；M4 引入 framework 模式 `prerender` | SPA 静态 HTML 化，利于 SEO |
| 样式 | **Tailwind CSS v4（`@tailwindcss/vite`）** | 原子化 + CSS `@theme` 设计令牌，无需 `tailwind.config.ts`/PostCSS |
| 动效 | **Framer Motion（motion）** | 声明式入场/滚动/悬浮动画，支持 `reduced-motion` |
| 主题切换 | **自研 ThemeProvider**（`localStorage` + `prefers-color-scheme` + `index.html` 内联脚本） | 轻量、防 FOUC，替代 next-themes |
| 星空背景 | **自绘 Canvas 2D 粒子系统** | 轻量、可控、性能好；Three.js 作为后续升级项 |
| 图标 | **lucide-react** | 统一风格、Tree-shaking |
| MDX | **@mdx-js/rollup + remark-frontmatter + remark-mdx-frontmatter**（内容经 `import.meta.glob` 导入） | 构建期编译；备选 `content-collections` |
| 代码高亮 | **rehype-pretty-code + shiki** | 高质量代码高亮，支持深/浅双主题 |
| 搜索 | **MiniSearch**（客户端，构建期从内容建索引） | 无后端；预渲染后可用 Pagefind 备选 |
| 图片 | **`public/` 静态托管 + 可选 `vite-imagetools`** | 替代 next/image，生成响应式图 |
| Lint / 格式化 | **oxlint**（项目默认） | 快速、零配置，替代 ESLint |

> 备选：Astro（更极致的内容站性能，但需换框架）。

### 1.2 后端

纯静态站，无独立后端服务；动态能力走第三方：

| 用途 | 选择 | 说明 |
|---|---|---|
| 应用运行时 | 无后端（静态托管） | 构建产物为静态文件 |
| 联系表单 | **Formspree**（或 Serverless Function + Resend） | 前端直连，免自建后端 |
| 部署 | **Vercel / Cloudflare Pages / Netlify** | 零运维，静态托管 |

> 如需完整自建后端（不建议首版），可选 NestJS/Fastify + 独立部署。

### 1.3 数据库 / 内容存储

**首版不引入关系型数据库**，内容以文件 + Git 承载：

| 内容 | 存储方式 | 说明 |
|---|---|---|
| 个人资料、技能 | `data/profile.json`、`data/skills.json` | 构建期导入 |
| 项目 | `content/projects/*.mdx` | 含 frontmatter + 正文 |
| 博客 | `content/blog/*.mdx` | 含 frontmatter + 正文 |
| 评论 | **Giscus**（GitHub Discussions） | 零数据库、零自建 |
| 阅读量 | 可选：**Umami / 自建 KV** | 非首版必需 |
| 联系消息 | 默认走邮件（不落库）；如需留存用 SQLite(Prisma/Drizzle) 或 Postgres(Neon/Supabase) | 按需引入 |

**升级路径**：需要「后台管理、评论、多用户、全文检索数据库」时，引入 Postgres（Neon/Supabase）+ Drizzle ORM，并将 MDX 迁移为数据库字段。

### 1.4 其他服务

| 用途 | 选择 |
|---|---|
| 分析统计 | Umami / Plausible（隐私友好） |
| 图片存储 | `public/` 静态托管；大量图用 Cloudflare R2 / S3 |

---

## 2. 项目结构

采用 Vite SPA + React Router（v8 library 模式）+ 内容目录分离：

```
cuis/
├── index.html                    # SPA 入口 + 防 FOUC 内联主题脚本
├── vite.config.ts                # Vite 配置（react、tailwind、mdx、@ 别名）
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── .oxlintrc.json
├── public/                       # 静态资源（头像、封面、favicon）
├── scripts/
│   └── generate-meta.mjs         # 构建脚本：生成 sitemap.xml / robots.txt / feed.xml
├── src/
│   ├── main.tsx                  # React 入口 + RouterProvider
│   ├── index.css                 # Tailwind @import + @theme 设计令牌
│   ├── root.tsx                  # 根组件：ThemeProvider + 星空 + 布局 + Outlet
│   ├── routes.tsx                 # 路由表（createBrowserRouter，SPA 路由）
│   ├── pages/
│   │   ├── home.tsx              # 首页（Hero + 各区块概览）
│   │   ├── about.tsx             # 个人介绍
│   │   ├── skills.tsx            # 技能展示
│   │   ├── projects.tsx          # 项目列表 + 筛选
│   │   ├── project-detail.tsx    # /projects/:slug
│   │   ├── blog.tsx              # 博客列表 + 标签
│   │   ├── blog-post.tsx         # /blog/:slug
│   │   └── contact.tsx           # 联系页
│   ├── components/
│   │   ├── layout/               # Navbar、Footer、MobileMenu
│   │   ├── starfield/            # Starfield.tsx（Canvas 粒子）
│   │   ├── sections/             # Hero、About、Skills、Projects、Blog、Contact
│   │   ├── ui/                   # Card、Button、Tag、Badge、Timeline、TOC
│   │   └── mdx/                  # MDX 自定义组件（代码块、图片等）
│   ├── lib/
│   │   ├── content.ts            # import.meta.glob 读取 MDX/JSON + zod 校验
│   │   ├── mdx.ts                # remark/rehype 插件配置
│   │   └── seo.ts                # meta、JSON-LD、TOC 工具
│   ├── hooks/
│   │   └── use-theme.ts          # 主题 hook
│   └── types/
│       └── index.ts              # 数据模型类型
├── content/
│   ├── projects/*.mdx
│   └── blog/*.mdx
└── data/
    ├── profile.json
    └── skills.json
```

分层原则：`pages/` 只做路由级组装与数据获取 → `lib/` 负责数据读取与业务逻辑 → `components/` 负责展示 → `content/` + `data/` 是数据源。

---

## 3. 数据模型

内容主体为 MDX 的 frontmatter + JSON 配置，用 TypeScript 接口 + zod 校验定义。

### 3.1 个人资料（Profile）—— `data/profile.json`

```ts
interface Profile {
  name: string;
  title: string;            // 一句话定位
  bio: string;              // 简介（支持 Markdown）
  avatar?: string;
  email: string;
  location?: string;
  socials: { label: string; url: string; icon: string }[];
  timeline: { period: string; title: string; org?: string; description?: string }[];
  stats: { label: string; value: string }[];  // 如「5 年经验」「12 个项目」
}
```

### 3.2 技能（Skill）—— `data/skills.json`

```ts
type SkillCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'design' | 'other';

interface Skill {
  name: string;
  icon: string;             // lucide 图标名
  category: SkillCategory;
  level?: 1 | 2 | 3 | 4 | 5; // 熟练度，可选
  description?: string;
}
```

### 3.3 项目（Project）—— `content/projects/*.mdx` frontmatter

```yaml
---
title: 项目名称
slug: my-project
description: 一句话简介
cover: /images/projects/my-project.png
techStack: [React, TypeScript, Tailwind]
category: Web 应用
featured: true
year: '2026'
role: 独立开发
links:
  github: https://github.com/xxx
  demo: https://demo.example.com
highlights:
  - 成果数据或亮点 1
  - 成果数据或亮点 2
---
正文：背景、技术方案、我的贡献…
```

```ts
interface Project {
  slug: string;
  title: string;
  description: string;
  cover?: string;
  techStack: string[];
  category?: string;
  featured: boolean;
  year?: string;
  role?: string;
  links?: { github?: string; demo?: string };
  highlights?: string[];
  // content 为 MDX 编译后的组件，由 import.meta.glob 单独导出
}
```

### 3.4 博客文章（BlogPost）—— `content/blog/*.mdx` frontmatter

```yaml
---
title: 文章标题
slug: hello-world
description: 摘要
cover: /images/blog/xxx.png
publishedAt: '2026-10-20'
updatedAt: '2026-10-20'
tags: [前端, React]
draft: false
---
正文（Markdown/MDX）
```

```ts
interface BlogPost {
  slug: string;
  title: string;
  description: string;
  cover?: string;
  publishedAt: string;       // ISO 日期
  updatedAt?: string;
  tags: string[];
  draft: boolean;
  readingMinutes?: number;   // 构建期计算
  // content 为 MDX 编译后的组件
}
```

### 3.5 联系消息（ContactMessage）—— 仅当引入数据库时

```ts
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  ip?: string;
}
```

### 3.6 数据流转

```
content/ + data/ (源文件)
   │ 构建期由 lib/content.ts 用 import.meta.glob 导入 + zod 校验
   ▼
类型化数组 (Project[] / BlogPost[] / Skill[])
   │ routes.tsx 定义路由 + pages/ 渲染
   ▼
SPA 页面（react-router v8 客户端渲染；M4 引入 prerender + 构建脚本 sitemap/feed）
```

---

## 4. 关键技术点

### 4.1 星空背景的性能与体验
- 用 **单个 `<canvas>`** 铺满视口，粒子（星星）数量按设备性能/视口自适应：桌面约 200-400，移动端减半。
- 使用 `requestAnimationFrame` 驱动，`document.hidden` 时暂停；`devicePixelRatio` 做缩放避免模糊。
- 闪烁用逐帧 alpha 正弦波动实现；流星/视差作为可选层，默认关闭以省性能。
- 尊重 `prefers-reduced-motion`：关闭漂移/闪烁，只渲染静态星点。
- 难点：避免高频重绘导致移动端掉帧、避免 Canvas 盖住交互（`pointer-events: none`、置于内容层之下）。

### 4.2 深色主题与首屏闪烁（FOUC）
- 用自研 ThemeProvider（`use-theme.ts`）+ `index.html` 内联脚本，首帧前写入 `html` 的 `data-theme`，避免主题闪白。
- 设计令牌（颜色）集中在 `src/index.css` 的 Tailwind v4 `@theme` 中，深浅主题只切换 CSS 变量值。
- 星空、代码高亮（shiki 双主题）需随主题联动。

### 4.3 SEO 与静态生成
- 当前为 SPA 客户端渲染；M4 引入 react-router framework 模式 `prerender`，将内容页预渲染为静态 HTML。
- 每个路由用 React 19 原生 `<title>/<meta>`（或 React Router `meta`/`links`）声明 title/description/OG。
- `scripts/generate-meta.mjs` 构建期生成 `sitemap.xml`、`robots.txt`、`feed.xml`（RSS）。
- 博客/项目详情注入 **JSON-LD**（`BlogPosting`、`Person`、`WebSite`）结构化数据。
- 中文站点注意 title 长度与关键词密度。

### 4.4 MDX 渲染与代码高亮
- 用 `@mdx-js/rollup` 在构建期编译 `.mdx`，`import.meta.glob` 导入内容，避免运行时编译开销与 hydration 问题。
- 代码高亮用 `rehype-pretty-code + shiki`（深/浅双主题随主题切换）。
- 提取文章标题（TOC）：`rehype-slug` + `rehype-autolink-headings` 生成锚点，构建期收集目录。
- 自定义 MDX 组件（`a`、`img`、`pre`）统一样式与图片懒加载接入。

### 4.5 图片优化
- 静态图走 `public/`；需要响应式/压缩时用 `vite-imagetools`（替代 next/image）生成 WebP/AVIF 与多尺寸。
- 封面/头像设置占位与懒加载，避免 LCP 过高。

### 4.6 全文搜索（静态、无后端）
- 采用 **MiniSearch**：构建期从 MDX frontmatter + 正文建索引，前端按标签/关键词检索；中文需验证分词效果，必要时配置词典或用 FlexSearch 备选。
- 预渲染后也可用 **Pagefind** 对静态 HTML 建索引。
- 首版搜索范围：博客标题 + 摘要 + 正文，可选扩展到项目。

### 4.7 联系表单安全与防滥用
- 默认用 **Formspree**（第三方处理校验与反垃圾）；如需自建，走 Serverless Function + zod 校验 + 蜜罐 + 限流。
- 敏感信息（邮件服务密钥）放服务端环境变量，不暴露到客户端。

### 4.8 响应式与无障碍
- 以 Tailwind 断点（`sm/md/lg`，对应 PRD 的 640/1024）布局；移动端触控目标 ≥ 44px。
- 语义化标签（`nav/main/section/article`）、`aria-label`、键盘可导航、焦点样式。
- 对比度满足 WCAG AA；目标 Lighthouse 性能/可访问性 ≥ 90。

### 4.9 内容与代码解耦
- 新增/修改项目或文章只需增改 `content/*.mdx` 或 `data/*.json`，无需改代码。
- frontmatter 用 zod 校验，字段缺失在构建期报错，避免上线后才发现数据问题。

---

## 5. 建议实施顺序（对应 PRD 里程碑）

1. **M1（已完成）**：Vite + Tailwind 脚手架、react-router 路由、导航/页脚、深色主题 + Canvas 星空、首页/关于/技能页。
2. **M2**：项目 MDX 读取 + 列表/详情/筛选（含 zod 校验）。
3. **M3**：博客 MDX 渲染、代码高亮、标签归档、RSS、MiniSearch 搜索。
4. **M4**：预渲染（prerender）、SEO（sitemap/JSON-LD/OG）、响应式打磨、无障碍、性能优化、部署上线。
