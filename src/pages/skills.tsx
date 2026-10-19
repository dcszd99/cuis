import { getSkills } from '@/lib/content'
import type { SkillCategory } from '@/types'

const categories: SkillCategory[] = [
  'frontend',
  'backend',
  'database',
  'devops',
  'design',
  'other',
]

const labels: Record<SkillCategory, string> = {
  frontend: '前端',
  backend: '后端',
  database: '数据库',
  devops: 'DevOps',
  design: '设计',
  other: '其他',
}

function levelStars(level: number): string {
  return '★'.repeat(level) + '☆'.repeat(5 - level)
}

export default function Skills() {
  const skills = getSkills()

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold text-text-primary">技能</h1>
      {categories.map((category) => {
        const list = skills.filter((skill) => skill.category === category)
        if (list.length === 0) return null

        return (
          <div key={category} className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">
              {labels[category]}
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {list.map((skill) => (
                <li
                  key={skill.name}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <span className="text-text-primary">{skill.name}</span>
                  {skill.level !== undefined && (
                    <span
                      className="text-xs text-accent"
                      aria-label={`熟练度 ${skill.level}/5`}
                    >
                      {levelStars(skill.level)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
