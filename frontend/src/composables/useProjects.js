import { parseMarkdownFile } from '@/services/markdown'

const modules = import.meta.glob('../content/projects/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const projectFiles = Object.entries(modules)
  .map(([path, raw]) => {
    try {
      const normalized = String(path).replaceAll('\\', '/')
      const match = normalized.match(/projects\/(.+)\.md$/)
      const relative = match ? match[1] : ''
      const parts = relative.split('/').filter(Boolean)
      if (!parts.length) {
        return null
      }

      const projectSlug = parts[0]
      const docSlug = parts.length > 1 ? parts.slice(1).join('/') : 'about'
      const fallbackSlug = docSlug === 'about' ? projectSlug : docSlug
      const parsed = parseMarkdownFile(String(raw ?? ''), fallbackSlug)

      return {
        ...parsed,
        projectSlug,
        docSlug,
      }
    } catch {
      return null
    }
  })
  .filter(Boolean)

const projects = Object.entries(
  projectFiles.reduce((acc, file) => {
    if (!acc[file.projectSlug]) {
      acc[file.projectSlug] = []
    }
    acc[file.projectSlug].push(file)
    return acc
  }, {}),
)
  .map(([slug, files]) => {
    const sortedFiles = files.slice().sort((a, b) => b.date.localeCompare(a.date))
    const aboutFile = sortedFiles.find((file) => file.docSlug === 'about') || sortedFiles[0]
    const documents = sortedFiles
      .filter((file) => file.docSlug !== 'about')
      .map((file) => ({
        slug: file.docSlug,
        title: file.title,
        summary: file.summary,
        date: file.date,
        tags: file.tags,
        status: file.status,
        html: file.html,
        body: file.body,
      }))

    return {
      slug,
      title: aboutFile?.title || slug,
      summary: aboutFile?.summary || '',
      date: aboutFile?.date || '',
      status: aboutFile?.status || '',
      tags: aboutFile?.tags || [],
      aboutHtml: aboutFile?.html || '',
      aboutBody: aboutFile?.body || '',
      documents,
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))

export function useProjects() {
  function findProject(slug) {
    return projects.find((project) => project.slug === slug)
  }

  function findProjectDocument(projectSlug, docSlug) {
    const project = findProject(projectSlug)
    if (!project) {
      return null
    }

    return project.documents.find((doc) => doc.slug === docSlug) || null
  }

  function searchProjects(query) {
    const term = query.trim().toLowerCase()
    if (!term) {
      return projects
    }

    return projects.filter((project) => {
      const projectText = [project.title, project.summary, project.status, ...(project.tags || [])]
        .join(' ')
        .toLowerCase()
      const docsText = project.documents
        .map((doc) => [doc.title, doc.summary, doc.body, ...(doc.tags || [])].join(' '))
        .join(' ')
        .toLowerCase()

      return `${projectText} ${docsText}`.includes(term)
    })
  }

  return {
    projects,
    featuredProjects: projects.slice(0, 3),
    findProject,
    findProjectDocument,
    searchProjects,
  }
}
