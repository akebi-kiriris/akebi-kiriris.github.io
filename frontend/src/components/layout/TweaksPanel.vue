<script setup>
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'kiriris-theme'
const BG_STORAGE_KEY = 'kiriris-bg-intensity'
const open = ref(false)
const activeTheme = ref('ink-cyan')
const activeBackground = ref('subtle')

const themes = [
  { key: 'default', name: '紙感墨綠', swatch: 'from-[#244f3e] to-[#a44f37]' },
  { key: 'graphite-red', name: '石墨紅', swatch: 'from-[#232528] to-[#b23a30]' },
  { key: 'sage-brass', name: '鼠尾草黃銅', swatch: 'from-[#3f5f52] to-[#9a7335]' },
  { key: 'ink-cyan', name: '墨青', swatch: 'from-[#175869] to-[#2a7d95]' },
  { key: 'charcoal-peach', name: '炭桃', swatch: 'from-[#3a312c] to-[#c46f50]' },
]

onMounted(() => {
  const savedTheme = localStorage.getItem(STORAGE_KEY)
  const savedBackground = localStorage.getItem(BG_STORAGE_KEY)
  setTheme(savedTheme || 'ink-cyan')
  setBackground(savedBackground || 'subtle')
})

function setTheme(themeKey) {
  activeTheme.value = themeKey

  if (themeKey === 'default') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', themeKey)
  }

  localStorage.setItem(STORAGE_KEY, themeKey)
}

function setBackground(mode) {
  activeBackground.value = mode
  document.documentElement.setAttribute('data-bg-intensity', mode)
  localStorage.setItem(BG_STORAGE_KEY, mode)
}
</script>

<template>
  <div class="fixed right-4 bottom-4 z-40 md:right-6 md:bottom-6">
    <div v-if="open" class="mb-2 w-64 rounded-md border border-line bg-paper p-3 shadow-xl">
      <div class="mb-3 flex items-center justify-between">
        <p class="text-sm font-semibold text-ink">Tweaks</p>
        <button
          type="button"
          class="inline-flex h-8 items-center rounded-sm px-2 text-xs font-semibold text-muted hover:bg-paper-soft"
          @click="open = false"
        >
          收合
        </button>
      </div>
      <div class="grid gap-2">
        <button
          v-for="theme in themes"
          :key="theme.key"
          type="button"
          class="flex items-center justify-between rounded-sm border px-2 py-2 text-left transition"
          :class="
            activeTheme === theme.key
              ? 'border-moss bg-paper-soft text-ink'
              : 'border-line text-muted hover:bg-paper-soft'
          "
          @click="setTheme(theme.key)"
        >
          <span class="text-sm font-medium">{{ theme.name }}</span>
          <span class="h-4 w-10 rounded-sm bg-linear-to-r" :class="theme.swatch" />
        </button>
      </div>
      <div class="mt-4 border-t border-line pt-3">
        <p class="mb-2 text-xs font-semibold text-muted">背景質感</p>
        <div class="grid grid-cols-3 gap-2">
          <button
            type="button"
            class="rounded-sm border px-2 py-1.5 text-xs font-semibold transition"
            :class="
              activeBackground === 'off'
                ? 'border-moss bg-paper-soft text-ink'
                : 'border-line text-muted hover:bg-paper-soft'
            "
            @click="setBackground('off')"
          >
            關閉
          </button>
          <button
            type="button"
            class="rounded-sm border px-2 py-1.5 text-xs font-semibold transition"
            :class="
              activeBackground === 'subtle'
                ? 'border-moss bg-paper-soft text-ink'
                : 'border-line text-muted hover:bg-paper-soft'
            "
            @click="setBackground('subtle')"
          >
            淡
          </button>
          <button
            type="button"
            class="rounded-sm border px-2 py-1.5 text-xs font-semibold transition"
            :class="
              activeBackground === 'visible'
                ? 'border-moss bg-paper-soft text-ink'
                : 'border-line text-muted hover:bg-paper-soft'
            "
            @click="setBackground('visible')"
          >
            明顯
          </button>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="inline-flex min-h-11 items-center rounded-sm border border-line bg-paper px-3 text-sm font-semibold text-ink shadow-lg transition hover:-translate-y-0.5 hover:bg-paper-soft"
      @click="open = !open"
    >
      Tweaks
    </button>
  </div>
</template>
