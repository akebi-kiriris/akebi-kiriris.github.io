<script setup>
import NoteCard from '@/components/notes/NoteCard.vue'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import { useNotes } from '@/composables/useNotes'
import { useProjects } from '@/composables/useProjects'

const { notes } = useNotes()
const { featuredProjects } = useProjects()
</script>

<template>
  <main class="content-shell py-10 md:py-16">
    <section class="grid min-h-[66vh] content-center border-y border-line py-12 md:py-20">
      <p class="meta-text">作品集 / 筆記 / 學習軌跡</p>
      <h1 class="mt-3 max-w-[12ch] font-display text-6xl leading-[0.98] md:text-8xl text-ink">
        Kiriris
      </h1>
      <p class="mt-5 max-w-3xl text-lg leading-8 text-muted">
        這是我的個人網站，專門整理專案故事、技術筆記，以及一路上那些值得留下的學習決策。
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <RouterLink
          class="inline-flex min-h-11 items-center rounded-sm bg-moss px-4 text-sm font-semibold text-paper no-underline transition hover:-translate-y-0.5"
          to="/notes"
        >
          查看筆記
        </RouterLink>
        <RouterLink
          class="inline-flex min-h-11 items-center rounded-sm border border-line bg-[color-mix(in_srgb,var(--paper)_84%,white_16%)] px-4 text-sm font-semibold text-ink no-underline transition hover:-translate-y-0.5"
          to="/projects"
        >
          瀏覽專案
        </RouterLink>
      </div>
    </section>

    <section class="mt-10 md:mt-16">
      <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <p class="meta-text">精選</p>
        <h2 class="font-display text-4xl md:text-6xl text-ink">目前進行中</h2>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProjectCard v-for="project in featuredProjects" :key="project.slug" :project="project" />
      </div>
    </section>

    <section class="mt-10 md:mt-16">
      <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <p class="meta-text">最新</p>
        <h2 class="font-display text-4xl md:text-6xl text-ink">近期筆記</h2>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NoteCard v-for="note in notes.slice(0, 3)" :key="note.slug" :note="note" />
      </div>
    </section>
  </main>
</template>
