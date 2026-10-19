import { Link } from 'react-router'

import { listPosts, listProjects, listSkills } from '@/api'
import { Card, PageHeader } from '@/components/admin/ui'

export default function AdminDashboard() {
  const projects = listProjects()
  const posts = listPosts()
  const skills = listSkills()
  const drafts = posts.filter((p) => p.draft).length

  const stats = [
    { label: '项目', value: projects.length, to: '/admin/projects' },
    { label: '博客文章', value: posts.length, to: '/admin/posts' },
    { label: '草稿', value: drafts, to: '/admin/posts' },
    { label: '技能', value: skills.length, to: '/admin/skills' },
  ]

  return (
    <div>
      <PageHeader title="仪表盘" description="内容统计概览" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to}>
            <Card className="transition-colors hover:border-accent">
              <div className="text-3xl font-bold text-accent">{stat.value}</div>
              <div className="mt-1 text-sm text-text-secondary">{stat.label}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
