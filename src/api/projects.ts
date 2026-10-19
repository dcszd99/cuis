import { ensureSeeded, write } from './client'
import { seedProjects } from './seed'
import type { Project } from '@/types'

const KEY = 'projects'

export function listProjects(): Project[] {
  return ensureSeeded(KEY, seedProjects)
}

export function getProject(slug: string): Project | undefined {
  return listProjects().find((p) => p.slug === slug)
}

export function createProject(data: Project): Project {
  write(KEY, [...listProjects(), data])
  return data
}

export function updateProject(slug: string, data: Project): Project | undefined {
  let updated: Project | undefined
  const next = listProjects().map((p) => {
    if (p.slug === slug) {
      updated = data
      return data
    }
    return p
  })
  write(KEY, next)
  return updated
}

export function deleteProject(slug: string): void {
  write(
    KEY,
    listProjects().filter((p) => p.slug !== slug),
  )
}
