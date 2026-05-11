<script setup>
import { computed, ref, watch } from 'vue'

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
const selectedTag = ref('全部')

const availableTags = computed(() => {
  if (!project.value) {
    return []
  }

  return [...new Set(project.value.documents.flatMap((doc) => doc.tags || []))]
})

const recommendedDocs = computed(() => {
  if (!project.value) {
    return []
  }

  return project.value.documents.slice(0, 3)
})

const filteredDocuments = computed(() => {
  if (!project.value) {
    return []
  }

  if (selectedTag.value === '全部') {
    return project.value.documents
  }

  return project.value.documents.filter((doc) => (doc.tags || []).includes(selectedTag.value))
})

const activeDocument = computed(() => {
  const current = project.value
  if (!current || !filteredDocuments.value.length) {
    return null
  }

  if (!props.docSlug) {
    return filteredDocuments.value[0]
  }

  return filteredDocuments.value.find((doc) => doc.slug === props.docSlug) || filteredDocuments.value[0]
})

const activeIndex = computed(() => {
  if (!activeDocument.value) {
    return -1
  }

  return filteredDocuments.value.findIndex((doc) => doc.slug === activeDocument.value.slug)
})

const previousDoc = computed(() => {
  if (activeIndex.value <= 0) {
    return null
  }

  return filteredDocuments.value[activeIndex.value - 1]
})

const nextDoc = computed(() => {
  if (activeIndex.value < 0) {
    return null
  }

  return filteredDocuments.value[activeIndex.value + 1] || null
})

const currentNavSlug = computed(() => {
  if (props.docSlug === 'about') {
    return 'about'
  }

  return activeDocument.value?.slug || ''
})

watch(project, () => {
  selectedTag.value = '全部'
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
      <header class="creator-hero mt-4 grid gap-4">
        <div class="meta-text flex flex-wrap gap-x-3 gap-y-1">
          <span>{{ project.status || '未標註狀態' }}</span>
          <time v-if="project.date" :datetime="project.date">{{ project.date }}</time>
          <span>{{ project.tags.join(' / ') }}</span>
        </div>
        <h1 class="max-w-160 font-display text-5xl leading-[1.02] md:text-7xl text-ink">
          {{ project.title }}
        </h1>
        <p class="max-w-3xl text-lg leading-8 text-muted">{{ project.summary }}</p>
      </header>

      <section class="mt-8 grid gap-4">
        <div
          v-if="recommendedDocs.length"
          class="creator-band grid gap-2 p-3 md:p-4"
        >
          <p class="meta-text">先看這三篇</p>
          <div class="grid gap-2 md:grid-cols-3">
            <RouterLink
              v-for="doc in recommendedDocs"
              :key="doc.slug"
              :to="`/projects/${project.slug}/${doc.slug}`"
              class="rounded-sm border border-line px-3 py-2 text-sm font-semibold text-ink no-underline transition hover:bg-paper"
            >
              {{ doc.title }}
            </RouterLink>
          </div>
        </div>

        <div class="creator-band grid gap-3 p-2 md:p-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-semibold text-muted">篩選標籤：</span>
            <button
              type="button"
              class="rounded-sm border px-2 py-1 text-xs font-semibold transition"
              :class="
                selectedTag === '全部'
                  ? 'border-moss bg-paper-soft text-ink'
                  : 'border-line text-muted hover:bg-paper'
              "
              @click="selectedTag = '全部'"
            >
              全部
            </button>
            <button
              v-for="tag in availableTags"
              :key="tag"
              type="button"
              class="rounded-sm border px-2 py-1 text-xs font-semibold transition"
              :class="
                selectedTag === tag
                  ? 'border-moss bg-paper-soft text-ink'
                  : 'border-line text-muted hover:bg-paper'
              "
              @click="selectedTag = tag"
            >
              {{ tag }}
            </button>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2">
            <RouterLink
              v-if="previousDoc"
              :to="`/projects/${project.slug}/${previousDoc.slug}`"
              class="inline-flex min-h-10 items-center rounded-sm border border-line px-3 text-left text-sm font-semibold text-muted no-underline transition whitespace-normal hover:bg-paper"
            >
              上一篇：{{ previousDoc.title }}
            </RouterLink>
            <span
              v-else
              class="inline-flex min-h-10 items-center rounded-sm border border-line px-3 text-sm font-semibold text-muted opacity-45"
            >
              上一篇
            </span>

            <RouterLink
              v-if="nextDoc"
              :to="`/projects/${project.slug}/${nextDoc.slug}`"
              class="inline-flex min-h-10 items-center rounded-sm border border-line px-3 text-left text-sm font-semibold text-muted no-underline transition whitespace-normal hover:bg-paper"
            >
              下一篇：{{ nextDoc.title }}
            </RouterLink>
            <span
              v-else
              class="inline-flex min-h-10 items-center rounded-sm border border-line px-3 text-sm font-semibold text-muted opacity-45"
            >
              下一篇
            </span>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
          <ProjectDocNavigator
            :project-slug="project.slug"
            :project-title="project.title"
            :documents="filteredDocuments"
            :active-doc-slug="currentNavSlug"
          />

          <div class="grid gap-4">
        <article
          v-if="props.docSlug === 'about' && project.aboutHtml"
          class="soft-surface p-4 md:p-6"
        >
          <div class="meta-text flex flex-wrap gap-2">
            <span>{{ project.slug }} / about</span>
            <time v-if="project.date" :datetime="project.date">{{ project.date }}</time>
          </div>
          <MarkdownArticle :html="project.aboutHtml" />
        </article>

        <article
          v-else-if="activeDocument"
          class="soft-surface p-4 md:p-6"
        >
          <div class="meta-text flex flex-wrap gap-2">
            <span>{{ project.slug }} / {{ activeDocument.slug }}</span>
            <time v-if="activeDocument.date" :datetime="activeDocument.date">{{ activeDocument.date }}</time>
          </div>
          <h2 class="mt-2 break-words font-display text-4xl text-ink md:text-5xl">{{ activeDocument.title }}</h2>
          <p v-if="activeDocument.summary" class="mt-3 text-muted">{{ activeDocument.summary }}</p>
          <MarkdownArticle :html="activeDocument.html" />
        </article>

        <section v-else class="soft-surface p-6">
          <h2 class="font-display text-3xl text-ink">目前篩選條件沒有對應文件</h2>
          <p class="mt-3 text-muted">你可以切回「全部」或改選其他標籤。</p>
        </section>
          </div>
        </div>
      </section>
    </template>

    <section v-else class="mt-8">
      <h1 class="font-display text-5xl text-ink">找不到這個專案</h1>
      <p class="mt-3 text-muted">內容可能還在整理，或已重新命名。</p>
    </section>
  </main>
</template>
