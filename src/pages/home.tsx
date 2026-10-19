import { Link } from 'react-router'

export default function Home() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="bg-linear-to-r from-accent to-accent-2 bg-clip-text text-5xl font-bold text-transparent">
        个人展示网站
      </h1>
      <p className="max-w-xl text-text-secondary">
        展示个人介绍、技能、项目与博客的静态站点。深色主题 · 星空背景 · 多端适配。
      </p>
      <div className="flex gap-4">
        <Link
          to="/about"
          className="rounded-lg bg-accent px-6 py-2 text-white transition-opacity hover:opacity-90"
        >
          了解我
        </Link>
        <Link
          to="/skills"
          className="rounded-lg border border-border bg-surface px-6 py-2 text-accent transition-colors hover:border-accent"
        >
          查看技能
        </Link>
      </div>
    </section>
  )
}
