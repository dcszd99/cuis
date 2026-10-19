import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { login } from '@/api'
import { Button, Field, Input } from '@/components/admin/ui'
import { loginSchema } from '@/lib/schemas'
import { issuesToErrors } from '@/lib/utils'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const parsed = loginSchema.safeParse({ username, password })
    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.error))
      setMessage(null)
      return
    }
    setErrors({})

    if (login(username, password)) {
      const state = location.state as { from?: { pathname?: string } } | null | undefined
      const from = state?.from?.pathname ?? '/admin'
      navigate(from, { replace: true })
    } else {
      setMessage('用户名或密码错误')
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-text-primary">后台登录</h1>
        <p className="mb-8 text-center text-sm text-text-secondary">登录以管理网站内容</p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-6">
          <Field label="用户名" error={errors.username} required>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="admin"
            />
          </Field>
          <Field label="密码" error={errors.password} required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </Field>

          {message && <p className="text-sm text-red-400">{message}</p>}

          <Button type="submit" className="w-full">
            登录
          </Button>
          <p className="text-center text-xs text-text-secondary">演示账号：admin / admin123</p>
        </form>
      </div>
    </div>
  )
}
