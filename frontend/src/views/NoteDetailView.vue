<script setup>
import { computed } from 'vue'

import MarkdownArticle from '@/components/notes/MarkdownArticle.vue'
import { useNotes } from '@/composables/useNotes'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { findNote } = useNotes()
const note = computed(() => findNote(props.slug))
</script>

<template>
  <main class="content-shell max-w-205 py-10 md:py-16">
    <RouterLink
      class="inline-flex min-h-11 items-center rounded-sm px-3 text-sm font-semibold text-clay no-underline transition hover:bg-paper-soft"
      to="/notes"
    >
      返回筆記列表
    </RouterLink>

    <template v-if="note">
      <header class="mt-4 grid gap-4 border-b border-line pb-8">
        <div class="meta-text flex flex-wrap gap-x-3 gap-y-1">
          <time :datetime="note.date">{{ note.date }}</time>
          <span>{{ note.tags.join(' / ') }}</span>
        </div>
        <h1 class="max-w-[13ch] font-display text-5xl leading-[1.02] md:text-7xl text-ink">
          {{ note.title }}
        </h1>
        <p class="max-w-3xl text-lg leading-8 text-muted">{{ note.summary }}</p>
      </header>
      <MarkdownArticle :html="note.html" />
    </template>

    <section v-else class="mt-8">
      <h1 class="font-display text-5xl text-ink">找不到這篇筆記</h1>
      <p class="mt-3 text-muted">這篇內容可能已經更名，或移到其他分類。</p>
    </section>
  </main>
</template>
