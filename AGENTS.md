# AGENTS.md — AI 代理开发规范

> 本文档是 AI 编码代理（以及协作开发者）在本仓库工作时的行为规范与项目约定。
> 开始任何改动前，请先阅读 `PRD.md`（产品需求）与 `TECH_DESIGN.md`（技术设计）。

## 1. 项目概述

个人展示网站，包含：个人介绍、技能展示、项目展示、博客。

- **技术栈**：Vite 8 + React 19 + TypeScript（strict）+ Tailwind CSS v4（`@tailwindcss/vite`）+ react-router v8 + Framer Motion；星空背景为自绘 Canvas 2D；博客/项目内容为 MDX（`@mdx-js/rollup` + `import.meta.glob`），代码高亮 rehype-pretty-code/shiki，搜索 MiniSearch，Lint 用 oxlint。
- **架构**：静态优先（SPA + 静态预渲染）。内容以文件为唯一事实源，构建期导入并预渲染；动态能力走第三方服务（Formspree、Giscus 等），无自建后端。
- **核心原则**：内容与代码解耦——新增/修改项目或文章，只改 `content/`、`data/` 下的文件，不改业务代码。

## 2. 常用命令

```bash
npm install          # 安装依赖
npm run dev          # 本地开发（默认 http://localhost:5173）
npm run build        # 生产构建（tsc 类型检查 + vite 打包）
npm run typecheck    # TypeScript 类型检查（tsc -b）
npm run lint         # oxlint 检查
npm run preview      # 预览生产构建
npm run test         # 单元/组件测试（Vitest，待引入）
npm run test:e2e     # 端到端测试（Playwright，按需）
```

## 3. 目录结构（精简）

```
src/
  pages/        # 路由级页面：home / about / skills / projects / blog / contact
  components/   # 展示组件：layout / starfield / sections / ui / mdx
  lib/          # 数据读取、MDX、SEO 工具（无 UI）
  hooks/        # 自定义 hooks（如 use-theme）
  types/        # 数据模型类型
  routes.tsx    # react-router 路由表（createBrowserRouter）
  root.tsx      # 根组件（主题 + 星空 + 布局）
content/        # MDX 内容源：projects/、blog/
data/           # JSON 配置：profile.json、skills.json
public/         # 静态资源（图片、favicon）
scripts/        # 构建脚本（生成 sitemap/robots/feed）
```

## 4. 开发规范

- **内容驱动**：项目/博客数据一律放 `content/*.mdx`，个人资料/技能放 `data/*.json`。禁止在组件内硬编码这些内容。
- **统一数据入口**：所有内容读取必须经 `lib/content.ts` 暴露的函数（如 `getProjects()`、`getBlogPosts()`、`getProfile()`、`getSkills()`）；组件不得直接 import 原始文件。
- **内容导入方式**：用 Vite 的 `import.meta.glob` 构建期导入 `content/`、`data/` 下的文件，不要用 Node 的 `fs`（SPA 无 Node 运行时）。
- **frontmatter 校验**：MDX 的 frontmatter 与 JSON 配置必须用 **zod** 校验；字段缺失/类型错误在构建期报错，不允许静默降级。
- **组件分层**：`pages/` 只做路由级组装与数据获取；`components/` 只做展示，不写数据访问逻辑。
- **交互边界**：SPA 无服务端组件；区分「纯展示组件」与「含 hooks/事件/Canvas/动画的交互组件」。星空、导航、主题切换、搜索属于交互组件，注意副作用清理。
- **静态生成优先**：内容页通过 `import.meta.glob` 静态导入；路由在 `routes.tsx` 用 `createBrowserRouter` 定义；prerender 预渲染与 sitemap/RSS 生成（`scripts/generate-meta.mjs`）留到 M4。
- **新增依赖须谨慎**：保持静态优先轻量，避免引入数据库、鉴权或重型库；确需新增依赖时说明理由。

## 5. 代码风格

