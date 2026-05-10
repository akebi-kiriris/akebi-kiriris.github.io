<script setup>
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
  previousDoc: {
    type: Object,
    default: null,
  },
  nextDoc: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <aside class="surface-panel lg:sticky lg:top-20">
    <p class="meta-text">專案導覽</p>
    <h3 class="mt-2 font-display text-3xl leading-tight text-ink">{{ projectTitle }}</h3>
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

    <nav class="mt-4 grid gap-2" aria-label="專案文件">
      <RouterLink
        v-for="doc in documents"
        :key="doc.slug"
        :to="`/projects/${projectSlug}/${doc.slug}`"
        class="rounded-sm border px-3 py-2 no-underline transition"
        :class="
          activeDocSlug === doc.slug
            ? 'border-moss bg-paper-soft text-ink'
            : 'border-line text-muted hover:bg-paper-soft'
        "
      >
        <p class="text-xs font-semibold uppercase tracking-[0.06em]">{{ doc.date || '未標註日期' }}</p>
        <p class="mt-1 text-sm font-semibold">{{ doc.title }}</p>
      </RouterLink>
    </nav>

    <div class="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-3">
      <RouterLink
        v-if="previousDoc"
        :to="`/projects/${projectSlug}/${previousDoc.slug}`"
        class="inline-flex min-h-10 items-center justify-center rounded-sm border border-line px-2 text-xs font-semibold text-muted no-underline transition hover:bg-paper-soft"
      >
        上一篇
      </RouterLink>
      <span
        v-else
        class="inline-flex min-h-10 items-center justify-center rounded-sm border border-line px-2 text-xs font-semibold text-muted opacity-45"
      >
        上一篇
      </span>

      <RouterLink
        v-if="nextDoc"
        :to="`/projects/${projectSlug}/${nextDoc.slug}`"
        class="inline-flex min-h-10 items-center justify-center rounded-sm border border-line px-2 text-xs font-semibold text-muted no-underline transition hover:bg-paper-soft"
      >
        下一篇
      </RouterLink>
      <span
        v-else
        class="inline-flex min-h-10 items-center justify-center rounded-sm border border-line px-2 text-xs font-semibold text-muted opacity-45"
      >
        下一篇
      </span>
    </div>
  </aside>
</template>
