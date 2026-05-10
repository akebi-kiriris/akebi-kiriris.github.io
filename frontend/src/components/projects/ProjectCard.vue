<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <RouterLink
    :to="`/projects/${project.slug}`"
    class="surface-panel grid min-h-55 content-start gap-3 no-underline"
  >
    <div class="meta-text flex flex-wrap gap-x-3 gap-y-1">
      <span>{{ project.status || '未標註狀態' }}</span>
      <time v-if="project.date" :datetime="project.date">{{ project.date }}</time>
      <span>{{ project.tags.join(' / ') }}</span>
    </div>
    <h3 class="font-display text-2xl leading-tight text-ink">{{ project.title }}</h3>
    <p class="text-muted">{{ project.summary }}</p>
    <div class="mt-auto">
      <span
        class="inline-flex min-h-11 items-center rounded-sm px-3 text-sm font-semibold text-clay transition hover:-translate-y-0.5 hover:bg-paper-soft"
      >
        查看專案內容（{{ project.documents?.length || 0 }}）
      </span>
    </div>
  </RouterLink>
</template>
