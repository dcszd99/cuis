import { ensureSeeded, write } from './client'
import { seedProfile } from './seed'
import type { Profile } from '@/types'

const KEY = 'profile'

export function getProfile(): Profile {
  return ensureSeeded(KEY, seedProfile)
}

export function updateProfile(data: Profile): Profile {
  write(KEY, data)
  return data
}
