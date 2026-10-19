import { useState } from 'react'

export default function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')

  function addTag() {
    const tag = draft.trim()
    if (tag === '') return
    if (!value.includes(tag)) {
      onChange([...value, tag])
    }
    setDraft('')
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      {value.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-xs text-accent"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="text-accent/70 hover:text-accent"
            aria-label={`移除标签 ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag()
          }
        }}
        onBlur={addTag}
        className="min-w-[120px] flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary/60"
        placeholder={placeholder ?? '输入后回车添加'}
      />
    </div>
  )
}
