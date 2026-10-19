import { useState } from 'react'

import { deletePost, listPosts } from '@/api'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { Button, Card, LinkButton, PageHeader } from '@/components/admin/ui'

export default function AdminPosts() {
  const [posts, setPosts] = useState(() => listPosts())
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const target = posts.find((p) => p.slug === deleteTarget)

  function confirmDelete() {
    if (!deleteTarget) return
    deletePost(deleteTarget)
    setPosts(listPosts())
    setDeleteTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="博客管理"
        description="管理你的文章"
        action={<LinkButton to="/admin/posts/new">新建文章</LinkButton>}
      />

      {posts.length === 0 ? (
        <Card className="text-center text-text-secondary">暂无文章，点击「新建文章」开始。</Card>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-text-primary">{post.title}</span>
                  {post.draft ? (
                    <span className="shrink-0 rounded-md bg-text-secondary/20 px-2 py-0.5 text-xs text-text-secondary">
                      草稿
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
                      已发布
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-text-secondary">{post.description}</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {post.publishedAt}
                  {post.tags.length > 0 && <> · {post.tags.join(' / ')}</>}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <LinkButton to={`/admin/posts/${post.slug}`} variant="secondary">
                  编辑
                </LinkButton>
                <Button variant="danger" onClick={() => setDeleteTarget(post.slug)}>
                  删除
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除文章"
        message={`确定要删除「${target?.title ?? ''}」吗？此操作不可撤销。`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
