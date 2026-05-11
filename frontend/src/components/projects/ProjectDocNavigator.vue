<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  projectSlug: {
    type: String,
    required: true,
  },
  projectTitle: {
    type: String,
    required: true,
  },
  documents: {
    type: Array,
    default: () => [],
  },
  activeDocSlug: {
    type: String,
    default: '',
  },
})

const pageSize = 10
const page = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(props.documents.length / pageSize)))

const pagedDocuments = computed(() => {
  const start = page.value * pageSize
  return props.documents.slice(start, start + pageSize)
})

watch(
  () => props.documents,
  () => {
    if (page.value > totalPages.value - 1) {
      page.value = totalPages.value - 1
    }
  },
  { deep: true },
)

watch(
  () => props.activeDocSlug,
  (slug) => {
    if (!slug || slug === 'about') {
      return
    }
    const idx = props.documents.findIndex((doc) => doc.slug === slug)
    if (idx >= 0) {
      page.value = Math.floor(idx / pageSize)
    }
  },
  { immediate: true },
)

function prevPage() {
  page.value = Math.max(0, page.value - 1)
}

function nextPage() {
  page.value = Math.min(totalPages.value - 1, page.value + 1)
}
</script>

<template>
  <aside class="surface-panel lg:sticky lg:top-20">
    <p class="meta-text">專案導覽</p>
    <h3 class="mt-2 min-w-0 break-all font-display text-3xl leading-tight text-ink">{{ projectTitle }}</h3>
    <p class="mt-2 text-sm text-muted">共 {{ documents.length }} 篇文件</p>
    <RouterLink
      :to="`/projects/${projectSlug}/about`"
      class="mt-3 inline-flex min-h-10 items-center rounded-sm border px-3 text-xs font-semibold no-underline transition"
      :class="
        activeDocSlug === 'about'
          ? 'border-moss bg-paper-soft text-ink'
          : 'border-line text-muted hover:bg-paper-soft'
      "
    >
      About（專案介紹）
    </RouterLink>

    <div class="mt-4 flex items-center justify-between gap-2">
      <p class="text-xs font-semibold text-muted">第 {{ page + 1 }} / {{ totalPages }} 組（每組 10 份）</p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-sm border border-line px-2 py-1 text-xs font-semibold text-muted transition hover:bg-paper-soft disabled:opacity-40"
          :disabled="page === 0"
          @click="prevPage"
        >
          上一組
        </button>
        <button
          type="button"
          class="rounded-sm border border-line px-2 py-1 text-xs font-semibold text-muted transition hover:bg-paper-soft disabled:opacity-40"
          :disabled="page >= totalPages - 1"
          @click="nextPage"
        >
          下一組
        </button>
      </div>
    </div>

    <nav class="mt-2 grid gap-2" aria-label="專案文件">
      <RouterLink
        v-for="doc in pagedDocuments"
        :key="doc.slug"
        :to="`/projects/${projectSlug}/${doc.slug}`"
        class="min-w-0 rounded-sm border px-3 py-2 no-underline transition"
        :class="
          activeDocSlug === doc.slug
            ? 'border-moss bg-paper-soft text-ink'
            : 'border-line text-muted hover:bg-paper-soft'
        "
      >
        <p class="text-xs font-semibold uppercase tracking-[0.06em]">{{ doc.date || '未標註日期' }}</p>
        <p class="mt-1 min-w-0 break-all text-sm font-semibold">{{ doc.title }}</p>
      </RouterLink>
    </nav>
  </aside>
</template>
