---
title: TypeScript學習計畫
date: 2026-05-11
tags: [規劃, 部署, 前端]
summary: 整理「TypeScript學習計畫」主題，重點包含：> 建立時間：2026/03/02   > 目標：在 Phase 2 功能完善期間同步學習，Phase 3 開始時即可進行漸進式遷移
status: 草稿
---

# TypeScript 學習計畫（PrAjeKt Phase 3 前置）

> 建立時間：2026/03/02  
> 目標：在 Phase 2 功能完善期間同步學習，Phase 3 開始時即可進行漸進式遷移  
> 學習方式：Vibe Coding 輔助 + 邊做邊學，不追求一次看完

---

## 📋 大綱

1. [為什麼要學 TypeScript](#1-為什麼要學-typescript)
2. [學習路徑總覽](#2-學習路徑總覽)
3. [Stage 1：TS 核心語法（基礎）](#3-stage-1ts-核心語法基礎)
4. [Stage 2：TS + Vue 3 實戰模式](#4-stage-2ts--vue-3-實戰模式)
5. [Stage 3：TS + Pinia / Composables](#5-stage-3ts--pinia--composables)
6. [Stage 4：TS + Axios / API 層](#6-stage-4ts--axios--api-層)
7. [Stage 5：PrAjeKt 遷移實戰](#7-stage-5prajekt-遷移實戰)
8. [常用速查表](#8-常用速查表)
9. [學習資源](#9-學習資源)
10. [進度追蹤](#10-進度追蹤)

---

## 1. 為什麼要學 TypeScript

### 對 PrAjeKt 的直接好處

| 問題（現在 JS） | TS 解決方式 |
|---------------|------------|
| `task.user_id` 是 number 還是 string？要查 backend model | `Task` interface 定義一次，全專案共享 |
| `timelineService.create(data)` 傳什麼欄位？要翻 API 文件 | 函式簽名直接標明型別，IDE 自動提示 |
| `store.tasks` 裡的每個物件長什麼樣？ | `Ref<Task[]>` 讓 IDE 知道每個欄位 |
| 改欄位名稱要全域搜尋，容易漏 | TS 編譯期間直接報錯，0 漏網之魚 |
| `response.data` 是什麼結構？猜 | 定義 `ApiResponse<T>` 泛型，一眼看穿 |

### 適合遷移的時機（現在最好）
- Phase 0~1 已完成三層架構（Service → Store → View），結構清晰
- 已有 `types/` 資料夾可直接放型別定義
- Phase 2 功能開發前先學好，遷移時不需要邊學邊改

---

## 2. 學習路徑總覽

```
Stage 1   Stage 2       Stage 3            Stage 4        Stage 5
TS 語法  → Vue 3 + TS → Pinia/Composables → Axios/API  → PrAjeKt 遷移
（1~2 天）  （1~2 天）    （1 天）           （1 天）     （Phase 3 時執行）
```

> **原則：不需要全學完再開始遷移，到 Stage 4 後即可邊遷移邊鞏固**

---

## 3. Stage 1：TS 核心語法（基礎）

> 目標：看得懂 TS 程式碼，能寫基本型別標注  
> 時間：1~2 天

### 3-1 基本型別

```typescript
// 原始型別
const name: string = 'Alice'
const age: number = 25
const active: boolean = true

// 陣列
const ids: number[] = [1, 2, 3]
const names: Array<string> = ['a', 'b']  // 等價寫法

// 物件
const user: { id: number; name: string } = { id: 1, name: 'Alice' }

// 函式
function add(a: number, b: number): number {
  return a + b
}

// 可選參數（? 代表可能是 undefined）
function greet(name: string, prefix?: string): string {
  return `${prefix ?? 'Hi'} ${name}`
}
```

### 3-2 Interface vs Type（最常用）

```typescript
// Interface：描述物件形狀，可以 extend
interface User {
  id: number
  name: string
  email: string
  username: string | null  // 可能是 null
  created_at: string
}

// 繼承 interface
interface UserWithRole extends User {
  role: 0 | 1  // 只能是 0 或 1（literal type）
}

// Type alias：更彈性，可以用 union / intersection
type Status = 'todo' | 'in_progress' | 'done'
type Priority = 1 | 2 | 3

// 兩者都可以用 & 合併
type TaskMember = User & { joined_at: string }
```

> **PrAjeKt 慣例：物件形狀用 `interface`，union / literal 用 `type`**

### 3-3 泛型（Generic）— 最重要的概念

```typescript
// 沒有泛型，每種 API response 都要寫一個型別
interface TodoResponse  { todo: Todo }
interface TaskResponse  { task: Task }
// ... 很多重複

// 有泛型，一個型別搞定
interface ApiResponse<T> {
  data: T
  message?: string
}

// 使用
const res: ApiResponse<Todo[]> = await todoService.getAll()
res.data  // 型別是 Todo[]，IDE 自動知道所有欄位

// 函式也可以用泛型
function firstItem<T>(arr: T[]): T | undefined {
  return arr[0]
}
const first = firstItem([1, 2, 3])  // first 型別自動推斷為 number | undefined
```

### 3-4 Union、Intersection、Literal Type

```typescript
// Union（或）— 這個值可能是多種型別之一
type Id = number | string
type MaybeNull<T> = T | null

// Literal type — 只能是特定值（不只是 string，而是特定字串）
type Role = 'owner' | 'member'
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// Intersection（且）— 同時具備多個型別的屬性
type WithTimestamps = { created_at: string; updated_at: string }
type Task = BaseTask & WithTimestamps
```

### 3-5 型別推斷（不需要每個地方都寫型別）

```typescript
// TS 可以自動推斷，不需要每個地方都寫型別
const count = 0           // 自動推斷 count: number
const name = 'Alice'      // 自動推斷 name: string
const items = [1, 2, 3]   // 自動推斷 items: number[]

// 在初始化時給明確值，TS 就能推斷
// 只在「TS 無法推斷」或「需要更嚴格約束」時才手動寫型別
```

### 3-6 Non-null assertion（`!`）和 Optional chaining（`?.`）

```typescript
// Optional chaining：當左側可能是 null/undefined 時
const name = user?.profile?.displayName  // 不確定 profile 存不存在

// Non-null assertion（確定不是 null，告訴 TS 不用擔心）
// 謹慎使用，等於放棄型別保護
const el = document.getElementById('app')!

// Nullish coalescing（?? — 只在 null 或 undefined 時採用預設值）
const title = task.title ?? '未命名任務'
```

### ✅ Stage 1 練習題

1. 幫現有的 `Todo` model 寫出對應的 TS interface（對照 `backend/models/todo.py`）
2. 寫一個 `formatPriority(priority: 1 | 2 | 3): string` 函式
3. 寫一個 `ApiListResponse<T>` 泛型 interface，包含 `items: T[]` 和 `total: number`

---

## 4. Stage 2：TS + Vue 3 實戰模式

> 目標：在 `<script setup lang="ts">` 裡正確使用 TS  
> 時間：1~2 天

### 4-1 `<script setup lang="ts">` 基礎

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Todo } from '@/types'  // 型別 import 加 type 關鍵字

// ref 型別推斷 — TS 自動推斷 todos 是 Ref<Todo[]>
const todos = ref<Todo[]>([])
const loading = ref(false)      // 推斷 Ref<boolean>
const search = ref('')          // 推斷 Ref<string>

// 當初始值給不出型別時，需要手動標注
const selectedTodo = ref<Todo | null>(null)
const count = ref<number>(0)

// computed 自動推斷回傳型別
const pendingTodos = computed(() => todos.value.filter(t => !t.completed))
// pendingTodos 型別自動推斷為 ComputedRef<Todo[]>
</script>
```

### 4-2 Props 定義（最常改動的部分）

```vue
<script setup lang="ts">
// 方法一：defineProps + interface（推薦，有自動補全）
interface Props {
  task: Task
  isOwner: boolean
  mode?: 'view' | 'edit'  // 可選 prop，預設 undefined
}

const props = defineProps<Props>()

// 帶預設值的寫法
const props = withDefaults(defineProps<Props>(), {
  mode: 'view',
  isOwner: false,
})
</script>
```

### 4-3 Emits 定義

```vue
<script setup lang="ts">
// 強型別 emit，IDE 會提示你需要傳什麼參數
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'delete': [id: number]
  'refresh-all': []          // 無參數
  'toggle-task': [id: number, completed: boolean]
}>()

// 使用
emit('delete', task.id)         // ✅ 正確
emit('delete', 'abc')           // ❌ 編譯錯誤：應該是 number
emit('delete')                  // ❌ 編譯錯誤：缺少參數
</script>
```

### 4-4 Template Ref

```vue
<template>
  <input ref="inputRef" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 標注 DOM 元素型別或元件型別
const inputRef = ref<HTMLInputElement | null>(null)

function focus() {
  inputRef.value?.focus()  // 使用 ?. 因為可能是 null
}
</script>
```

### 4-5 事件處理器型別

```vue
<template>
  <input @change="handleChange" @keydown.enter="handleEnter" />
  <form @submit.prevent="handleSubmit" />
</template>

<script setup lang="ts">
// DOM 事件都有對應的 TS 型別
function handleChange(e: Event) {
  const value = (e.target as HTMLInputElement).value
}

function handleSubmit(e: SubmitEvent) {
  // ...
}
</script>
```

### ✅ Stage 2 練習題

1. 將 `TodosView.vue` 的 `<script>` 改寫成 `<script setup lang="ts">`（只做型別標注，邏輯不動）
2. 幫 `TodoItem.vue`（假設要新建）定義 Props interface，包含 `todo: Todo` 和 `onDelete: (id: number) => void`
3. 幫 `TimelineDetailDialog.vue` 的 `defineEmits` 加上完整型別

---

## 5. Stage 3：TS + Pinia / Composables

> 目標：Store 和 Composables 加上正確型別  
> 時間：1 天

### 5-1 Pinia Store（Setup Store 模式）

```typescript
// stores/todos.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Todo, CreateTodoPayload } from '@/types'
import { todoService } from '@/services/todoService'

export const useTodoStore = defineStore('todos', () => {
  // ref 加型別
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // computed 自動推斷
  const completedTodos = computed(() => todos.value.filter(t => t.completed))
  const pendingTodos = computed(() => todos.value.filter(t => !t.completed))

  // 函式加參數/回傳型別
  async function fetchTodos(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await todoService.getAll()
      todos.value = res.data.todos
    } catch (e) {
      error.value = '載入失敗'
    } finally {
      loading.value = false
    }
  }

  async function addTodo(payload: CreateTodoPayload): Promise<Todo> {
    const res = await todoService.create(payload)
    const newTodo = res.data.todo
    todos.value.unshift(newTodo)
    return newTodo
  }

  async function deleteTodo(id: number): Promise<void> {
    await todoService.delete(id)
    todos.value = todos.value.filter(t => t.id !== id)
  }

  return { todos, loading, error, completedTodos, pendingTodos, fetchTodos, addTodo, deleteTodo }
})
```

### 5-2 Composables

```typescript
// composables/useFormatDate.ts
export function useFormatDate() {
  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '無期限'
    return new Date(dateStr).toLocaleDateString('zh-TW')
  }

  function formatDeadline(dateStr: string | null | undefined): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / 86400000)

    if (diffDays < 0) return `逾期 ${Math.abs(diffDays)} 天`
    if (diffDays === 0) return '今天到期'
    return `還有 ${diffDays} 天`
  }

  return { formatDate, formatDeadline }
}

// 在 Vue 元件中使用
// const { formatDate, formatDeadline } = useFormatDate()
```

### 5-3 Composable 回傳型別

```typescript
// composables/useTaskFilters.ts
import type { Task } from '@/types'
import { ref, computed } from 'vue'

interface UseTaskFiltersReturn {
  search: Ref<string>
  selectedStatus: Ref<string>
  filteredTasks: ComputedRef<Task[]>
  resetFilters: () => void
}

export function useTaskFilters(tasks: Ref<Task[]>): UseTaskFiltersReturn {
  const search = ref('')
  const selectedStatus = ref('all')

  const filteredTasks = computed(() =>
    tasks.value.filter(t => {
      const matchSearch = t.title.includes(search.value)
      const matchStatus = selectedStatus.value === 'all' || t.status === selectedStatus.value
      return matchSearch && matchStatus
    })
  )

  function resetFilters() {
    search.value = ''
    selectedStatus.value = 'all'
  }

  return { search, selectedStatus, filteredTasks, resetFilters }
}
```

---

## 6. Stage 4：TS + Axios / API 層

> 目標：Service 層和 API 回應加上型別  
> 時間：1 天

### 6-1 api.ts — Axios 實例型別

```typescript
// services/api.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: false,
})

// 攔截器型別自動推斷，不需要手動標注
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

### 6-2 Types 定義（`types/index.ts`）

```typescript
// types/index.ts — PrAjeKt 專案的核心型別定義

// ===== 使用者 =====
export interface User {
  id: number
  name: string
  username: string | null
  email: string
  phone: string | null
  created_at: string
}

// ===== 待辦事項 =====
export interface Todo {
  id: number
  title: string
  content: string | null
  completed: boolean
  deadline: string | null
  priority: 1 | 2 | 3       // 1:高 2:中 3:低
  order: number | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateTodoPayload {
  title: string
  content?: string
  deadline?: string
  priority?: 1 | 2 | 3
}

// ===== 任務 =====
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  deadline: string | null
  timeline_id: number | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  // 關聯資料（join 後才有）
  role?: 0 | 1
  members?: TaskMember[]
}

export interface TaskMember {
  id: number
  name: string
  role: 0 | 1
}

export interface TaskComment {
  comment_id: number
  task_message: string
  user_id: number
  user_name: string
  created_at: string
}

export interface TaskFile {
  id: number
  original_filename: string
  file_size: number
  created_at: string
}

// ===== 專案（Timeline）=====
export interface Timeline {
  id: number
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  deleted_at: string | null
  created_by: number
  role: 0 | 1    // 當前使用者角色
  created_at: string
}

export interface TimelineMember {
  user_id: number
  name: string
  email: string
  role: 0 | 1
}

// ===== API 回應包裝 =====
export interface ApiResponse<T = unknown> {
  message?: string
  error?: string
  data?: T
}
```

### 6-3 Service 層加型別

```typescript
// services/todoService.ts
import api from './api'
import type { Todo, CreateTodoPayload } from '@/types'
import type { AxiosResponse } from 'axios'

// 定義 API 回傳結構
interface TodosResponse { todos: Todo[] }
interface TodoResponse  { todo: Todo; message: string }

export const todoService = {
  getAll: (): Promise<AxiosResponse<TodosResponse>> =>
    api.get('/todos'),

  getOne: (id: number): Promise<AxiosResponse<Todo[]>> =>
    api.get('/todos', { params: { id } }),

  create: (data: CreateTodoPayload): Promise<AxiosResponse<TodoResponse>> =>
    api.post('/todos', data),

  update: (id: number, data: Partial<CreateTodoPayload>): Promise<AxiosResponse<TodoResponse>> =>
    api.put(`/todos/${id}`, data),

  delete: (id: number): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/todos/${id}`),

  toggle: (id: number): Promise<AxiosResponse<TodoResponse>> =>
    api.patch(`/todos/${id}/toggle`),
}
```

---

## 7. Stage 5：PrAjeKt 遷移實戰

> **在 Phase 3 開始時執行，不要在 Phase 2 功能開發中途遷移**  
> 原則：漸進式，一次一個模組，測試通過再往下

### 遷移順序（由底層到上層）

```
Step 1  types/index.ts          ← 先定義所有型別（無需改其他檔案）
Step 2  utils/formatters.ts     ← 純函式，最簡單
Step 3  services/*.ts           ← 加型別，邏輯不動
Step 4  stores/*.ts             ← 依賴 types + services
Step 5  composables/*.ts        ← 依賴 types
Step 6  components/*.vue        ← 加 lang="ts"，從 common/ 小元件開始
Step 7  views/*.vue             ← 最後，依賴所有上層
```

### Step 1：新建 `types/index.ts`（Day 1）

checklist：
- [ ] 建立 `frontend/src/types/index.ts`
- [ ] 依照 backend models 定義：`User`、`Todo`、`Task`、`Timeline`、`Group`、`Message`
- [ ] 定義 Payload 型別：`CreateTaskPayload`、`UpdateTaskPayload`…
- [ ] 定義常用 union type：`TaskStatus`、`TaskPriority`、`Role`
- [ ] `vite.config.js` 確認 `@` alias 設定（`resolve.alias`）

### Step 2：vite.config.ts + tsconfig.json

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["node_modules"]
}
```

### Step 3：安裝 TS 相關套件

```bash
npm install -D typescript @vue/tsconfig
npm install -D vue-tsc  # Vue 3 專用 TS 型別檢查
```

### 遷移注意事項

| 情境 | 處理方式 |
|------|---------|
| `ref([])` 推斷為 `Ref<never[]>` | 改成 `ref<Todo[]>([])` |
| `response.data` 型別為 `any` | 在 service 函式加回傳型別標注 |
| `v-for` 裡 item 型別為 `any` | 確保 `tasks` 是 `Ref<Task[]>` |
| Props 有 `default: undefined` | 用 `withDefaults` 設定 |
| 舊的 `$refs.xxx` 用法 | 改成 `const xxx = ref<Type>(null)` |
| import 型別 | 加 `import type { ... }` |

---

## 8. 常用速查表

### Vue 3 + TS 型別快速對照

```typescript
// ref
const count = ref<number>(0)
const item = ref<Todo | null>(null)
const list = ref<Todo[]>([])

// computed
const doubled = computed<number>(() => count.value * 2)

// Props
defineProps<{ title: string; count?: number }>()

// Emits
defineEmits<{ 'delete': [id: number]; 'close': [] }>()

// Template ref
const input = ref<HTMLInputElement | null>(null)
const modal = ref<InstanceType<typeof MyModal> | null>(null)

// watch
watch(
  () => props.taskId,
  (newId: number, oldId: number) => { /* ... */ }
)
```

### 常用 TS 工具型別

```typescript
Partial<Todo>        // 所有欄位變可選（update payload 常用）
Required<Todo>       // 所有欄位變必填
Pick<Todo, 'id' | 'title'>   // 只取部分欄位
Omit<Todo, 'created_at'>     // 排除某欄位
Record<string, number>       // key-value 物件
ReturnType<typeof fetchTodo> // 函式回傳型別
```

---

## 9. 學習資源

### 官方文件（直接看 + Vibe Coding 輔助）

| 資源 | 用途 |
|------|------|
| [TS Handbook](https://www.typescriptlang.org/docs/handbook/) | 核心概念，建議 Stage 1 看 Everyday Types 章節 |
| [Vue 3 + TS 官方指南](https://vuejs.org/guide/typescript/overview) | Vue 專屬用法，Stage 2 必看 |
| [Pinia + TS](https://pinia.vuejs.org/core-concepts/#setup-stores) | Store 型別，Stage 3 用 |

### 學習策略（Vibe Coding 風格）

1. **先看範例，再寫型別**：把現有 JS 檔 +  「幫我加 TS 型別」丟給 Copilot，看它怎麼改，理解後自己改
2. **錯誤驅動學習**：開啟 `strict: true` 讓 IDE 報錯，逐一修正，每個錯誤都是學習點
3. **不求完美**：遇到不會的型別先用 `// @ts-ignore` 或 `as unknown` 跳過，之後再補
4. **PrAjeKt 就是練習場**：Stage 5 的遷移本身就是最好的練習

