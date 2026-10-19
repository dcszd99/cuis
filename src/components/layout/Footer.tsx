import { getSettings } from '@/api'

const currentYear = new Date().getFullYear()

export default function Footer() {
  const siteName = getSettings().siteName

  return (
    <footer className="border-t border-border/60 py-6 text-center text-sm text-text-secondary">
      <p>© {currentYear} {siteName} · 保留所有权利</p>
    </footer>
  )
}
