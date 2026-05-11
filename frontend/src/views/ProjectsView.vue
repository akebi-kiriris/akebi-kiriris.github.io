<script setup>
import ProjectCard from '@/components/projects/ProjectCard.vue'
import { useProjects } from '@/composables/useProjects'

const { projects } = useProjects()
</script>

<template>
  <main class="content-shell py-10 md:py-16">
    <section class="creator-hero mt-6">
      <p class="meta-text">專案</p>
      <h1 class="mt-3 max-w-200 font-display text-5xl leading-tight md:text-7xl text-ink">
        值得被說清楚的作品
      </h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-muted">
        每個專案頁會整理背景、技術選擇、成果截圖、連結，以及做完後的關鍵反思。
      </p>
    </section>

    <section class="creator-band mt-8 grid gap-4 md:grid-cols-3 md:p-5">
      <article>
        <p class="meta-text">我在做什麼</p>
        <p class="mt-2 text-sm leading-7 text-ink">把專案、學習與重構紀錄做成可持續更新的個人知識網站。</p>
      </article>
      <article>
        <p class="meta-text">我怎麼做</p>
        <p class="mt-2 text-sm leading-7 text-ink">用 Markdown 先寫內容，再補上前端結構與導覽，讓技術決策能被追溯。</p>
      </article>
      <article>
        <p class="meta-text">最近在打磨</p>
        <p class="mt-2 text-sm leading-7 text-ink">專案導覽、標籤篩選與閱讀動線，讓第一次進站的讀者更快看懂脈絡。</p>
      </article>
    </section>

    <section class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ProjectCard v-for="project in projects" :key="project.slug" :project="project" />
    </section>
  </main>
</template>
