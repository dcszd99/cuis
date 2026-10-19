// 纯工具函数，供后台表单与数据层共用。

/** 将空字符串归一化为 undefined，用于可选字段提交前清洗。 */
export function emptyToUndefined(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/** 从标题生成 URL 友好的 slug；无法生成时退回随机后缀。 */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (slug === '') {
    return `item-${Math.random().toString(36).slice(2, 8)}`
  }
  return slug
}

/** 估算中文/英文混排的阅读时长（分钟）。 */
export function computeReadingMinutes(markdown: string): number {
  const zhChars = (markdown.match(/[\u4e00-\u9fff]/g) ?? []).length
  const enWords = (
    markdown.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []
  ).length
  return Math.max(1, Math.round(zhChars / 300 + enWords / 200))
}

/** 今日日期（YYYY-MM-DD）。 */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 将 zod 校验错误扁平化为 { path: message }，path 用 `.` 连接。 */
export function issuesToErrors(error: {
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>
}): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.map(String).join('.')
    if (!(key in result)) {
      result[key] = issue.message
    }
  }
  return result
}
