<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article class="surface-panel grid min-h-55 content-start gap-3">
    <div class="meta-text flex flex-wrap gap-x-3 gap-y-1">
      <span>{{ project.status }}</span>
      <span>{{ project.tags.join(' / ') }}</span>
    </div>
    <h3 class="font-display text-2xl leading-tight text-ink">{{ project.title }}</h3>
    <p class="text-muted">{{ project.summary }}</p>
    <div class="mt-auto flex flex-wrap gap-2">
      <a
        v-for="link in project.links"
        :key="link.href"
        :href="link.href"
        target="_blank"
        rel="noreferrer"
        class="inline-flex min-h-11 items-center rounded-sm px-3 text-sm font-semibold text-clay transition hover:-translate-y-0.5 hover:bg-paper-soft"
      >
        {{ link.label }}
      </a>
    </div>
  </article>
</template>
