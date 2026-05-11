<script setup>
import ProjectCard from '@/components/projects/ProjectCard.vue'
import { useProjects } from '@/composables/useProjects'

const { projects } = useProjects()
</script>

<template>
  <main class="content-shell py-10 md:py-16">
    <section class="mt-6">
      <p class="meta-text">專案</p>
      <h1 class="mt-3 max-w-200 font-display text-5xl leading-tight md:text-7xl text-ink">
        值得被說清楚的作品
      </h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-muted">
        每個專案頁會整理背景、技術選擇、成果截圖、連結，以及做完後的關鍵反思。
      </p>
    </section>

    <section class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="project in projects" :key="project.slug" :project="project" />
    </section>
  </main>
</template>
