<script setup>
import { computed } from 'vue'

import NoteCard from '@/components/notes/NoteCard.vue'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import { useNotes } from '@/composables/useNotes'
import { useProjects } from '@/composables/useProjects'

const GITHUB_USERNAME = 'akebi-kiriris'
const { notes } = useNotes()
const { featuredProjects, projects } = useProjects()

const nowItems = [
  {
    title: '整理自己的開發路線',
    body: '把 PrAjeKt、個人網站與學習筆記整理成可以回看的作品脈絡。',
  },
  {
    title: '偏好先做可看的版本',
    body: '功能先落到畫面上，再慢慢修互動、閱讀體驗與資料結構。',
  },
  {
    title: '目前關注',
    body: 'Vue、前端作品集、AI 工具整合、後端分層，以及能說清楚決策的文件。',
  },
]

const latestUpdatedDate = computed(() => {
  const noteDates = notes.map((note) => note.date).filter(Boolean)
  const projectDates = projects
    .flatMap((project) => [project.date, ...project.documents.map((doc) => doc.date)])
    .filter(Boolean)

  const allDates = [...noteDates, ...projectDates]
  if (!allDates.length) {
    return '尚未標註'
  }

  return allDates.sort().at(-1)
})

const learningProjectNoteCount = computed(() => {
  const learningProject = projects.find((project) => project.slug === '學習筆記')
  return learningProject?.documents?.length || 0
})
const totalNoteCount = computed(() => notes.length + learningProjectNoteCount.value)
const siteStats = computed(() => [
  { label: 'Projects', value: projects.length },
  { label: 'Notes', value: totalNoteCount.value },
  { label: 'Updated', value: latestUpdatedDate.value },
])

const latestNotes = computed(() => notes.slice(0, 3))
</script>

<template>
  <main class="content-shell py-8 md:py-12">
    <section class="home-hero">
      <div class="grid content-between gap-8">
        <div>
          <h1 class="max-w-[11ch] font-display text-6xl leading-[0.98] text-ink md:text-8xl">
            Kiriris
          </h1>
          <p class="mt-4 text-lg font-semibold text-moss">@{{ GITHUB_USERNAME }}</p>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-muted md:text-xl">
            我把正在做的專案、踩過的坑、學到的技術和想保留下來的判斷，整理成一個可以慢慢長大的個人網站。
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <RouterLink
            class="inline-flex min-h-11 items-center rounded-sm bg-moss px-4 text-sm font-semibold text-paper no-underline transition hover:-translate-y-0.5"
            to="/projects"
          >
            看專案
          </RouterLink>
          <RouterLink
            class="inline-flex min-h-11 items-center rounded-sm border border-line bg-[color-mix(in_srgb,var(--paper)_84%,white_16%)] px-4 text-sm font-semibold text-ink no-underline transition hover:-translate-y-0.5"
            to="/notes"
          >
            讀筆記
          </RouterLink>
          <a
            class="inline-flex min-h-11 items-center rounded-sm px-4 text-sm font-semibold text-clay no-underline transition hover:-translate-y-0.5 hover:bg-paper-soft"
            :href="`https://github.com/${GITHUB_USERNAME}`"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>

      <aside class="home-status-panel" aria-label="網站狀態">
        <div class="grid gap-3">
          <div v-for="stat in siteStats" :key="stat.label" class="home-stat-row">
            <span>{{ stat.label }}</span>
            <strong>{{ stat.value }}</strong>
          </div>
        </div>
        <div class="mt-6 border-t border-line pt-5">
          <p class="text-sm font-semibold text-ink">Current focus</p>
          <p class="mt-2 text-sm leading-6 text-muted">
            先把首頁維持成乾淨的個人入口，再慢慢補真正有用、適合留下的模組。
          </p>
        </div>
      </aside>
    </section>

    <section class="mt-10 grid gap-4 md:grid-cols-3">
      <article v-for="item in nowItems" :key="item.title" class="home-now-card">
        <h2 class="font-display text-2xl leading-tight text-ink">{{ item.title }}</h2>
        <p class="mt-3 text-sm leading-7 text-muted">{{ item.body }}</p>
      </article>
    </section>

    <section class="mt-10 md:mt-14">
      <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="meta-text">Projects</p>
          <h2 class="mt-1 font-display text-4xl text-ink md:text-6xl">正在成形的東西</h2>
        </div>
        <RouterLink class="text-sm font-semibold text-clay no-underline hover:text-moss" to="/projects">
          查看全部專案
        </RouterLink>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProjectCard v-for="project in featuredProjects" :key="project.slug" :project="project" />
      </div>
    </section>

    <section class="mt-10 md:mt-14">
      <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="meta-text">Notes</p>
          <h2 class="mt-1 font-display text-4xl text-ink md:text-6xl">近期</h2>
        </div>
        <RouterLink class="text-sm font-semibold text-clay no-underline hover:text-moss" to="/notes">
          查看全部筆記
        </RouterLink>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NoteCard v-for="note in latestNotes" :key="note.slug" :note="note" />
      </div>
    </section>
  </main>
</template>
