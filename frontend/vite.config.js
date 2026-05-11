import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isUserSiteRepo = repoName?.toLowerCase().endsWith('.github.io')
const base = process.env.GITHUB_ACTIONS ? (isUserSiteRepo ? '/' : `/${repoName}/`) : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
