<script setup>
import { computed, ref } from 'vue'

import { useNotes } from '@/composables/useNotes'
import { useProjects } from '@/composables/useProjects'

const { notes, tags: noteTags } = useNotes()
const { projects } = useProjects()
const query = ref('')
const selectedTag = ref('全部')
const showAllTags = ref(false)

const learningProject = computed(() => projects.find((project) => project.slug === '學習筆記'))
const learningProjectDocs = computed(() => {
  const project = learningProject.value
  if (!project) {
    return []
  }

  return project.documents.map((doc) => ({
    ...doc,
    projectSlug: project.slug,
    projectTitle: project.title,
    mergedTags: [...new Set([...(project.tags || []), ...(doc.tags || [])])],
  }))
})
const projectTags = computed(() => [...new Set(learningProjectDocs.value.flatMap((doc) => doc.mergedTags || []))])
const tags = computed(() => [...new Set([...noteTags, ...projectTags.value])])

const noteItems = computed(() => [
  ...learningProjectDocs.value.map((doc) => ({
    ...doc,
    id: `project-${doc.projectSlug}-${doc.slug}`,
    type: '筆記',
    to: `/projects/${doc.projectSlug}/${doc.slug}`,
    tags: doc.mergedTags || [],
    source: doc.projectTitle,
  })),
  ...notes.map((note) => ({
    ...note,
    id: `note-${note.slug}`,
    type: '筆記',
    to: `/notes/${note.slug}`,
    source: 'Kiriris',
  })),
].sort((a, b) => (b.date || '').localeCompare(a.date || '')))

const filteredItems = computed(() => {
  const term = query.value.trim().toLowerCase()
  const byTag =
    selectedTag.value === '全部'
      ? noteItems.value
      : noteItems.value.filter((item) => item.tags.includes(selectedTag.value))

  if (!term) {
    return byTag
  }

  return byTag.filter((item) => {
    const haystack = [
      item.title,
      item.summary,
      item.body,
      item.source,
      item.type,
      ...(item.tags || []),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(term)
  })
})

const groupedItems = computed(() => {
  return filteredItems.value.reduce((groups, item) => {
    const year = getYear(item.date)
    const existing = groups.find((group) => group.year === year)

    if (existing) {
      existing.items.push(item)
    } else {
      groups.push({ year, items: [item] })
    }

    return groups
  }, [])
})

const tagCounts = computed(() => {
  return noteItems.value
    .flatMap((item) => item.tags || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {})
})

const popularTags = computed(() =>
  Object.entries(tagCounts.value)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
)

const visibleTags = computed(() => (showAllTags.value ? popularTags.value : popularTags.value.slice(0, 9)))
const hiddenTagCount = computed(() => Math.max(popularTags.value.length - visibleTags.value.length, 0))
const latestItems = computed(() => noteItems.value.slice(0, 5))
const noteCountText = computed(() => `${filteredItems.value.length} / ${noteItems.value.length}`)

function getYear(date = '') {
  return date?.slice(0, 4) || '未分類'
}

function formatDate(date = '') {
  if (!date) {
    return '--/--'
  }

  const [, , month, day] = date.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?$/) || []
  if (!month) {
    return date
  }

  return day ? `${month.padStart(2, '0')}/${day.padStart(2, '0')}` : `${month.padStart(2, '0')} 月`
}
</script>

