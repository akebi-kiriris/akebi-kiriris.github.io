---
title: Header用戶名問題筆記
date: 2026-05-11
tags: [前端, 學習筆記]
summary: 記錄「Header用戶名問題筆記」相關內容：登入後切換畫面，Header 的用戶名會變回預設「使用者」，而不是正確的登入者名稱。 const userName = computed(() => authStore.user?...
status: 草稿
---

# Header 用戶名顯示異常問題紀錄

## 問題描述
登入後切換畫面，Header 的用戶名會變回預設「使用者」，而不是正確的登入者名稱。

---

## 初始代碼

### Header.vue
```js
const userName = computed(() => authStore.user?.name || '使用者');
```

### App.vue
（無自動刷新 user 狀態的邏輯）

### stores/auth.js
```js
async login(email, password) {
  ...
  this.user = response.data.user;
  ...
}
```

---

## 修改後代碼

### Header.vue
```js
const userName = computed(() => authStore.currentUser?.name || '使用者');
```

### App.vue
```js
import { computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
...
const route = useRoute();
...
watch(
  () => route.fullPath,
  async () => {
    if (authStore.isAuthenticated && !authStore.user) {
      await authStore.fetchCurrentUser();
    }
  },
  { immediate: true }
);
```

### stores/auth.js
```js
async login(email, password) {
  ...
  this.user = response.data.user;
  ...
  await this.fetchCurrentUser(); // 登入後立即刷新 user 狀態
}
```

---

## 問題原因與解釋

- **Pinia store 的 user 狀態在頁面刷新或路由切換時未自動同步**，導致 Header 取得的 user 變成 null 或預設值。
- **Header.vue 原本直接讀取 state.user，未透過 getter，且未保證響應式更新。**
- **App.vue 未在路由切換時自動 fetch user，登入後也未強制刷新 user 狀態。**

### 解決方式
1. Header 改用 getter（currentUser）確保響應式。
2. App.vue 監聽路由切換，自動 fetchCurrentUser，確保每次切換都能取得正確 user。
3. 登入成功後立即 fetchCurrentUser，避免初次登入時 user 為空。

---

## 結論
這些修改確保 Header 用戶名在登入、切換畫面、刷新頁面時都能正確顯示。
