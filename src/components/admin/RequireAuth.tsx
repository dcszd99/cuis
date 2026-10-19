import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { isAuthenticated } from '@/api'

// 路由守卫：未登录访问受保护路由时重定向到登录页，并记录来源以便登录后跳回。
export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
