import { Marked } from 'marked'

const marked = new Marked({
  gfm: true,
  breaks: true,
})

export function renderMarkdown(content: string): string {
  if (!content) return ''
  const result = marked.parse(content)
  if (typeof result === 'string') return result
  return ''
}
