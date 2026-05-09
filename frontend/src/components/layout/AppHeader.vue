<script setup>
const navItems = [
  { label: '首頁', to: '/' },
  { label: '專案', to: '/projects' },
  { label: '筆記', to: '/notes' },
  { label: '關於', to: '/about' },
]
</script>

<template>
  <header class="content-shell flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
    <RouterLink to="/" aria-label="回到首頁" class="inline-flex items-center gap-3 text-ink no-underline">
      <span
        class="inline-grid h-11 w-11 place-items-center rounded-md border border-ink bg-moss font-display text-lg font-bold text-paper"
      >
        KI
      </span>
      <span class="text-lg font-semibold">Kiriris</span>
    </RouterLink>

    <nav
      aria-label="主要導覽"
      class="flex w-full items-center gap-1 overflow-x-auto rounded-md border border-line bg-[color-mix(in_srgb,var(--paper)_82%,white_18%)] p-1 md:w-auto"
    >
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        active-class="bg-moss text-paper"
        class="rounded-sm px-3 py-2 text-sm font-semibold text-muted no-underline transition hover:bg-moss hover:text-paper"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </header>
</template>
