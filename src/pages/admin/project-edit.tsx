import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { createProject, getProject, updateProject } from '@/api'
import MarkdownEditor from '@/components/admin/MarkdownEditor'
import TagInput from '@/components/admin/TagInput'
import { Button, Card, Checkbox, Field, Input, LinkButton, Textarea } from '@/components/admin/ui'
import { projectSchema } from '@/lib/schemas'
import { emptyToUndefined, issuesToErrors, slugify } from '@/lib/utils'
import type { Project } from '@/types'

function emptyProject(): Project {
  return {
    slug: '',
    title: '',
    description: '',
    cover: '',
    techStack: [],
    category: '',
    featured: false,
    year: '',
    role: '',
    links: { github: '', demo: '' },
    highlights: [],
    content: '',
  }
}

export default function AdminProjectEdit() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isNew = slug === undefined
  const existing = isNew ? undefined : getProject(slug)

  const [form, setForm] = useState<Project>(() =>
    existing
      ? {
          ...existing,
          links: { github: existing.links?.github ?? '', demo: existing.links?.demo ?? '' },
          content: existing.content ?? '',
        }
      : emptyProject(),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)

  if (!isNew && !existing) {
    return (
      <div className="text-text-secondary">
        <p>未找到该项目。</p>
        <LinkButton to="/admin/projects" className="mt-4">
          返回列表
        </LinkButton>
      </div>
    )
  }

  function set<K extends keyof Project>(key: K, value: Project[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setNotice(null)
  }

  function setLink(key: 'github' | 'demo', value: string) {
    setForm((f) => ({ ...f, links: { ...(f.links ?? { github: '', demo: '' }), [key]: value } }))
    setNotice(null)
  }

  function handleTitleBlur() {
    if (isNew && form.slug.trim() === '' && form.title.trim() !== '') {
      setForm((f) => ({ ...f, slug: slugify(f.title) }))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const github = emptyToUndefined(form.links?.github ?? '')
    const demo = emptyToUndefined(form.links?.demo ?? '')
    const data: Project = {
      ...form,
      slug: form.slug.trim(),
      cover: emptyToUndefined(form.cover ?? ''),
      category: emptyToUndefined(form.category ?? ''),
      year: emptyToUndefined(form.year ?? ''),
      role: emptyToUndefined(form.role ?? ''),
      techStack: form.techStack.map((t) => t.trim()).filter(Boolean),
      highlights: (form.highlights ?? []).map((h) => h.trim()).filter(Boolean),
      links: github || demo ? { github, demo } : undefined,
    }

    const parsed = projectSchema.safeParse(data)
    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.error))
      setNotice(null)
      return
    }

    if (isNew) {
      if (getProject(parsed.data.slug)) {
        setErrors({ slug: 'slug 已存在，请换一个' })
        return
      }
      createProject(parsed.data)
    } else {
      updateProject(slug, parsed.data)
    }

    setErrors({})
    setNotice('已保存')
    if (isNew) {
      navigate(`/admin/projects/${parsed.data.slug}`, { replace: true })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{isNew ? '新建项目' : '编辑项目'}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            <Link to="/admin/projects" className="text-accent hover:underline">
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
              <Field label="描述" error={errors.description} required>
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
            <h2 className="mb-4 text-lg font-semibold text-text-primary">属性</h2>
            <div className="space-y-4">
              <Field label="技术栈">
                <TagInput value={form.techStack} onChange={(v) => set('techStack', v)} placeholder="React" />
              </Field>
              <Field label="分类">
                <Input value={form.category ?? ''} onChange={(e) => set('category', e.target.value)} />
              </Field>
              <Field label="年份">
                <Input value={form.year ?? ''} onChange={(e) => set('year', e.target.value)} placeholder="2026" />
              </Field>
              <Field label="角色">
                <Input
                  value={form.role ?? ''}
                  onChange={(e) => set('role', e.target.value)}
                  placeholder="独立开发"
                />
              </Field>
              <Field label="GitHub 链接" error={errors['links.github']}>
                <Input
                  value={form.links?.github ?? ''}
                  onChange={(e) => setLink('github', e.target.value)}
                  placeholder="https://github.com/…"
                />
              </Field>
              <Field label="演示链接" error={errors['links.demo']}>
                <Input
                  value={form.links?.demo ?? ''}
                  onChange={(e) => setLink('demo', e.target.value)}
                  placeholder="https://demo.example.com"
                />
              </Field>
              <Field label="亮点">
                <TagInput
                  value={form.highlights ?? []}
                  onChange={(v) => set('highlights', v)}
                  placeholder="成果数据"
                />
              </Field>
              <Checkbox label="精选项目" checked={form.featured} onChange={(v) => set('featured', v)} />
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}
