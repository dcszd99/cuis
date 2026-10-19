import { ensureSeeded, write } from './client'
import { seedSkills } from './seed'
import type { Skill } from '@/types'

const KEY = 'skills'

export function listSkills(): Skill[] {
  return ensureSeeded(KEY, seedSkills)
}

export function createSkill(skill: Skill): Skill[] {
  const next = [...listSkills(), skill]
  write(KEY, next)
  return next
}

export function updateSkill(name: string, data: Skill): Skill[] {
  const next = listSkills().map((s) => (s.name === name ? data : s))
  write(KEY, next)
  return next
}

export function deleteSkill(name: string): Skill[] {
  const next = listSkills().filter((s) => s.name !== name)
  write(KEY, next)
  return next
}
