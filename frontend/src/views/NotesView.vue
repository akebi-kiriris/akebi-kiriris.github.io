<script setup>
import { computed, ref } from 'vue'

import NoteCard from '@/components/notes/NoteCard.vue'
import { useNotes } from '@/composables/useNotes'

const { tags, searchNotes } = useNotes()
const query = ref('')
const selectedTag = ref('全部')

const filteredNotes = computed(() => {
  const results = searchNotes(query.value)

  if (selectedTag.value === '全部') {
    return results
  }

  return results.filter((note) => note.tags.includes(selectedTag.value))
})
</script>

<template>
  <main class="content-shell py-10 md:py-16">
    <section class="mt-6">
      <p class="meta-text">筆記</p>
      <h1 class="mt-3 max-w-[14ch] font-display text-5xl leading-tight md:text-7xl text-ink">
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
        placeholder="搜尋筆記"
        aria-label="搜尋筆記"
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

    <section class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <NoteCard v-for="note in filteredNotes" :key="note.slug" :note="note" />
    </section>
  </main>
</template>
