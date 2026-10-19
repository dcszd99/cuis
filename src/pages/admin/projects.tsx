import { useState } from 'react'

import { deleteProject, listProjects } from '@/api'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { Button, Card, LinkButton, PageHeader } from '@/components/admin/ui'

export default function AdminProjects() {
  const [projects, setProjects] = useState(() => listProjects())
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const target = projects.find((p) => p.slug === deleteTarget)

  function confirmDelete() {
    if (!deleteTarget) return
    deleteProject(deleteTarget)
    setProjects(listProjects())
    setDeleteTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="项目管理"
        description="管理你的项目"
        action={<LinkButton to="/admin/projects/new">新建项目</LinkButton>}
      />

      {projects.length === 0 ? (
        <Card className="text-center text-text-secondary">暂无项目，点击「新建项目」开始。</Card>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary">{project.title}</span>
                  {project.featured && (
                    <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs text-accent">精选</span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-text-secondary">{project.description}</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {project.techStack.join(' / ')}
                  {project.year && <> · {project.year}</>}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <LinkButton to={`/admin/projects/${project.slug}`} variant="secondary">
                  编辑
                </LinkButton>
                <Button variant="danger" onClick={() => setDeleteTarget(project.slug)}>
                  删除
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除项目"
        message={`确定要删除「${target?.title ?? ''}」吗？此操作不可撤销。`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
