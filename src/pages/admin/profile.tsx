import { useState } from 'react'
import type { FormEvent } from 'react'

import { getProfile, updateProfile } from '@/api'
import { Button, Card, Field, Input, Textarea } from '@/components/admin/ui'
import { profileSchema } from '@/lib/schemas'
import { emptyToUndefined, issuesToErrors } from '@/lib/utils'
import type { Profile } from '@/types'

type Social = Profile['socials'][number]
type Timeline = Profile['timeline'][number]
type Stat = Profile['stats'][number]

function updateAt<T>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item))
}

export default function AdminProfile() {
  const [form, setForm] = useState<Profile>(() => getProfile())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setNotice(null)
  }

  function setSocial(index: number, patch: Partial<Social>) {
    setForm((f) => ({ ...f, socials: updateAt(f.socials, index, patch) }))
    setNotice(null)
  }
  function addSocial() {
    setForm((f) => ({ ...f, socials: [...f.socials, { label: '', url: '', icon: '' }] }))
    setNotice(null)
  }
  function removeSocial(index: number) {
    setForm((f) => ({ ...f, socials: f.socials.filter((_, i) => i !== index) }))
    setNotice(null)
  }

  function setTimeline(index: number, patch: Partial<Timeline>) {
    setForm((f) => ({ ...f, timeline: updateAt(f.timeline, index, patch) }))
    setNotice(null)
  }
  function addTimeline() {
    setForm((f) => ({
      ...f,
      timeline: [...f.timeline, { period: '', title: '', org: '', description: '' }],
    }))
    setNotice(null)
  }
  function removeTimeline(index: number) {
    setForm((f) => ({ ...f, timeline: f.timeline.filter((_, i) => i !== index) }))
    setNotice(null)
  }

  function setStat(index: number, patch: Partial<Stat>) {
    setForm((f) => ({ ...f, stats: updateAt(f.stats, index, patch) }))
    setNotice(null)
  }
  function addStat() {
    setForm((f) => ({ ...f, stats: [...f.stats, { label: '', value: '' }] }))
    setNotice(null)
  }
  function removeStat(index: number) {
    setForm((f) => ({ ...f, stats: f.stats.filter((_, i) => i !== index) }))
    setNotice(null)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const data: Profile = {
      ...form,
      avatar: emptyToUndefined(form.avatar ?? ''),
      location: emptyToUndefined(form.location ?? ''),
      socials: form.socials.map((s) => ({
        label: s.label.trim(),
        url: s.url.trim(),
        icon: s.icon.trim(),
      })),
      timeline: form.timeline.map((t) => ({
        period: t.period.trim(),
        title: t.title.trim(),
        org: emptyToUndefined(t.org ?? ''),
        description: emptyToUndefined(t.description ?? ''),
      })),
      stats: form.stats.map((s) => ({ label: s.label.trim(), value: s.value.trim() })),
    }

    const parsed = profileSchema.safeParse(data)
    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.error))
      setNotice(null)
      return
    }

    updateProfile(parsed.data)
    setErrors({})
    setNotice('已保存')
  }

  const scalarKeys = ['name', 'title', 'bio', 'email']
  const arrayErrors = Object.entries(errors).filter(([key]) => !scalarKeys.includes(key))

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">个人信息</h1>
          <p className="mt-1 text-sm text-text-secondary">编辑个人介绍、经历与统计数据</p>
        </div>
        <div className="flex items-center gap-3">
          {notice && <span className="text-sm text-green-400">{notice}</span>}
          <Button type="submit">保存</Button>
        </div>
      </div>

      {arrayErrors.length > 0 && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
          <p className="font-medium">请修正以下问题：</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {arrayErrors.map(([key, message]) => (
              <li key={key}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">基本信息</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="姓名" error={errors.name} required>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="职位" error={errors.title} required>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="邮箱" error={errors.email} required>
            <Input value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="所在地">
            <Input value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="头像地址">
              <Input
                value={form.avatar ?? ''}
                onChange={(e) => set('avatar', e.target.value)}
                placeholder="/avatar.png"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="个人简介" error={errors.bio} required>
              <Textarea rows={4} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">社交链接</h2>
          <Button type="button" variant="secondary" onClick={addSocial}>
            添加
          </Button>
        </div>
        {form.socials.length === 0 ? (
          <p className="text-sm text-text-secondary">暂无社交链接</p>
        ) : (
          <ul className="space-y-3">
            {form.socials.map((s, i) => (
              <li key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_1fr_auto]">
                <Input
                  value={s.label}
                  onChange={(e) => setSocial(i, { label: e.target.value })}
                  placeholder="标签（如 GitHub）"
                />
                <Input
                  value={s.url}
                  onChange={(e) => setSocial(i, { url: e.target.value })}
                  placeholder="https://…"
                />
                <Input
                  value={s.icon}
                  onChange={(e) => setSocial(i, { icon: e.target.value })}
                  placeholder="图标名"
                />
                <Button type="button" variant="danger" onClick={() => removeSocial(i)}>
                  删除
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">工作经历</h2>
          <Button type="button" variant="secondary" onClick={addTimeline}>
            添加
          </Button>
        </div>
        {form.timeline.length === 0 ? (
          <p className="text-sm text-text-secondary">暂无经历</p>
        ) : (
          <ul className="space-y-3">
            {form.timeline.map((t, i) => (
              <li key={i} className="space-y-2 rounded-lg border border-border p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={t.period}
                    onChange={(e) => setTimeline(i, { period: e.target.value })}
                    placeholder="时间段（如 2023 - 至今）"
                  />
                  <Input
                    value={t.title}
                    onChange={(e) => setTimeline(i, { title: e.target.value })}
                    placeholder="职位"
                  />
                </div>
                <Input
                  value={t.org ?? ''}
                  onChange={(e) => setTimeline(i, { org: e.target.value })}
                  placeholder="公司 / 组织"
                />
                <Textarea
                  rows={2}
                  value={t.description ?? ''}
                  onChange={(e) => setTimeline(i, { description: e.target.value })}
                  placeholder="描述"
                />
                <Button type="button" variant="danger" onClick={() => removeTimeline(i)}>
                  删除
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">统计数字</h2>
          <Button type="button" variant="secondary" onClick={addStat}>
            添加
          </Button>
        </div>
        {form.stats.length === 0 ? (
          <p className="text-sm text-text-secondary">暂无统计</p>
        ) : (
          <ul className="space-y-3">
            {form.stats.map((s, i) => (
              <li key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  value={s.label}
                  onChange={(e) => setStat(i, { label: e.target.value })}
                  placeholder="标签（如 工作经验）"
                />
                <Input
                  value={s.value}
                  onChange={(e) => setStat(i, { value: e.target.value })}
                  placeholder="数值（如 5 年）"
                />
                <Button type="button" variant="danger" onClick={() => removeStat(i)}>
                  删除
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </form>
  )
}
