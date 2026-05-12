<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const typeLabels = {
  architecture: '架構',
  feature: '功能',
  quality: '品質',
  release: '部署',
  ai: 'AI',
}
</script>

<template>
  <section v-if="items.length" class="creator-band grid min-w-0 gap-4 overflow-hidden p-3 md:p-4">
    <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="meta-text">Learning Journey</p>
        <h2 class="mt-1 font-display text-3xl leading-tight text-ink md:text-4xl">
          PrAjeKt 重構時間線
        </h2>
      </div>
      <p class="text-xs font-semibold text-muted md:text-sm">
        {{ items.length }} 個重構節點，依據重構計畫歷史記錄整理
      </p>
    </div>

    <ol class="timeline-strip -mx-3 flex max-w-full snap-x gap-3 overflow-x-auto px-3 pb-2 md:-mx-4 md:px-4">
      <li
        v-for="(item, index) in items"
        :key="`${item.date}-${item.title}`"
        class="timeline-item min-w-[18rem] snap-start rounded-md border border-line bg-[color-mix(in_srgb,var(--paper)_88%,white_12%)] p-3 md:min-w-84"
      >
        <div class="flex items-center justify-between gap-2">
          <span
            class="inline-grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-moss text-xs font-bold text-paper"
            aria-hidden="true"
          >
            {{ index + 1 }}
          </span>
          <time class="text-xs font-bold text-muted">{{ item.date }}</time>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span class="rounded-sm border border-line bg-paper-soft px-2 py-1 text-xs font-semibold text-muted">
            {{ item.phase }}
          </span>
          <span class="rounded-sm border border-line px-2 py-1 text-xs font-semibold text-clay">
            {{ typeLabels[item.type] || item.type }}
          </span>
        </div>

        <h3 class="mt-3 wrap-break-word font-display text-2xl leading-tight text-ink">
          {{ item.title }}
        </h3>
        <p class="timeline-summary mt-2 text-sm leading-6 text-muted">
          {{ item.summary }}
        </p>

        <div v-if="item.evidence?.length" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="evidence in item.evidence.slice(0, 2)"
            :key="evidence"
            class="rounded-sm bg-paper-soft px-2 py-1 text-xs font-semibold text-muted"
          >
            {{ evidence }}
          </span>
        </div>

        <div v-if="item.links?.length" class="mt-3 flex flex-wrap gap-2">
          <RouterLink
            v-for="link in item.links.slice(0, 1)"
            :key="link.to"
            :to="link.to"
            class="inline-flex min-h-8 items-center rounded-sm border border-line px-2 text-xs font-semibold text-ink no-underline transition hover:border-moss hover:bg-paper-soft"
          >
            {{ link.label }}
          </RouterLink>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.timeline-strip {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--moss) 45%, transparent) transparent;
}

.timeline-summary {
  display: -webkit-box;
  min-height: 3rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