---

## 10. 進度追蹤

### Stage 學習進度

| Stage | 內容 | 狀態 | 完成日 |
|-------|------|------|--------|
| Stage 1 | TS 核心語法（型別、interface、泛型）| ⬜ | — |
| Stage 2 | Vue 3 + TS（script setup、Props、Emits）| ⬜ | — |
| Stage 3 | Pinia + Composables 型別標注 | ⬜ | — |
| Stage 4 | Axios / API 層型別設計 | ⬜ | — |
| Stage 5 | PrAjeKt 遷移實戰（Phase 3 時執行）| ⬜ | — |

### Phase 3 遷移進度（建立後更新）

| 模組 | 狀態 | 備註 |
|------|------|------|
| `types/index.ts` | ⬜ | — |
| `utils/formatters.ts` | ⬜ | — |
| `services/api.ts` | ⬜ | — |
| `services/todoService.ts` | ⬜ | — |
| `services/taskService.ts` | ⬜ | — |
| `services/timelineService.ts` | ⬜ | — |
| `services/trashService.ts` | ⬜ | — |
| `services/groupService.ts` | ⬜ | — |
| `services/profileService.ts` | ⬜ | — |
| `stores/auth.ts` | ⬜ | — |
| `stores/todos.ts` | ⬜ | — |
| `stores/tasks.ts` | ⬜ | — |
| `stores/timelines.ts` | ⬜ | — |
| `components/common/*.vue` | ⬜ | — |
| `components/timelines/*.vue` | ⬜ | — |
| `views/*.vue` | ⬜ | — |
