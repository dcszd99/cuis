import { read, remove, write } from './client'

const TOKEN_KEY = 'auth.token'

// 演示用账号。真实项目中账号密码应在服务端校验，绝不能硬编码在前端。
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

function generateToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `token-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function login(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // 只存 token，不存密码。
    write(TOKEN_KEY, generateToken())
    return true
  }
  return false
}

export function logout(): void {
  remove(TOKEN_KEY)
}

export function getToken(): string | null {
  return read<string | null>(TOKEN_KEY, null)
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}
