import { useState } from 'react'
import type { FormEvent } from 'react'

import { getSettings, updateSettings } from '@/api'
import { Button, Card, Field, Input, Textarea } from '@/components/admin/ui'
import { siteSettingsSchema } from '@/lib/schemas'
import { emptyToUndefined, issuesToErrors } from '@/lib/utils'
import type { SiteSettings } from '@/types'

export default function AdminSettings() {
  const [form, setForm] = useState<SiteSettings>(() => getSettings())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setNotice(null)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const data: SiteSettings = {
      ...form,
      siteName: form.siteName.trim(),
      siteDescription: form.siteDescription.trim(),
      author: form.author.trim(),
      github: emptyToUndefined(form.github ?? ''),
      twitter: emptyToUndefined(form.twitter ?? ''),
      icp: emptyToUndefined(form.icp ?? ''),
    }

    const parsed = siteSettingsSchema.safeParse(data)
    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.error))
      setNotice(null)
      return
    }

    updateSettings(parsed.data)
    setErrors({})
    setNotice('已保存')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">站点设置</h1>
          <p className="mt-1 text-sm text-text-secondary">配置站点基本信息与链接</p>
        </div>
        <div className="flex items-center gap-3">
          {notice && <span className="text-sm text-green-400">{notice}</span>}
          <Button type="submit">保存</Button>
        </div>
      </div>

      <Card className="mt-6 max-w-2xl">
        <div className="space-y-4">
          <Field label="站点名称" error={errors.siteName} required>
            <Input value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
          </Field>
          <Field label="站点描述" error={errors.siteDescription}>
            <Textarea
              rows={2}
              value={form.siteDescription}
              onChange={(e) => set('siteDescription', e.target.value)}
            />
          </Field>
          <Field label="作者" error={errors.author}>
            <Input value={form.author} onChange={(e) => set('author', e.target.value)} />
          </Field>
          <Field label="邮箱" error={errors.email} required>
            <Input value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="GitHub" error={errors.github}>
            <Input
              value={form.github ?? ''}
              onChange={(e) => set('github', e.target.value)}
              placeholder="https://github.com/…"
            />
          </Field>
          <Field label="Twitter / X" error={errors.twitter}>
            <Input
              value={form.twitter ?? ''}
              onChange={(e) => set('twitter', e.target.value)}
              placeholder="https://x.com/…"
            />
          </Field>
          <Field label="备案号" error={errors.icp}>
            <Input value={form.icp ?? ''} onChange={(e) => set('icp', e.target.value)} />
          </Field>
        </div>
      </Card>
    </form>
  )
}
