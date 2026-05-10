<script setup>
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import CommandPalette from '@/components/layout/CommandPalette.vue'
import TweaksPanel from '@/components/layout/TweaksPanel.vue'
</script>

<template>
  <AppHeader />
  <RouterView />
  <AppFooter />
  <TweaksPanel />
  <CommandPalette />
</template>
