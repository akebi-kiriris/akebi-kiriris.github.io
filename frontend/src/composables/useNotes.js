import { parseMarkdownFile } from '@/services/markdown'

const modules = import.meta.glob('../content/notes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const notes = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.split('/').pop().replace('.md', '')
    return parseMarkdownFile(raw, slug)
  })
  .sort((a, b) => b.date.localeCompare(a.date))

export function useNotes() {
  function findNote(slug) {
    return notes.find((note) => note.slug === slug)
  }

  function searchNotes(query) {
    const term = query.trim().toLowerCase()
    if (!term) {
      return notes
    }

    return notes.filter((note) => {
      const haystack = [
        note.title,
        note.summary,
        note.body,
        ...(note.tags || []),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }

  return {
    notes,
    tags: [...new Set(notes.flatMap((note) => note.tags))],
    findNote,
    searchNotes,
  }
}
