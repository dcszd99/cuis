import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { createPost, getPost, updatePost } from '@/api'
import MarkdownEditor from '@/components/admin/MarkdownEditor'
import TagInput from '@/components/admin/TagInput'
import { Button, Card, Checkbox, Field, Input, LinkButton, Textarea } from '@/components/admin/ui'
import { postSchema } from '@/lib/schemas'
import { computeReadingMinutes, emptyToUndefined, issuesToErrors, slugify, todayISO } from '@/lib/utils'
import type { BlogPost } from '@/types'

function emptyPost(): BlogPost {
  return {
    slug: '',
    title: '',
    description: '',
    cover: '',
    publishedAt: todayISO(),
    tags: [],
    draft: false,
    content: '',
  }
}

export default function AdminPostEdit() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isNew = slug === undefined
  const existing = isNew ? undefined : getPost(slug)

  const [form, setForm] = useState<BlogPost>(() =>
    existing ? { ...existing, content: existing.content ?? '' } : emptyPost(),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)

  if (!isNew && !existing) {
    return (
      <div className="text-text-secondary">
        <p>未找到该文章。</p>
        <LinkButton to="/admin/posts" className="mt-4">
          返回列表
        </LinkButton>
      </div>
    )
  }

  function set<K extends keyof BlogPost>(key: K, value: BlogPost[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setNotice(null)
  }

  function handleTitleBlur() {
    if (isNew && form.slug.trim() === '' && form.title.trim() !== '') {
      setForm((f) => ({ ...f, slug: slugify(f.title) }))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const data: BlogPost = {
      ...form,
      slug: form.slug.trim(),
      cover: emptyToUndefined(form.cover ?? ''),
      updatedAt: emptyToUndefined(form.updatedAt ?? ''),
      tags: form.tags.map((t) => t.trim()).filter(Boolean),
      readingMinutes: computeReadingMinutes(form.content ?? ''),
    }

    const parsed = postSchema.safeParse(data)
    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.error))
      setNotice(null)
      return
    }

    if (isNew) {
      if (getPost(parsed.data.slug)) {
        setErrors({ slug: 'slug 已存在，请换一个' })
        return
      }
      createPost(parsed.data)
    } else {
      updatePost(slug, parsed.data)
    }

    setErrors({})
    setNotice('已保存')
    if (isNew) {
      navigate(`/admin/posts/${parsed.data.slug}`, { replace: true })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{isNew ? '新建文章' : '编辑文章'}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            <Link to="/admin/posts" className="text-accent hover:underline">
              返回列表
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {notice && <span className="text-sm text-green-400">{notice}</span>}
          <Button type="submit">保存</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <Field label="标题" error={errors.title} required>
                <Input
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  onBlur={handleTitleBlur}
                />
              </Field>
              <Field label="Slug" error={errors.slug} required>
                <Input
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  disabled={!isNew}
                  placeholder="用于 URL 的唯一标识"
                />
              </Field>
              <Field label="摘要" error={errors.description} required>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </Field>
              <Field label="封面地址">
                <Input
                  value={form.cover ?? ''}
                  onChange={(e) => set('cover', e.target.value)}
                  placeholder="/images/…"
                />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">正文（Markdown）</h2>
            <MarkdownEditor value={form.content ?? ''} onChange={(v) => set('content', v)} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">发布设置</h2>
            <div className="space-y-4">
              <Field label="标签">
                <TagInput value={form.tags} onChange={(v) => set('tags', v)} placeholder="React" />
              </Field>
              <Field label="发布日期" error={errors.publishedAt} required>
                <Input
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) => set('publishedAt', e.target.value)}
                />
              </Field>
              <Field label="更新日期">
                <Input
                  type="date"
                  value={form.updatedAt ?? ''}
                  onChange={(e) => set('updatedAt', e.target.value)}
                />
              </Field>
              <Checkbox label="草稿" checked={form.draft} onChange={(v) => set('draft', v)} />
              {form.content && (
                <p className="text-xs text-text-secondary">
                  预计阅读时长约 {computeReadingMinutes(form.content)} 分钟
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}
