import { z } from 'zod'

import profileJson from '../../data/profile.json'
import skillsJson from '../../data/skills.json'
import { profileSchema, skillSchema } from '@/lib/schemas'
import type { BlogPost, Profile, Project, SiteSettings, Skill } from '@/types'

// 源 JSON 在模块加载时校验，数据错误立即抛错（fail-fast，不允许静默降级）。
export const seedProfile: Profile = profileSchema.parse(profileJson)
export const seedSkills: Skill[] = z.array(skillSchema).parse(skillsJson)

// 项目/博客为演示种子数据；真实内容位于 content/*.mdx（见 AGENTS.md）。
export const seedProjects: Project[] = [
  {
    slug: 'portfolio-site',
    title: '个人作品集网站',
    description: '深色主题的静态展示网站，含星空背景与博客。',
    cover: '',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    category: 'Web 应用',
    featured: true,
    year: '2026',
    role: '独立开发',
    links: { github: 'https://github.com/yourname' },
    highlights: ['响应式布局', '星空 Canvas 背景'],
    content:
      '## 项目简介\n\n一个静态优先的个人展示网站，包含个人介绍、技能、项目与博客。\n\n## 技术栈\n\n- React 19\n- TypeScript\n- Tailwind CSS v4',
  },
  {
    slug: 'admin-dashboard',
    title: '后台管理面板',
    description: '用于管理个人资料、技能、项目与博客的后台。',
    cover: '',
    techStack: ['React', 'TypeScript', 'Zod'],
    category: 'Web 应用',
    featured: false,
    year: '2026',
    role: '独立开发',
    content: '## 功能\n\n- 登录鉴权\n- Markdown 编辑器\n- 统一 API 层',
  },
]

export const seedPosts: BlogPost[] = [
  {
    slug: 'hello-world',
    title: '你好，世界',
    description: '第一篇博客文章，介绍本站的搭建思路。',
    cover: '',
    publishedAt: '2026-10-20',
    tags: ['随笔'],
    draft: false,
    readingMinutes: 1,
    content: '# 你好，世界\n\n这是第一篇博客文章。',
  },
  {
    slug: 'markdown-guide',
    title: 'Markdown 写作指南',
    description: '常用 Markdown 语法速查。',
    cover: '',
    publishedAt: '2026-10-19',
    tags: ['教程', 'Markdown'],
    draft: true,
    readingMinutes: 1,
    content: '# Markdown 写作指南\n\n- **加粗**\n- *斜体*\n- `行内代码`\n\n```ts\nconst x = 1\n```',
  },
]

export const defaultSettings: SiteSettings = {
  siteName: '我的名字',
  siteDescription: '个人展示网站 —— 个人介绍、技能、项目与博客',
  author: '你的名字',
  email: 'me@example.com',
  github: 'https://github.com/yourname',
}
