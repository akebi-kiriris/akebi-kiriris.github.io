<script setup>
defineProps({
  note: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <RouterLink :to="`/notes/${note.slug}`" class="surface-panel grid min-h-55 content-start gap-3 no-underline">
    <div class="meta-text flex flex-wrap gap-x-3 gap-y-1">
      <time :datetime="note.date">{{ note.date }}</time>
      <span>{{ note.tags.join(' / ') }}</span>
    </div>
    <h3 class="font-display text-2xl leading-tight text-ink">{{ note.title }}</h3>
    <p class="text-muted">{{ note.summary }}</p>
  </RouterLink>
</template>