<template>
  <main class="content-shell py-8 md:py-12">
    <section class="creator-band flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="meta-text">筆記</p>
        <h1 class="mt-2 font-display text-4xl leading-tight text-ink md:text-6xl">
          技術學習與實作紀錄
        </h1>
        <p class="mt-3 max-w-3xl text-base leading-7 text-muted md:text-lg">
          這裡收錄 Markdown 筆記、實驗紀錄、除錯過程，以及每次決策背後的理由。
        </p>
      </div>
      <div class="grid grid-cols-3 gap-3 text-center md:min-w-72">
        <div class="soft-surface px-3 py-3">
          <p class="text-2xl font-semibold text-ink">{{ noteItems.length }}</p>
          <p class="mt-1 text-xs text-muted">文章</p>
        </div>
        <div class="soft-surface px-3 py-3">
          <p class="text-2xl font-semibold text-ink">{{ tags.length }}</p>
          <p class="mt-1 text-xs text-muted">標籤</p>
        </div>
        <div class="soft-surface px-3 py-3">
          <p class="text-2xl font-semibold text-ink">{{ groupedItems.length }}</p>
          <p class="mt-1 text-xs text-muted">年份</p>
        </div>
      </div>
    </section>

    <section class="mt-6 grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)_18rem]">
      <aside class="grid content-start gap-4 lg:sticky lg:top-24 lg:self-start">
        <section class="surface-panel">
          <p class="meta-text">搜尋</p>
          <input
            v-model="query"
            type="search"
            placeholder="搜尋筆記與專案筆記"
            aria-label="搜尋筆記與專案筆記"
            class="mt-3 min-h-11 w-full rounded-sm border border-line bg-paper px-3 text-sm text-ink outline-none transition focus:ring-2 focus:ring-moss/35"
          />
          <p class="mt-3 text-xs text-muted">目前顯示 {{ noteCountText }} 篇</p>
        </section>

        <section class="surface-panel">
          <div class="flex items-center justify-between gap-3">
            <p class="meta-text">標籤</p>
            <button
              type="button"
              class="text-xs font-semibold text-muted transition hover:text-ink"
              @click="selectedTag = '全部'"
            >
              全部
            </button>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="[tag, count] in visibleTags"
              :key="tag"
              :class="[
                'inline-flex min-h-8 items-center gap-2 rounded-sm border px-2.5 text-sm transition',
                selectedTag === tag
                  ? 'border-moss bg-moss text-paper'
                  : 'border-line bg-paper text-muted hover:border-moss hover:text-ink',
              ]"
              type="button"
              @click="selectedTag = tag"
            >
              <span>{{ tag }}</span>
              <span
                :class="[
                  'rounded-sm px-1.5 text-[11px]',
                  selectedTag === tag ? 'bg-paper/20 text-paper' : 'bg-paper-soft text-muted',
                ]"
              >
                {{ count }}
              </span>
            </button>
          </div>
          <button
            v-if="popularTags.length > 9"
            type="button"
            class="mt-3 w-full border-t border-line pt-3 text-xs font-semibold text-muted transition hover:text-ink"
            @click="showAllTags = !showAllTags"
          >
            {{ showAllTags ? '收合標籤' : `展開更多 ${hiddenTagCount} 個` }}
          </button>
        </section>
      </aside>

      <section class="surface-panel px-0 py-0">
        <div class="border-b border-line px-5 py-4">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="meta-text">Archive</p>
              <h2 class="mt-1 font-display text-3xl text-ink">文章索引</h2>
            </div>
            <p class="text-sm text-muted">依日期排序，專案筆記與短筆記合併瀏覽</p>
          </div>
        </div>

        <div v-if="groupedItems.length" class="divide-y divide-line">
          <section
            v-for="group in groupedItems"
            :key="group.year"
            class="grid gap-0 px-5 py-4 md:grid-cols-[7rem_minmax(0,1fr)]"
          >
            <div class="pb-3 md:pb-0">
              <p class="font-display text-[2rem] font-bold leading-none text-ink">{{ group.year }}</p>
              <p class="mt-1 text-xs text-muted">{{ group.items.length }} 篇文章</p>
            </div>

            <div
              class="relative grid gap-0 border-line md:pl-8 md:before:absolute md:before:inset-y-2 md:before:left-0 md:before:w-px md:before:bg-line"
            >
              <RouterLink
                v-for="item in group.items"
                :key="item.id"
                :to="item.to"
                class="group relative grid gap-2 rounded-sm px-0 py-2.5 no-underline transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-paper-soft/70 hover:shadow-sm sm:grid-cols-[3.75rem_minmax(0,1fr)_minmax(7rem,10rem)] sm:px-3"
              >
                <time
                  :datetime="item.date"
                  class="text-sm font-medium tabular-nums text-muted transition-colors duration-200 group-hover:text-moss sm:text-right"
                >
                  {{ formatDate(item.date) }}
                </time>

                <div class="relative min-w-0">
                  <div class="flex min-w-0 flex-wrap items-center gap-2">
                    <span class="rounded-sm bg-paper-soft px-2 py-1 text-[11px] font-bold text-clay transition-colors duration-200 group-hover:bg-paper group-hover:text-moss">
                      {{ item.type }}
                    </span>
                    <h3 class="min-w-0 text-base font-bold leading-6 text-ink transition-colors duration-200 group-hover:text-moss">
                      {{ item.title }}
                    </h3>
                  </div>
                  <p class="mt-0.5 line-clamp-1 text-sm leading-6 text-muted transition-colors duration-200 group-hover:text-ink">
                    {{ item.summary || '點擊查看完整內容' }}
                  </p>
                </div>

                <div class="hidden min-w-0 justify-self-end text-right text-xs leading-5 text-muted/75 transition-colors duration-200 group-hover:text-muted sm:block">
                  <p class="truncate">{{ item.source }}</p>
                  <p class="truncate">{{ item.tags.slice(0, 3).map((tag) => `#${tag}`).join(' ') }}</p>
                </div>
              </RouterLink>
            </div>
          </section>
        </div>

        <div v-else class="px-5 py-14 text-center">
          <p class="font-display text-2xl text-ink">沒有找到符合條件的筆記</p>
          <p class="mt-2 text-sm text-muted">換個關鍵字或清掉標籤篩選看看。</p>
        </div>
      </section>

      <aside class="hidden content-start gap-4 xl:grid xl:sticky xl:top-24 xl:self-start">
        <section class="surface-panel">
          <div class="flex items-center justify-between border-b border-line pb-2">
            <p class="meta-text">最新文章</p>
            <span class="text-xs text-muted">{{ latestItems.length }}</span>
          </div>
          <nav class="mt-2 grid" aria-label="最新文章目錄">
            <RouterLink
              v-for="item in latestItems"
              :key="`latest-${item.id}`"
              :to="item.to"
              class="group grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 border-b border-line py-2.5 text-sm no-underline transition-all duration-200 ease-out last:border-b-0 hover:translate-x-1"
            >
              <span class="pt-0.5 text-xs tabular-nums text-muted transition-colors duration-200 group-hover:text-moss">{{ formatDate(item.date) }}</span>
              <span class="min-w-0">
                <span class="block truncate font-semibold leading-5 text-ink transition-colors duration-200 group-hover:text-moss">{{ item.title }}</span>
                <span class="block text-xs text-muted transition-colors duration-200 group-hover:text-ink">{{ item.type }}</span>
              </span>
            </RouterLink>
          </nav>
        </section>

        <section class="surface-panel">
          <p class="meta-text">目前篩選</p>
          <div class="mt-3 grid gap-2 text-sm text-muted">
            <p>標籤：<span class="font-semibold text-ink">{{ selectedTag }}</span></p>
            <p>關鍵字：<span class="font-semibold text-ink">{{ query || '無' }}</span></p>
          </div>
        </section>
      </aside>
    </section>
  </main>
</template>
