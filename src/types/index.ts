export interface Profile {
  name: string
  title: string
  bio: string
  avatar?: string
  email: string
  location?: string
  socials: { label: string; url: string; icon: string }[]
  timeline: { period: string; title: string; org?: string; description?: string }[]
  stats: { label: string; value: string }[]
}

export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'design'
  | 'other'

export interface Skill {
  name: string
  icon: string
  category: SkillCategory
  level?: number // 熟练度 1-5，可选
  description?: string
}

export interface Project {
  slug: string
  title: string
  description: string
  cover?: string
  techStack: string[]
  category?: string
  featured: boolean
  year?: string
  role?: string
  links?: { github?: string; demo?: string }
  highlights?: string[]
  content?: string // Markdown 正文（后台编辑用）
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  cover?: string
  publishedAt: string
  updatedAt?: string
  tags: string[]
  draft: boolean
  readingMinutes?: number
  content?: string // Markdown 正文（后台编辑用）
}

export interface SiteSettings {
  siteName: string
  siteDescription: string
  author: string
  email: string
  github?: string
  twitter?: string
  icp?: string
}
