<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  html: {
    type: String,
    required: true,
  },
})

const articleRef = ref(null)

function handleCopyClick(event) {
  const target = event.target
  if (!(target instanceof HTMLElement) || !target.classList.contains('code-copy-button')) {
    return
  }

  const wrapper = target.closest('.code-block')
  const codeElement = wrapper?.querySelector('pre code')
  if (!codeElement) {
    return
  }

  navigator.clipboard.writeText(codeElement.textContent || '')
  target.textContent = 'Copied'
  window.setTimeout(() => {
    target.textContent = 'Copy'
  }, 1200)
}

async function bindCodeActions() {
  await nextTick()
  const article = articleRef.value
  if (!article) {
    return
  }

  article.removeEventListener('click', handleCopyClick)
  article.addEventListener('click', handleCopyClick)
}

onMounted(bindCodeActions)
watch(() => props.html, bindCodeActions)

onBeforeUnmount(() => {
  articleRef.value?.removeEventListener('click', handleCopyClick)
})
</script>

<template>
  <article ref="articleRef" class="markdown-article" v-html="html" />
</template>
