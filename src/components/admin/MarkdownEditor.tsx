import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Mode = 'edit' | 'preview' | 'split'

const modes: { id: Mode; label: string }[] = [
  { id: 'edit', label: '编辑' },
  { id: 'preview', label: '预览' },
  { id: 'split', label: '分屏' },
]

export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [mode, setMode] = useState<Mode>('edit')

  const showEditor = mode === 'edit' || mode === 'split'
  const showPreview = mode === 'preview' || mode === 'split'

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              mode === m.id ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className={mode === 'split' ? 'grid grid-cols-2' : ''}>
        {showEditor && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[320px] w-full resize-y bg-transparent p-4 font-mono text-sm text-text-primary outline-none"
            placeholder="在此输入 Markdown 内容…"
            aria-label="Markdown 编辑器"
          />
        )}
        {showPreview && (
          <div
            className={`prose prose-invert max-w-none p-4 ${showEditor ? 'border-l border-border' : ''}`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*暂无内容*'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
