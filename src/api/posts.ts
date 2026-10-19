import { ensureSeeded, write } from './client'
import { seedPosts } from './seed'
import type { BlogPost } from '@/types'

const KEY = 'posts'

export function listPosts(): BlogPost[] {
  return ensureSeeded(KEY, seedPosts)
}

export function getPost(slug: string): BlogPost | undefined {
  return listPosts().find((p) => p.slug === slug)
}

export function createPost(data: BlogPost): BlogPost {
  write(KEY, [...listPosts(), data])
  return data
}

export function updatePost(slug: string, data: BlogPost): BlogPost | undefined {
  let updated: BlogPost | undefined
  const next = listPosts().map((p) => {
    if (p.slug === slug) {
      updated = data
      return data
    }
    return p
  })
  write(KEY, next)
  return updated
}

export function deletePost(slug: string): void {
  write(
    KEY,
    listPosts().filter((p) => p.slug !== slug),
  )
}
