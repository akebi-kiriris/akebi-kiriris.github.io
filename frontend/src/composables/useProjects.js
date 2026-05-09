const projects = [
  {
    slug: 'personal-website',
    title: 'Kiriris 個人網站',
    summary: '以 Vue 與 Markdown 建立的作品展示與學習筆記空間，持續記錄設計與開發過程。',
    status: 'v0 建置中',
    tags: ['Vue', 'Markdown', '作品集'],
    links: [
      {
        label: 'GitHub',
        href: 'https://github.com/akebi-kiriris/personal-website',
      },
    ],
  },
]

export function useProjects() {
  return {
    projects,
    featuredProjects: projects.slice(0, 3),
  }
}
