<script setup>
import { computed, ref } from 'vue'

import NoteCard from '@/components/notes/NoteCard.vue'
import { useNotes } from '@/composables/useNotes'
import { useProjects } from '@/composables/useProjects'

const { tags: noteTags, searchNotes } = useNotes()
const { projects } = useProjects()
const query = ref('')
const selectedTag = ref('全部')

const projectTags = computed(() => [...new Set(projects.flatMap((project) => project.tags || []))])
const tags = computed(() => [...new Set([...noteTags, ...projectTags.value])])

const filteredNotes = computed(() => {
  const results = searchNotes(query.value)

  if (selectedTag.value === '全部') {
    return results
  }

  return results.filter((note) => note.tags.includes(selectedTag.value))
})

const filteredProjectDocs = computed(() => {
  const term = query.value.trim().toLowerCase()

  const docs = projects.flatMap((project) =>
    project.documents.map((doc) => ({
      ...doc,
      projectSlug: project.slug,
      projectTitle: project.title,
      mergedTags: [...new Set([...(project.tags || []), ...(doc.tags || [])])],
    })),
  )

  const byTag =
    selectedTag.value === '全部'
      ? docs
      : docs.filter((doc) => doc.mergedTags.includes(selectedTag.value))

  if (!term) {
    return byTag
  }

  return byTag.filter((doc) => {
    const haystack = [
      doc.title,
      doc.summary,
      doc.projectTitle,
      ...(doc.mergedTags || []),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(term)
  })
})
</script>

<template>
  <main class="content-shell py-10 md:py-16">
    <section class="mt-6">
      <p class="meta-text">筆記</p>
      <h1 class="mt-3 max-w-200 font-display text-5xl leading-tight md:text-7xl text-ink">
        技術學習與實作紀錄
      </h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-muted">
        這裡收錄 Markdown 筆記、實驗紀錄、除錯過程，以及每次決策背後的理由。
      </p>
    </section>

    <section class="mt-8 grid gap-4" aria-label="筆記篩選">
      <input
        v-model="query"
        type="search"
        placeholder="搜尋筆記與專案筆記"
        aria-label="搜尋筆記與專案筆記"
        class="min-h-12 rounded-md border border-line bg-[color-mix(in_srgb,var(--paper)_84%,white_16%)] px-4 text-ink outline-none transition focus:ring-2 focus:ring-moss/35"
      />
      <div class="flex flex-wrap gap-2">
        <button
          :class="[
            'min-h-10 rounded-sm border px-3 text-sm font-semibold transition',
            selectedTag === '全部'
              ? 'border-moss bg-moss text-paper'
              : 'border-line text-muted hover:bg-paper-soft',
          ]"
          type="button"
          @click="selectedTag = '全部'"
        >
          全部
        </button>
        <button
          v-for="tag in tags"
          :key="tag"
          :class="[
            'min-h-10 rounded-sm border px-3 text-sm font-semibold transition',
            selectedTag === tag
              ? 'border-moss bg-moss text-paper'
              : 'border-line text-muted hover:bg-paper-soft',
          ]"
          type="button"
          @click="selectedTag = tag"
        >
          {{ tag }}
        </button>
      </div>
    </section>

    <section class="mt-8">
      <div class="mb-4 flex items-end justify-between gap-2">
        <p class="meta-text">專案筆記</p>
        <p class="text-xs text-muted">共 {{ filteredProjectDocs.length }} 篇</p>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="doc in filteredProjectDocs"
          :key="`${doc.projectSlug}-${doc.slug}`"
          :to="`/projects/${doc.projectSlug}/${doc.slug}`"
          class="surface-panel grid min-h-55 content-start gap-3 no-underline"
        >
          <div class="meta-text flex flex-wrap gap-x-3 gap-y-1">
            <time v-if="doc.date" :datetime="doc.date">{{ doc.date }}</time>
            <span>{{ doc.projectTitle }}</span>
          </div>
          <h3 class="font-display text-2xl leading-tight text-ink">{{ doc.title }}</h3>
          <p class="text-muted">{{ doc.summary || '點擊查看完整內容' }}</p>
        </RouterLink>
      </div>
    </section>

    <section class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <NoteCard v-for="note in filteredNotes" :key="note.slug" :note="note" />
    </section>
  </main>
</template>