- **TypeScript**：开启 `strict`，禁止 `any`；用 `types/index.ts` 中的接口，尽量用类型推断而非显式冗余标注。
- **命名**：组件与类型用 PascalCase，文件与目录用 kebab-case，hooks 用 `useXxx`，常量用 UPPER_SNAKE_CASE。
- **Import 顺序**：内置 → 第三方 → 本地（`@/`），分组间空一行；优先使用路径别名 `@/`（指向 `src/`）。
- **Tailwind**：优先使用设计令牌（`src/index.css` 中 `@theme` 定义的 CSS 变量），避免随意硬编码色值或使用大量任意值 `[...]`。
- **React**：函数组件 + hooks；避免不必要的 `useEffect`（衍生状态用 `useMemo`/`useState` 初始化器）；列表渲染用稳定 `key`；`useEffect` 必须正确清理（取消 rAF/移除监听）。
- **可访问性**：语义化标签（`nav/main/section/article`）、`aria-label`、可见焦点样式、触控目标 ≥ 44px、对比度满足 WCAG AA；纯装饰元素加 `aria-hidden`。
- **格式化**：提交前保证 `npm run lint` 与 `npm run typecheck` 通过。

## 6. 测试要求

- **框架**：Vitest + React Testing Library（组件/单元）；Playwright（关键路径 e2e，按需）。
- **必须覆盖**：
  - `lib/content.ts` 的 MDX/JSON 读取与 zod 校验（正常 + 缺失字段 + 非法类型）；
  - 数据派生逻辑：标签分组、项目筛选、文章排序、阅读时长计算、TOC 提取。
- **建议覆盖**：关键交互组件（导航菜单、主题切换、项目筛选、搜索输入）。
- **不需要过度测试**：纯静态展示与第三方样式细节不做断言。
- 新功能合入前，运行 `npm run test` 确认无回归。

## 7. 注意事项（易踩坑）

1. **星空背景**：Canvas 必须 `position: fixed`、`pointer-events: none`，置于内容层之下；粒子数量按视口/设备自适应，`document.hidden` 时暂停；尊重 `prefers-reduced-motion`（关闭漂移/闪烁，只画静态星点）。不要用 DOM 元素逐星渲染。
2. **深色主题防 FOUC**：主题切换必须走自研 ThemeProvider（`hooks/use-theme.ts`）+ `index.html` 内联脚本，首帧前写入 `html` 的 `data-theme`；颜色统一走 `@theme` 中的 CSS 变量，深浅主题只切换变量值。
3. **MDX 渲染**：用 `@mdx-js/rollup` 在构建期编译 `.mdx`，经 `import.meta.glob` 导入；代码高亮用 shiki（深/浅双主题随主题切换）。不要在客户端运行时编译 MDX。
4. **SEO**：用 React 19 原生 `<title>/<meta>` 声明页面元信息，保留 JSON-LD（`Person`/`WebSite`/`BlogPosting`）；sitemap/robots/feed 由 `scripts/generate-meta.mjs` 生成，prerender 预渲染留到 M4（react-router framework 模式）；图片走 `public/`（可选 vite-imagetools）。
5. **环境变量**：仅 `VITE_` 前缀的变量会暴露到客户端；密钥（邮件服务等）只能放服务端（Serverless 环境变量），严禁写入客户端代码或提交到仓库。
6. **表单安全**：默认用 Formspree；若自建则服务端 zod 校验 + 蜜罐 + 限流，不要在前端只做校验。
7. **中文内容**：注意字体栈包含中文字体；搜索（MiniSearch/Pagefind）需验证中文分词效果。
8. **不要偏离架构**：除非用户明确要求，否则不引入数据库、鉴权系统或重型后端；保持静态优先与内容文件化。

## 8. 完成定义（Definition of Done）

- `npm run lint`、`npm run typecheck`、`npm run test` 全部通过；
- 新增内容已通过 zod 校验并能被 `import.meta.glob` 导入；
- 关键页面在移动端/桌面端视觉正常，星空与主题切换无回归；
- 不引入未说明的新依赖。
