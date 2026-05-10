<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useNotes } from '@/composables/useNotes'
import { useProjects } from '@/composables/useProjects'

const router = useRouter()
const { notes, searchNotes } = useNotes()
const { projects = [], searchProjects = () => [] } = useProjects()

const open = ref(false)
const query = ref('')
const selectedIndex = ref(0)

const staticItems = [
  { id: 'nav-home', label: '回到首頁', description: '頁面', to: '/' },
  { id: 'nav-projects', label: '前往專案', description: '頁面', to: '/projects' },
  { id: 'nav-notes', label: '前往筆記', description: '頁面', to: '/notes' },
  { id: 'nav-about', label: '關於我', description: '頁面', to: '/about' },
]

const results = computed(() => {
  const term = query.value.trim()
  const noteItems = (term ? searchNotes(term) : notes)
    .slice(0, 5)
    .map((note) => ({
      id: `note-${note.slug}`,
      label: note.title,
      description: `筆記 · ${note.date || '未標註日期'}`,
      to: `/notes/${note.slug}`,
    }))
  const projectItems = (term ? searchProjects(term) : projects)
    .slice(0, 5)
    .map((project) => ({
      id: `project-${project.slug}`,
      label: project.title,
      description: `專案 · ${project.status || '未標註狀態'}`,
      to: `/projects/${project.slug}`,
    }))

  const staticMatched = staticItems.filter((item) => {
    if (!term) {
      return true
    }

    const content = `${item.label} ${item.description}`.toLowerCase()
    return content.includes(term.toLowerCase())
  })

  return [...staticMatched, ...projectItems, ...noteItems].slice(0, 12)
})

watch(results, () => {
  selectedIndex.value = 0
})

watch(open, (isOpen) => {
  if (!isOpen) {
    query.value = ''
    selectedIndex.value = 0
  }
})

function openPalette() {
  open.value = true
}

function closePalette() {
  open.value = false
}

function goToSelected(index = selectedIndex.value) {
  const selected = results.value[index]
  if (!selected) {
    return
  }

  router.push(selected.to)
  closePalette()
}

function onKeyDown(event) {
  const isMetaK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
  if (isMetaK) {
    event.preventDefault()
    openPalette()
    return
  }

  if (!open.value) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closePalette()
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    goToSelected()
  }
}

function onOpenRequest() {
  openPalette()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('open-command-palette', onOpenRequest)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('open-command-palette', onOpenRequest)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="palette-overlay" @click="closePalette">
      <section class="palette-panel" @click.stop>
        <header class="palette-header">
          <input
            v-model="query"
            type="search"
            placeholder="搜尋頁面、筆記或專案..."
            class="palette-input"
            autofocus
          />
          <kbd class="palette-kbd">Esc</kbd>
        </header>

        <ul class="palette-list" v-if="results.length">
          <li v-for="(item, index) in results" :key="item.id">
            <button
              type="button"
              class="palette-item"
              :class="{ 'is-active': selectedIndex === index }"
              @mouseenter="selectedIndex = index"
              @click="goToSelected(index)"
            >
              <span class="palette-item-title">{{ item.label }}</span>
              <span class="palette-item-desc">{{ item.description }}</span>
            </button>
          </li>
        </ul>

        <p v-else class="palette-empty">找不到符合的內容</p>
      </section>
    </div>
  </Teleport>
</template>
