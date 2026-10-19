import { getProfile, listPosts, listProjects, listSkills } from '@/api'
import type { BlogPost, Project, Skill } from '@/types'

// 统一数据入口：前台页面一律经此读取，数据底层由 src/api/（localStorage 模拟）提供，
// 后续切换真实后端时无需改动页面代码。
export { getProfile }

export function getSkills(): Skill[] {
  return listSkills()
}

export function getProjects(): Project[] {
  return listProjects()
}

export function getBlogPosts(): BlogPost[] {
  return listPosts().filter((post) => !post.draft)
}
