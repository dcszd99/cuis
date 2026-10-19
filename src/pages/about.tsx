import { getProfile } from '@/lib/content'

export default function About() {
  const profile = getProfile()

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold text-text-primary">{profile.name}</h1>
      <p className="mb-6 text-lg text-accent">{profile.title}</p>
      <p className="mb-8 whitespace-pre-line text-text-secondary">{profile.bio}</p>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {profile.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-surface p-4 text-center"
          >
            <div className="text-2xl font-bold text-accent">{stat.value}</div>
            <div className="mt-1 text-sm text-text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-xl font-semibold text-text-primary">经历</h2>
      <ol className="space-y-4">
        {profile.timeline.map((item) => (
          <li
            key={`${item.period}-${item.title}`}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="text-sm text-text-secondary">{item.period}</div>
            <div className="mt-1 font-medium text-text-primary">{item.title}</div>
            {item.org && (
              <div className="mt-1 text-sm text-text-secondary">{item.org}</div>
            )}
            {item.description && (
              <p className="mt-2 text-sm text-text-secondary">{item.description}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
