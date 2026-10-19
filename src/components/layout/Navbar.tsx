import { Link, NavLink } from 'react-router'

import { getSettings } from '@/api'

const navLinks = [
  { to: '/', label: '首页', end: true },
  { to: '/about', label: '关于', end: false },
  { to: '/skills', label: '技能', end: false },
]

export default function Navbar() {
  const siteName = getSettings().siteName

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="text-lg font-semibold text-text-primary">
          {siteName}
        </NavLink>
        <div className="flex items-center gap-6">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-sm text-accent'
                      : 'text-sm text-text-secondary transition-colors hover:text-text-primary'
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link
            to="/admin/login"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            登录后台
          </Link>
        </div>
      </nav>
    </header>
  )
}
