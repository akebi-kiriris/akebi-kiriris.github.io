import Fuse from 'fuse.js'

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

const searchIndex = new Fuse(notes, {
  keys: ['title', 'summary', 'tags', 'body'],
  threshold: 0.35,
})

export function useNotes() {
  function findNote(slug) {
    return notes.find((note) => note.slug === slug)
  }

  function searchNotes(query) {
    if (!query.trim()) {
      return notes
    }

    return searchIndex.search(query).map((result) => result.item)
  }

  return {
    notes,
    tags: [...new Set(notes.flatMap((note) => note.tags))],
    findNote,
    searchNotes,
  }
}
