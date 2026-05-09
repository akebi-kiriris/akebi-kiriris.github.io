import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdownLanguage from 'highlight.js/lib/languages/markdown'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import MarkdownIt from 'markdown-it'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdownLanguage)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('vue', xml)

export function parseMarkdownFile(raw, fallbackSlug) {
  const { frontmatter, body } = splitFrontmatter(raw)

  return {
    slug: frontmatter.slug || fallbackSlug,
    title: frontmatter.title || fallbackSlug,
    date: frontmatter.date || '',
    summary: frontmatter.summary || '',
    tags: parseList(frontmatter.tags),
    body,
    html: renderMarkdown(body),
  }
}

export function renderMarkdown(source) {
  return markdown.render(source)
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

markdown.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  const { language, filename } = parseCodeInfo(token.info)
  const highlighted = language && hljs.getLanguage(language)
    ? hljs.highlight(token.content, { language }).value
    : markdown.utils.escapeHtml(token.content)

  const filenameLabel = filename ? `<span class="code-filename">${markdown.utils.escapeHtml(filename)}</span>` : ''
  const languageLabel = `<span class="code-language">${language || 'text'}</span>`

  return `<div class="code-block"><div class="code-block-header"><div class="code-block-meta">${languageLabel}${filenameLabel}</div><button type="button" class="code-copy-button">Copy</button></div><pre class="hljs" data-language="${language || 'text'}"><code>${highlighted}</code></pre></div>`
}

function parseCodeInfo(info = '') {
  if (!info.trim()) {
    return { language: '', filename: '' }
  }

  const [rawLanguage, ...metaTokens] = info.split(/\s+/)
  const language = rawLanguage.trim().toLowerCase()
  const filenameToken = metaTokens.find((token) => token.startsWith('file=') || token.startsWith('title='))
  const filename = filenameToken ? filenameToken.split('=').slice(1).join('=') : ''

  return {
    language,
    filename: filename.replace(/^["']|["']$/g, ''),
  }
}

function splitFrontmatter(raw) {
  if (!raw.startsWith('---')) {
    return { frontmatter: {}, body: raw }
  }

  const closing = raw.indexOf('\n---', 3)
  if (closing === -1) {
    return { frontmatter: {}, body: raw }
  }

  const frontmatterSource = raw.slice(3, closing).trim()
  const body = raw.slice(closing + 4).trim()

  return {
    frontmatter: parseFrontmatter(frontmatterSource),
    body,
  }
}

function parseFrontmatter(source) {
  return source.split('\n').reduce((data, line) => {
    const separator = line.indexOf(':')
    if (separator === -1) {
      return data
    }

    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    data[key] = value.replace(/^["']|["']$/g, '')
    return data
  }, {})
}

function parseList(value = '') {
  if (!value) {
    return []
  }

  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((item) => item.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
}
