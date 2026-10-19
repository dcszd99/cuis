import { z } from 'zod'

// 统一的 zod 校验 schema，供前台数据读取（fail-fast）与后台表单共用。

export const socialSchema = z.object({
  label: z.string().min(1, '标签不能为空'),
  url: z.string().min(1, '链接不能为空'),
  icon: z.string().min(1, '图标名不能为空'),
})

export const timelineSchema = z.object({
  period: z.string().min(1, '时间段不能为空'),
  title: z.string().min(1, '标题不能为空'),
  org: z.string().optional(),
  description: z.string().optional(),
})

export const statSchema = z.object({
  label: z.string().min(1, '标签不能为空'),
  value: z.string().min(1, '数值不能为空'),
})

export const profileSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  title: z.string().min(1, '职位不能为空'),
  bio: z.string().min(1, '简介不能为空'),
  avatar: z.string().optional(),
  email: z.email('请输入有效的邮箱'),
  location: z.string().optional(),
  socials: z.array(socialSchema),
  timeline: z.array(timelineSchema),
  stats: z.array(statSchema),
})

export const skillCategorySchema = z.enum([
  'frontend',
  'backend',
  'database',
  'devops',
  'design',
  'other',
])

export const skillSchema = z.object({
  name: z.string().min(1, '技能名称不能为空'),
  icon: z.string().min(1, '图标名不能为空'),
  category: skillCategorySchema,
  level: z.number().int().min(1).max(5).optional(),
  description: z.string().optional(),
})

export const projectSchema = z.object({
  slug: z.string().min(1, 'slug 不能为空'),
  title: z.string().min(1, '标题不能为空'),
  description: z.string().min(1, '描述不能为空'),
  cover: z.string().optional(),
  techStack: z.array(z.string().min(1, '技术栈不能为空')),
  category: z.string().optional(),
  featured: z.boolean(),
  year: z.string().optional(),
  role: z.string().optional(),
  links: z
    .object({
      github: z.url('请输入有效的 URL').optional(),
      demo: z.url('请输入有效的 URL').optional(),
    })
    .optional(),
  highlights: z.array(z.string().min(1)).optional(),
  content: z.string().optional(),
})

export const postSchema = z.object({
  slug: z.string().min(1, 'slug 不能为空'),
  title: z.string().min(1, '标题不能为空'),
  description: z.string().min(1, '摘要不能为空'),
  cover: z.string().optional(),
  publishedAt: z.string().min(1, '请选择发布日期'),
  updatedAt: z.string().optional(),
  tags: z.array(z.string().min(1, '标签不能为空')),
  draft: z.boolean(),
  readingMinutes: z.number().int().positive().optional(),
  content: z.string().optional(),
})

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1, '站点名称不能为空'),
  siteDescription: z.string(),
  author: z.string(),
  email: z.email('请输入有效的邮箱'),
  github: z.url('请输入有效的 URL').optional(),
  twitter: z.url('请输入有效的 URL').optional(),
  icp: z.string().optional(),
})

export const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})
