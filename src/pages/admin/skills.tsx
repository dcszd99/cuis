import { useState } from 'react'
import type { FormEvent } from 'react'

import { createSkill, deleteSkill, listSkills, updateSkill } from '@/api'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { Button, Card, Field, Input, PageHeader, Select, Textarea } from '@/components/admin/ui'
import { skillSchema } from '@/lib/schemas'
import { issuesToErrors } from '@/lib/utils'
import type { Skill, SkillCategory } from '@/types'

const categoryOptions: { value: SkillCategory; label: string }[] = [
  { value: 'frontend', label: '前端' },
  { value: 'backend', label: '后端' },
  { value: 'database', label: '数据库' },
  { value: 'devops', label: 'DevOps' },
  { value: 'design', label: '设计' },
  { value: 'other', label: '其他' },
]

function categoryLabel(c: SkillCategory): string {
  return categoryOptions.find((o) => o.value === c)?.label ?? c
}

function emptySkill(): Skill {
  return { name: '', icon: 'code', category: 'frontend', level: 3, description: '' }
}

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>(() => listSkills())
  const [editingName, setEditingName] = useState<string | null>(null)
  const [draft, setDraft] = useState<Skill>(emptySkill())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function startNew() {
    setEditingName(null)
    setDraft(emptySkill())
    setErrors({})
    setNotice(null)
  }

  function startEdit(skill: Skill) {
    setEditingName(skill.name)
    setDraft({ ...skill, description: skill.description ?? '' })
    setErrors({})
    setNotice(null)
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()

    const data: Skill = {
      ...draft,
      name: draft.name.trim(),
      icon: draft.icon.trim() || 'code',
      description: draft.description?.trim() === '' ? undefined : draft.description?.trim(),
    }

    const parsed = skillSchema.safeParse(data)
    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.error))
      setNotice(null)
      return
    }

    if (editingName === null) {
      if (skills.some((s) => s.name === parsed.data.name)) {
        setErrors({ name: '技能名称已存在' })
        return
      }
      setSkills(createSkill(parsed.data))
    } else {
      setSkills(updateSkill(editingName, parsed.data))
    }

    setErrors({})
    setNotice('已保存')
    startNew()
  }

  function confirmDelete() {
    if (deleteTarget === null) return
    setSkills(deleteSkill(deleteTarget))
    setDeleteTarget(null)
    setNotice('已删除')
  }

  return (
    <div>
      <PageHeader
        title="技能管理"
        description="管理你的技能与熟练度"
        action={<Button onClick={startNew}>新增技能</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-3">
          {skills.length === 0 ? (
            <Card className="text-center text-text-secondary">暂无技能，点击「新增技能」开始。</Card>
          ) : (
            skills.map((skill) => (
              <li
                key={skill.name}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">{skill.name}</span>
                    <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs text-accent">
                      {categoryLabel(skill.category)}
                    </span>
                  </div>
                  {skill.description && (
                    <p className="mt-1 truncate text-sm text-text-secondary">{skill.description}</p>
                  )}
                  {skill.level !== undefined && (
                    <p className="mt-1 text-xs text-text-secondary">熟练度 {skill.level}/5</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" onClick={() => startEdit(skill)}>
                    编辑
                  </Button>
                  <Button variant="danger" onClick={() => setDeleteTarget(skill.name)}>
                    删除
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>

        <Card className="h-fit">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {editingName === null ? '新增技能' : `编辑：${editingName}`}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="名称" error={errors.name} required>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="图标名" error={errors.icon}>
              <Input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} />
            </Field>
            <Field label="分类" required>
              <Select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as SkillCategory })}
              >
                {categoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="熟练度">
              <Select
                value={draft.level ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    level: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              >
                <option value="">不设置</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="描述">
              <Textarea
                rows={3}
                value={draft.description ?? ''}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
            {notice && <p className="text-sm text-green-400">{notice}</p>}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                保存
              </Button>
              {editingName !== null && (
                <Button type="button" variant="secondary" onClick={startNew}>
                  取消
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除技能"
        message={`确定要删除「${deleteTarget ?? ''}」吗？`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
