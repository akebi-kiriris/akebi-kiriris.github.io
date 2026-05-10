<script setup>
import { computed } from 'vue'

import MarkdownArticle from '@/components/notes/MarkdownArticle.vue'
import ProjectDocNavigator from '@/components/projects/ProjectDocNavigator.vue'
import { useProjects } from '@/composables/useProjects'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
  docSlug: {
    type: String,
    default: '',
  },
})

const { findProject } = useProjects()
const project = computed(() => findProject(props.slug))

const activeDocument = computed(() => {
  const current = project.value
  if (!current || !current.documents.length) {
    return null
  }

  if (!props.docSlug) {
    return current.documents[0]
  }

  return current.documents.find((doc) => doc.slug === props.docSlug) || current.documents[0]
})

const activeIndex = computed(() => {
  if (!project.value || !activeDocument.value) {
    return -1
  }

  return project.value.documents.findIndex((doc) => doc.slug === activeDocument.value.slug)
})

const previousDoc = computed(() => {
  if (!project.value || activeIndex.value <= 0) {
    return null
  }

  return project.value.documents[activeIndex.value - 1]
})

const nextDoc = computed(() => {
  if (!project.value || activeIndex.value < 0) {
    return null
  }

  return project.value.documents[activeIndex.value + 1] || null
})

const currentNavSlug = computed(() => {
  if (props.docSlug === 'about') {
    return 'about'
  }

  return activeDocument.value?.slug || ''
})
</script>

<template>
  <main class="reading-shell py-10 md:py-16">
    <RouterLink
      class="inline-flex min-h-11 items-center rounded-sm px-3 text-sm font-semibold text-clay no-underline transition hover:bg-paper-soft"
      to="/projects"
    >
      返回專案列表
    </RouterLink>

    <template v-if="project">
      <header class="mt-4 grid gap-4 border-b border-line pb-8">
        <div class="meta-text flex flex-wrap gap-x-3 gap-y-1">
          <span>{{ project.status || '未標註狀態' }}</span>
          <time v-if="project.date" :datetime="project.date">{{ project.date }}</time>
          <span>{{ project.tags.join(' / ') }}</span>
        </div>
        <h1 class="max-w-[13ch] font-display text-5xl leading-[1.02] md:text-7xl text-ink">
          {{ project.title }}
        </h1>
        <p class="max-w-3xl text-lg leading-8 text-muted">{{ project.summary }}</p>
        <div class="flex flex-wrap gap-2">
          <RouterLink
            v-if="project.aboutHtml"
            :to="`/projects/${project.slug}/about`"
            class="inline-flex min-h-10 items-center rounded-sm border border-line px-3 text-sm font-semibold text-muted no-underline transition hover:bg-paper-soft"
          >
            閱讀專案介紹
          </RouterLink>
          <RouterLink
            v-if="activeDocument"
            :to="`/projects/${project.slug}/${activeDocument.slug}`"
            class="inline-flex min-h-10 items-center rounded-sm border border-line px-3 text-sm font-semibold text-muted no-underline transition hover:bg-paper-soft"
          >
            直接看內容
          </RouterLink>
        </div>
      </header>

      <section class="mt-10 grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <ProjectDocNavigator
          :project-slug="project.slug"
          :project-title="project.title"
          :documents="project.documents"
          :active-doc-slug="currentNavSlug"
          :previous-doc="previousDoc"
          :next-doc="nextDoc"
        />

        <article
          v-if="props.docSlug === 'about' && project.aboutHtml"
          class="rounded-md border border-line bg-[color-mix(in_srgb,var(--paper)_90%,white_10%)] p-4 md:p-6"
        >
          <div class="meta-text flex flex-wrap gap-2">
            <span>{{ project.slug }} / about</span>
            <time v-if="project.date" :datetime="project.date">{{ project.date }}</time>
          </div>
          <h2 class="mt-2 font-display text-4xl text-ink md:text-5xl">專案介紹</h2>
          <MarkdownArticle :html="project.aboutHtml" />
        </article>

        <article
          v-else-if="activeDocument"
          class="rounded-md border border-line bg-[color-mix(in_srgb,var(--paper)_90%,white_10%)] p-4 md:p-6"
        >
          <div class="meta-text flex flex-wrap gap-2">
            <span>{{ project.slug }} / {{ activeDocument.slug }}</span>
            <time v-if="activeDocument.date" :datetime="activeDocument.date">{{ activeDocument.date }}</time>
          </div>
          <h2 class="mt-2 font-display text-4xl text-ink md:text-5xl">{{ activeDocument.title }}</h2>
          <p v-if="activeDocument.summary" class="mt-3 text-muted">{{ activeDocument.summary }}</p>
          <MarkdownArticle :html="activeDocument.html" />
        </article>

        <section v-else class="rounded-md border border-line bg-[color-mix(in_srgb,var(--paper)_90%,white_10%)] p-6">
          <h2 class="font-display text-3xl text-ink">這個專案還沒有內容文件</h2>
          <p class="mt-3 text-muted">你可以在專案資料夾新增 md 後，這裡會自動列出。</p>
        </section>
      </section>
    </template>

    <section v-else class="mt-8">
      <h1 class="font-display text-5xl text-ink">找不到這個專案</h1>
      <p class="mt-3 text-muted">內容可能還在整理，或已重新命名。</p>
    </section>
  </main>
</template>
