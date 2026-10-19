import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'

import { logout } from '@/api'

const navItems = [
  { to: '/admin', label: '仪表盘', end: true },
  { to: '/admin/profile', label: '个人信息', end: false },
  { to: '/admin/skills', label: '技能管理', end: false },
  { to: '/admin/projects', label: '项目管理', end: false },
  { to: '/admin/posts', label: '博客管理', end: false },
  { to: '/admin/settings', label: '站点设置', end: false },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh bg-background text-text-primary">
      {/* 侧边栏 */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-lg font-semibold text-text-primary">后台管理</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* 移动端遮罩 */}
      {open && (
        <button
          type="button"
          aria-label="关闭菜单"
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 主区域 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-border px-2 py-1 text-text-secondary lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="打开菜单"
            >
              ☰
            </button>
            <span className="text-sm text-text-secondary">内容管理系统</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-text-secondary transition-colors hover:text-accent">
              查看前台
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-red-400 hover:text-red-400"
            >
              退出登录
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
