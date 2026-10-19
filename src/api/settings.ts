import { ensureSeeded, write } from './client'
import { defaultSettings } from './seed'
import type { SiteSettings } from '@/types'

const KEY = 'settings'

export function getSettings(): SiteSettings {
  return ensureSeeded(KEY, defaultSettings)
}

export function updateSettings(data: SiteSettings): SiteSettings {
  write(KEY, data)
  return data
}
