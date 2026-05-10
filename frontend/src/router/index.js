import { createRouter, createWebHistory } from 'vue-router'

import AboutView from '@/views/AboutView.vue'
import HomeView from '@/views/HomeView.vue'
import NoteDetailView from '@/views/NoteDetailView.vue'
import NotesView from '@/views/NotesView.vue'
import ProjectDetailView from '@/views/ProjectDetailView.vue'
import ProjectsView from '@/views/ProjectsView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/projects', name: 'projects', component: ProjectsView },
  { path: '/projects/:slug/:docSlug?', name: 'project-detail', component: ProjectDetailView, props: true },
  { path: '/notes', name: 'notes', component: NotesView },
  { path: '/notes/:slug', name: 'note-detail', component: NoteDetailView, props: true },
  { path: '/about', name: 'about', component: AboutView },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
