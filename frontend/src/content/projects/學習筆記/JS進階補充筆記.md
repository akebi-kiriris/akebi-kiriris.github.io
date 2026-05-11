---
title: JS進階補充筆記
date: 2026-03-14
tags: [前端, 除錯, 學習筆記]
summary: 整理「JS進階補充筆記」主題，重點包含：> 建立時間：2026/03/04   > 最後更新：2026/03/08
status: 草稿
---

# JavaScript 進階補充筆記

> 建立時間：2026/03/04  
> 最後更新：2026/03/08  
> 目標：補強 TypeScript 學習前的 JS 基礎缺口  
> 學習順序：非同步 → 閉包 → **物件與 new** → Class → 解構進階 → 錯誤處理

---

## 📋 大綱

1. [非同步完整鏈（Promise / async/await）](#1-非同步完整鏈)
2. [Closure 閉包](#2-closure-閉包)
3. [物件建立與 new 關鍵字（含 this）](#3-物件建立與-new-關鍵字)
4. [Class 與原型](#4-class-與原型)
5. [解構與 Spread 進階](#5-解構與-spread-進階)
6. [錯誤處理模式](#6-錯誤處理模式)

---

## 前言：這些概念你為什麼會覺得難？

初學者在看完基本的 JS（變數、陣列、函式）之後，下一關就是這些「進階」概念。
它們難的原因通常不是語法複雜，而是：

- **看不出來「為什麼要這樣設計」**（例如 Promise 為什麼要存在？）
- **說明跳過了你不知道自己不懂的前提**（例如講閉包時假設你懂 scope）
- **沒有對應到你實際寫過的程式碼**（例如 `new` 在哪用到？）

這份筆記的目標：每個概念都從「為什麼需要它」開始，再說「它是什麼」，最後對照 PrAjeKt 裡的實際程式碼。

---

---

## 1. 非同步完整鏈

### 1-0 先搞懂：「同步」和「執行緒」是什麼？

在學非同步之前，需要先對兩個概念有感覺：

**執行緒（Thread）**：想像成一個工人，一次只能做一件事，做完才能接下一件。  
**JavaScript 是單執行緒**：只有一個工人，同一時間只能跑一段程式碼。

問題來了：如果你叫這個工人去網路上下載一個檔案，他得站在那裡等，什麼都做不了。
使用者的畫面就會完全凍住，無法點擊、無法滾動——這在實際產品裡是絕對不能接受的。

**非同步的解法**：讓工人「發出請求後先去做別的事」，等結果回來再來處理。

```
同步（Synchronous）          非同步（Asynchronous）
─────────────────────────    ──────────────────────────────────────
發請求
   ↓
等待中（畫面凍住）           發請求
等待中                          ↓
等待中（2 秒過去了）         繼續執行其他程式碼 → 更新 UI → 處理事件
   ↓                             ↓
收到結果                     2 秒後：收到結果 → 處理結果
   ↓
繼續
```

---

### 1-1 Callback（最古老的寫法，理解用）

最早的非同步不用 Promise，用「回呼函式（callback）」。

```js
// 「等 1 秒後做某件事」就是典型的非同步
setTimeout(() => {
  console.log('1 秒後才印這行');
}, 1000);
console.log('我先印');  // ← 這行會先跑

// 輸出：
// 我先印
// 1 秒後才印這行
```

問題在於，當你需要多個連續的非同步操作，callback 會疊成「末日金字塔」（Callback Hell）：

```js
// ❌ Callback Hell：越疊越深，根本看不懂在做什麼
getUser(userId, function(user) {
  getProfile(user.id, function(profile) {
    getAvatar(profile.avatarId, function(avatar) {
      uploadAvatar(avatar.url, function(result) {
        // 這裡已經縮排 4 層了，還要繼續...
        updateUser(user.id, result.newUrl, function(updatedUser) {
          console.log('終於完成了', updatedUser);
        });
      });
    });
  });
});
```

這就是 Promise 出現的原因。

---

### 1-2 Promise 是什麼？

**Promise**（承諾）代表「一個未來才會知道結果的操作」。  
它的核心概念是：**把「等待的結果」包裝成一個物件**，讓你可以用 `.then()` 串接後續動作，而不是一層一層嵌套 callback。

Promise 有三種狀態：
- `pending`（等待中）— 還沒結果
- `fulfilled`（成功）— 操作成功，有回傳值
- `rejected`（失敗）— 操作失敗，有錯誤訊息

**重要**：狀態只會變一次，一旦變成 fulfilled 或 rejected，就永遠不會再變。

```js
// 手動建立 Promise（理解原理用，實務上不常手寫）
const p = new Promise((resolve, reject) => {
  //                  ↑         ↑
  //                成功呼叫   失敗呼叫

  // 這裡寫非同步操作
  setTimeout(() => {
    const success = true;

    if (success) {
      resolve('成功的資料');     // 狀態變成 fulfilled，值是 '成功的資料'
    } else {
      reject(new Error('出錯了'));  // 狀態變成 rejected，值是 Error
    }
  }, 1000);
});

// 用 .then 接成功結果，.catch 接失敗
p.then(data => {
  console.log('成功：', data);  // '成功：成功的資料'
}).catch(err => {
  console.error('失敗：', err.message);
});
```

用 Promise 改寫上面的 callback hell：

```js
// ✅ Promise chain：比 callback hell 好讀很多
getUser(userId)
  .then(user => getProfile(user.id))
  .then(profile => getAvatar(profile.avatarId))
  .then(avatar => uploadAvatar(avatar.url))
  .then(result => updateUser(userId, result.newUrl))
  .then(updatedUser => console.log('完成', updatedUser))
  .catch(err => console.error('某個步驟失敗：', err));
```

---

### 1-3 async / await（最常用的寫法）

`async/await` 是 Promise 的「語法糖」——背後還是 Promise，但程式碼看起來像同步，讀起來更直觀。

- **`async function`**：讓這個函式「自動把回傳值包成 Promise」
- **`await`**：「等這個 Promise 解決後，給我結果」，只能用在 `async` 函式內

```js
// Promise chain 寫法（上面的最後版）
function fetchUserData() {
  return api.get('/user')
    .then(res => res.data)
    .catch(err => console.error(err));
}

// async/await 寫法（PrAjeKt 全站用這種）
async function fetchUserData() {
  try {
    const res = await api.get('/user');  // 等到 API 回應
    return res.data;                     // 自動包成 Promise
  } catch (err) {
    console.error(err);
  }
}
```

**為什麼 async/await 更受歡迎？**

```js
// 想一下，如果有 5 個連續步驟，Promise chain vs async/await：

// Promise chain：
function process() {
  return step1()
    .then(a => step2(a))
    .then(b => step3(b))
    .then(c => step4(c))
    .then(d => {
      return d.result;
    });
}

// async/await：像在寫同步程式碼，邏輯一目了然
async function process() {
  const a = await step1();
  const b = await step2(a);
  const c = await step3(b);
  const d = await step4(c);
  return d.result;
}
```

**⚠️ 最常見的錯誤：忘記寫 `await`**

```js
async function wrong() {
  const res = api.get('/user');  // 沒有 await！
  console.log(res);              // Promise { <pending> }，不是資料！
  console.log(res.data);         // undefined，因為 res 是 Promise 物件
}

async function correct() {
  const res = await api.get('/user');  // ✅ 等待結果
  console.log(res.data);               // 真正的資料
}
```

**⚠️ 另一個常見錯誤：await 只能在 async 函式內用**

```js
// ❌ 這樣會報錯
function notAsync() {
  const data = await fetch('/api');  // SyntaxError: await 只能在 async 函式裡
}

// ✅ 要加 async
async function isAsync() {
  const data = await fetch('/api');  // OK
}
```

---

---

### 1-4 Promise 的四個靜態方法

這四個方法都是「同時發出多個 Promise，然後決定怎麼處理結果」。

#### `Promise.all` — 全部成功才繼續，任一失敗就中斷

**使用情境**：多個 API 請求彼此有依賴，或者全部成功才有意義。

```js
async function loadDashboard() {
  try {
    // 三個請求「同時發出」（不是依序），等全部都回來
    const [usersRes, statsRes, tasksRes] = await Promise.all([
      api.get('/users'),
      api.get('/stats'),
      api.get('/tasks'),
    ]);
    // 三個都成功才會跑到這裡
    console.log(usersRes.data, statsRes.data, tasksRes.data);
  } catch (err) {
    // 任一個失敗就到這裡，其他的結果丟棄
    console.error('有一個請求失敗了：', err);
  }
}
```

#### `Promise.allSettled` — 全部結束才繼續，不管成功或失敗（PrAjeKt 有用到）

**使用情境**：多個 API 互相獨立，某個失敗不影響其他，想知道每個的結果。

```js
// PrAjeKt 的 openTaskDetail 就用這個：
const [commentsResult, filesResult, subtasksResult] = await Promise.allSettled([
  taskService.getComments(taskId),
  taskService.getFiles(taskId),
  taskService.getSubtasks(taskId),
]);

// 每個結果有 .status 和 .value（成功）或 .reason（失敗）
if (commentsResult.status === 'fulfilled') {
  detailComments.value = commentsResult.value.data;   // 成功，取出資料
}
if (filesResult.status === 'rejected') {
  console.warn('附件載入失敗，但不影響留言顯示');   // 失敗，但繼續
}
```

**為什麼不用 `Promise.all`？**  
因為如果附件 API 掛掉，留言和子任務都還是能正常顯示。
用 `Promise.all` 的話任一失敗就全跳 catch，體驗很差。

#### `Promise.race` — 最快的那個決定結果

**使用情境**：設定超時（timeout）。

```js
function withTimeout(promise, ms) {
  // 這是一個「永遠在 ms 毫秒後 reject」的 Promise
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`超過 ${ms}ms 沒回應`)), ms)
  );
  // 兩個 Promise 賽跑，先完成的贏
  return Promise.race([promise, timeout]);
}

// 5 秒內沒回應就拋錯
const data = await withTimeout(api.get('/slow-endpoint'), 5000);
```

#### `Promise.any` — 任一成功就繼續，全部失敗才失敗

**使用情境**：有多個備援 API，哪個快用哪個。

```js
const data = await Promise.any([
  fetch('https://primary-api.com/data'),
  fetch('https://backup-api.com/data'),
]);
// 哪個先成功就用哪個，另一個的結果直接忽略
```

---

### 1-5 非同步的執行順序（Event Loop，面試常考）

這個主題稍微複雜一點，但對理解「為什麼程式碼執行順序不如預期」很有幫助。

**核心概念**：JS 有三個「佇列」，依序執行：

1. **同步程式碼**（Call Stack）：直接執行，沒有任何延遲
2. **Microtask queue**：Promise `.then()`、`await` 後的程式碼
3. **Macrotask queue**：`setTimeout`、`setInterval`

每次同步程式碼跑完，先清空所有 microtask，才處理一個 macrotask，然後再清空 microtask...

```js
console.log('1');                                   // 同步

setTimeout(() => console.log('2'), 0);              // Macrotask（即使 0ms 也排後面）

Promise.resolve().then(() => console.log('3'));     // Microtask

console.log('4');                                   // 同步

// 執行順序：1 → 4 → 3 → 2
//
// 解析：
// 同步程式碼先跑完：印 1、印 4
// → 清空 microtask：印 3（Promise.then）
// → 處理 macrotask：印 2（setTimeout）
```

**為什麼要知道這個？**
在 PrAjeKt 裡，有時候你會發現 store 裡的資料更新了，但畫面還沒更新；
或者 `console.log` 印出的值跟你預期不一樣。理解執行順序可以幫你找到這些 bug。

---

### 1-6 async 函式回傳的是 Promise

這點很多人忽略，但它影響你怎麼呼叫 async 函式：

```js
async function getData() {
  return 42;   // 你以為回傳數字
}

const result = getData();
console.log(result);         // Promise { 42 }  ← 不是 42！
console.log(await result);   // 42  ← 要 await 才拿得到

// 正確用法：呼叫 async 函式也要 await
const value = await getData();   // ✅ value = 42

// 在 Pinia store 裡你會看到：
async function fetchTasks() {
  const res = await taskService.getAll();
  tasks.value = res.data;
}
// 呼叫時也要 await：
await fetchTasks();              // ✅ 等待資料載入完才繼續
fetchTasks();                    // ⚠️ 不 await 的話，下一行可能在資料載入前就跑了
```

---

## 2. Closure 閉包

### 2-0 先搞懂：什麼是 Scope（作用域）？

**閉包的核心是 Scope（作用域）**，所以要先確認這個概念。

**Scope** 決定「這個變數在哪裡可以被存取」。

```js
// 全域 scope：在任何地方都能存取
let globalVar = '我是全域的';

function outer() {
  // Function scope：只在 outer 內可以存取
  let outerVar = '我是 outer 的';

  function inner() {
    // inner 可以存取「自己的」和「所有外層」的變數
    let innerVar = '我是 inner 的';
    console.log(innerVar);   // ✅ 自己的
    console.log(outerVar);   // ✅ 外層的
    console.log(globalVar);  // ✅ 全域的
  }

  inner();
  console.log(innerVar);     // ❌ ReferenceError：inner 的東西外層看不到
}
```

規則：**內層可以看到外層，外層看不到內層。**

---

### 2-1 什麼是 Closure？

- **閉包**：函式能「記住」自己被建立時所處的 scope 中的變數
- 即使外層函式已經執行完畢，內層函式仍然可以存取（並修改）那些變數
- 本質：函式 + 它「夾帶」的 scope 一起打包

```js
function makeCounter() {
  let count = 0;   // 這個變數在 makeCounter 執行完後「理論上應該消失」

  // 但因為 inner 函式「閉包住」了 count，所以 count 不會消失
  return function inner() {
    count++;
    return count;
  };
}

const counter = makeCounter();  // makeCounter 執行完了，count 應該消失...
console.log(counter());  // 1   ← 但 count 還在！inner 閉包住了它
console.log(counter());  // 2
console.log(counter());  // 3

const counter2 = makeCounter();  // 全新的 makeCounter 呼叫，全新的 count
console.log(counter2());  // 1   ← 跟 counter 的 count 互不干擾
console.log(counter());   // 4   ← counter 自己的 count 繼續往上
```

**為什麼有用？**

當你想讓某個「狀態（state）」只被特定的函式存取和修改，而不暴露在全域：

```js
// 沒有閉包：count 是全域變數，任何地方都能改它
let count = 0;
function increment() { count++; }
count = 9999;  // 任何程式碼都能直接篡改

// 有閉包：count 只有 increment 能動
const { increment, getCount } = (function() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count,
  };
})();
// 現在沒有任何辦法直接存取 count，只能透過這兩個函式
```


---

### 2-2 Closure 在 PrAjeKt 裡的應用

#### Token 刷新機制（`api.js`）

這是一個很典型的閉包應用：多個函式共同「閉包住」一份共享狀態。

```js
// 這幾個變數是閉包的核心——它們活在 module scope，被下面所有函式閉包住
let isRefreshing = false;   // 「是否正在刷新 token」狀態
let failedQueue = [];       // 刷新期間等待的請求列表

// processQueue 是閉包：它能存取（並修改）外部的 failedQueue
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];   // 修改外部的 failedQueue
};

// 攔截器函式也是閉包：能存取 isRefreshing 和 failedQueue
api.interceptors.response.use(null, async (error) => {
  if (isRefreshing) {
    // 正在刷新中，把這個失敗的請求加入佇列
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });  // 存取外層的 failedQueue
    });
  }
  isRefreshing = true;   // 修改外層的 isRefreshing，通知其他請求「在等了」
  // ...刷新 token 的邏輯...
});
```

**理解重點**：`processQueue` 和 `interceptors` 這兩個函式，都能讀取和修改
`isRefreshing` 和 `failedQueue`，即使它們是在不同地方定義的。
這就是閉包讓「共享狀態」成為可能。

#### Pinia Store 本質上也是閉包

```js
// defineStore 的 setup function 執行後，
// 裡面的 ref/reactive 變數被 return 出來的方法「閉包住」
export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([]);          // ← 這個狀態被閉包住

  async function fetchTasks() {
    const res = await taskService.getAll();
    tasks.value = res.data;       // ← fetchTasks 閉包住了 tasks
  }

  function addTask(task) {
    tasks.value.push(task);       // ← addTask 也閉包住了 tasks
  }

  return { tasks, fetchTasks, addTask };
});
// tasks 這個變數活在 store 裡，fetchTasks 和 addTask 都能永遠存取它
```

---

### 2-3 常見的 Closure 陷阱：var 的迴圈問題

這是面試最常出現的閉包題，也是一個非常直觀的例子：

```js
// ❌ 經典 Bug：var 的閉包問題
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 你預期輸出：0 1 2
// 實際輸出：3 3 3

// 為什麼？
// var 沒有 block scope（不受 {} 限制），迴圈裡的 i 其實是同一個 i
// setTimeout 的函式都「閉包住同一個 i」
// 等 setTimeout 觸發時，迴圈已跑完，i = 3，所以三個都印 3
```

```js
// ✅ 解法一：用 let（有 block scope，每次迴圈都是新的 i）
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 輸出：0 1 2 ✅
// let 每次迴圈建立新的 i，三個 setTimeout 各自閉包不同的 i

// ✅ 解法二：用 IIFE 建立新 scope（老寫法，能看懂就好）
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 100))(i);
  //  ↑ 立即執行函式，把當下的 i 複製成 j，每次迴圈有自己的 j
}
```

**結論**：現代 JS 應該用 `let` 和 `const`，幾乎不用 `var`。

---

### 2-4 Closure 的實用模式

```js
// 模式一：工廠函式（Factory）— 根據參數客製化行為
function createMultiplier(factor) {
  return (number) => number * factor;  // 閉包住 factor
}

const double = createMultiplier(2);   // factor = 2 被閉包住
const triple = createMultiplier(3);   // factor = 3 被閉包住

double(5);  // 10
triple(5);  // 15
double(8);  // 16  （double 的 factor 還是 2）

// 模式二：私有變數（封裝）— 不想讓外部直接修改內部狀態
function createUser(name) {
  let loginCount = 0;  // 外部無法直接存取（私有）

  return {
    getName: () => name,
    login: () => {
      loginCount++;
      console.log(`${name} 已登入 ${loginCount} 次`);
    },
    getLoginCount: () => loginCount,
  };
}

const user = createUser('Alice');
user.login();               // Alice 已登入 1 次
user.login();               // Alice 已登入 2 次
user.getLoginCount();       // 2  （只能透過方法讀取）
console.log(user.loginCount);  // undefined  （無法直接存取）
```

---

## 3. 物件建立與 new 關鍵字

> 這個章節是新增的。Class 是建立在「物件」和 `new` 的概念上的，  
> 先搞懂這裡，Class 章節就會輕鬆很多。

### 3-0 JS 的「物件」究竟是什麼？

在 JS 裡，**物件（Object）** 就是一組「鍵值對（key-value pairs）」的集合：

```js
// 這就是一個物件
const user = {
  name: 'Alice',        // 屬性（property），值是字串
  age: 25,              // 屬性，值是數字
  greet: function() {   // 屬性，值是函式（這種叫「方法 method」）
    console.log(`Hi, I'm ${this.name}`);
  },
};

user.name;      // 'Alice'
user.greet();   // Hi, I'm Alice
```

**問題**：如果你需要建立 100 個結構相同的使用者物件怎麼辦？
一個一個手寫效率太低，也容易出錯。

---

### 3-1 工廠函式（Factory Function）— 最直觀的解法

寫一個函式，負責「製造」物件：

```js
function createUser(name, age, role) {
  return {
    name: name,
    age: age,
    role: role,
    greet() {
      console.log(`Hi, I'm ${this.name}, role: ${this.role}`);
    },
  };
}

const alice = createUser('Alice', 25, 'admin');
const bob   = createUser('Bob', 30, 'user');

alice.greet();  // Hi, I'm Alice, role: admin
bob.greet();    // Hi, I'm Bob, role: user
```

**問題**：工廠函式每次呼叫都會建立一個全新的 `greet` 函式。  
1000 個使用者 = 1000 個 `greet` 函式，浪費記憶體。  
（因為所有使用者的 `greet` 邏輯都一樣，應該共享同一個函式才對。）

---

### 3-2 `new` 關鍵字 — JS 的標準物件建立方式

`new` 搭配「建構函式（Constructor Function）」解決了記憶體浪費問題。

**建構函式**：就是一個普通函式，但慣例用**大寫開頭**命名，
搭配 `new` 使用時，JS 會做特殊處理。

```js
// 建構函式：慣例大寫開頭
function User(name, age, role) {
  // 用 new 呼叫時，this 代表「即將被建立的新物件」
  this.name = name;
  this.age = age;
  this.role = role;
}

// 方法放在 prototype 上，所有實例「共享」同一個函式（不浪費記憶體）
User.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

// 用 new 建立實例
const alice = new User('Alice', 25, 'admin');
const bob   = new User('Bob', 30, 'user');

alice.greet();  // Hi, I'm Alice
bob.greet();    // Hi, I'm Bob

// alice 和 bob 的 greet 是同一個函式（記憶體共享）
console.log(alice.greet === bob.greet);  // true ✅
```

---

### 3-3 `new` 背後做了什麼？（重要）

當你寫 `const alice = new User('Alice', 25, 'admin')` 時，
JS 引擎在幕後執行了這四步：

```js
// new User('Alice', 25, 'admin') 等價於以下手動步驟：

// 步驟一：建立一個全新的空物件
const obj = {};

// 步驟二：把這個物件的 __proto__ 指向 User.prototype
// （這讓 obj 可以使用 User.prototype 上的方法，如 greet）
Object.setPrototypeOf(obj, User.prototype);

// 步驟三：把 User 函式裡的 this 設定為這個新物件，然後執行函式
// （所以 this.name = name 就是在 obj 上設定屬性）
User.call(obj, 'Alice', 25, 'admin');

// 步驟四：回傳這個物件
// （如果建構函式明確 return 一個物件，就回傳那個；否則回傳 obj）
const alice = obj;
```

**一句話總結**：`new` 幫你建立新物件、設定 prototype，然後用 `this` 指向新物件執行函式。

---

### 3-4 如果忘記寫 `new` 會發生什麼？

這是一個容易踩的坑，要特別注意：

```js
function User(name) {
  this.name = name;
}

// ✅ 正確：有 new，this 是新建立的物件
const alice = new User('Alice');
console.log(alice.name);   // 'Alice'

// ❌ 錯誤：沒有 new，this 是全域物件（瀏覽器裡是 window）
const bob = User('Bob');
console.log(bob);          // undefined（函式沒有 return）
console.log(window.name);  // 'Bob'（你不小心污染了全域！）

// 這就是為什麼 class（下一節）比建構函式安全：
// class 如果不用 new 呼叫，會直接拋出錯誤，而不是靜默地污染全域
```

---

### 3-5 現代方式：物件字面量 + `Object.create`

除了建構函式，還有其他建立物件的方式：

```js
// 最常用：物件字面量（直接用 {} 建立）
const config = {
  host: 'localhost',
  port: 5432,
};

// Object.assign：合併物件（常在 Vue 看到）
const merged = Object.assign({}, defaults, overrides);
// 等價於 Spread：
const merged2 = { ...defaults, ...overrides };

// Object.create：建立一個以指定物件為 prototype 的新物件
const animal = {
  speak() {
    console.log(`${this.name} makes a noise.`);
  },
};
const dog = Object.create(animal);  // dog 的 __proto__ 是 animal
dog.name = '小黑';
dog.speak();  // 小黑 makes a noise.（從 animal 繼承了 speak）

// Object.keys / Object.values / Object.entries：常用的物件遍歷
const user = { name: 'Alice', age: 25, role: 'admin' };
Object.keys(user);       // ['name', 'age', 'role']
Object.values(user);     // ['Alice', 25, 'admin']
Object.entries(user);    // [['name', 'Alice'], ['age', 25], ['role', 'admin']]

// 遍歷物件（用 for...of + entries）
for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`);
}
// name: Alice
// age: 25
// role: admin
```

---

### 3-6 `this` 關鍵字

> `this` 是 JS 裡最讓初學者頭痛的概念之一。  
> 和閉包「記住宣告時的 scope」不同，**`this` 的值由「呼叫方式」決定**，而不是由宣告位置決定。

#### `this` 的四種呼叫情境

**情境一：物件方法呼叫 → `this` 是那個物件**

```js
const user = {
  name: 'Alice',
  greet() {
    console.log(`Hi, I'm ${this.name}`);  // this = user 物件
  },
};

user.greet();  // Hi, I'm Alice ✅
```

**情境二：單獨呼叫函式 → `this` 是全域（或 undefined）**

```js
function sayHello() {
  console.log(this);
}

sayHello();  // 瀏覽器：window；嚴格模式（'use strict'）：undefined

// ⚠️ 把方法取出來單獨呼叫，就不再是「物件方法呼叫」
const greet = user.greet;
greet();  // Hi, I'm undefined（this 變成全域，沒有 name 屬性）
```

**情境三：`new` 呼叫建構函式 → `this` 是新建立的物件**

```js
function User(name) {
  this.name = name;   // this = 即將被建立的新物件
  this.greet = function() {
    console.log(`Hi, I'm ${this.name}`);
  };
}

const alice = new User('Alice');
alice.greet();  // Hi, I'm Alice ✅
```

**情境四：箭頭函式 → 沒有自己的 `this`，繼承外層的 `this`**

```js
const timer = {
  name: 'Timer',
  start() {
    // ❌ 一般函式：this 在 setTimeout 的 callback 裡是全域
    setTimeout(function() {
      console.log(this.name);  // undefined（this 此時是 window）
    }, 1000);

    // ✅ 箭頭函式：繼承 start() 執行時的 this（也就是 timer）
    setTimeout(() => {
      console.log(this.name);  // 'Timer' ✅
    }, 1000);
  },
};

timer.start();
```

---

#### `this` 的規則整理

| 呼叫方式 | `this` 的值 |
|----------|------------|
| `obj.method()` | `obj` 本身 |
| `fn()` 單獨呼叫 | 全域（`window`）或 `undefined`（嚴格模式） |
| `new Fn()` | 新建立的物件 |
| 箭頭函式 `() => {}` | 繼承**外層函式**的 `this` |
| `.call(ctx)` / `.apply(ctx)` / `.bind(ctx)` | 強制指定為 `ctx` |

---

#### 手動綁定 `this`：call / apply / bind

```js
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const alice = { name: 'Alice' };
const bob   = { name: 'Bob' };

// .call(this, arg1, arg2)：立即呼叫，參數逐一傳入
greet.call(alice, 'Hello', '!');   // Hello, I'm Alice!
greet.call(bob,   'Hi',    '~');   // Hi, I'm Bob~

// .apply(this, [arg1, arg2])：立即呼叫，參數用陣列傳入
greet.apply(alice, ['Hey', '?']);  // Hey, I'm Alice?

// .bind(this)：回傳一個「固定 this」的新函式（不立即執行）
const greetAlice = greet.bind(alice);
greetAlice('Morning', '.');  // Morning, I'm Alice.
greetAlice('Night', '...');  // Night, I'm Alice.（this 永遠是 alice）
```

---

#### Vue 元件裡的 `this` 注意事項

```js
// Options API（this 代表 Vue 元件實例）
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    increment() {
      this.count++;  // ✅ this = 元件實例
    },
    startTimer() {
      // ❌ 一般函式：this 丟失
      setInterval(function() {
        this.count++;  // this 是 undefined 或 window
      }, 1000);

      // ✅ 箭頭函式：繼承 startTimer 的 this（也就是元件）
      setInterval(() => {
        this.count++;  // ✅
      }, 1000);
    },
  },
};

// ─────────────────────────────────────────────────────
// Composition API（PrAjeKt 全站用這種）
// setup() 裡沒有 this，改用 ref/reactive 直接存取變數
// ─────────────────────────────────────────────────────
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const count = ref(0);

    // 直接用變數名，不需要 this
    function increment() {
      count.value++;       // ✅ 不需要 this.count
    }

    function startTimer() {
      // 箭頭函式或一般函式都無所謂，因為根本不用 this
      setInterval(() => {
        count.value++;     // ✅ 直接用 count
      }, 1000);

      setInterval(function() {
        count.value++;     // ✅ 這樣也完全沒問題，count 是閉包住的變數
      }, 1000);
    }

    return { count, increment, startTimer };
  },
};

// 用 <script setup> 語法更簡潔（PrAjeKt 的實際寫法）：
// <script setup>
// import { ref } from 'vue'
// const count = ref(0)
// function increment() { count.value++ }  // 完全不需要 this
// </script>
```

**Options API vs Composition API 的 `this` 差異總結：**

| | Options API | Composition API |
|-|-------------|-----------------|
| 資料存取 | `this.count` | 直接用 `count.value` |
| 方法互相呼叫 | `this.increment()` | 直接呼叫 `increment()` |
| `this` 丟失風險 | 有（一般函式 callback 裡） | 無（根本不用 `this`） |
| 原因 | `this` 綁定到元件實例 | 用閉包記住 ref 變數，不依賴 `this` |

---

## 4. Class 與原型

### 4-0 Class 是 `new` + Prototype 的語法糖

在看上一節「物件建立與 new」之後，你已經知道：
- `new` 建立物件、設定 prototype、執行建構函式
- 方法放在 `prototype` 上讓所有實例共享

`class` 語法就是把這些步驟包裝成更好看、更直觀的寫法：

```js
// 舊寫法（建構函式 + prototype）
function Animal(name, sound) {
  this.name = name;
  this.sound = sound;
}
Animal.prototype.speak = function() {
  console.log(`${this.name} 說 ${this.sound}`);
};

// 新寫法（class 語法糖）— 完全等價，只是更好讀
class Animal {
  constructor(name, sound) {   // constructor 就是建構函式
    this.name = name;
    this.sound = sound;
  }

  speak() {                    // 方法自動放到 Animal.prototype 上
    console.log(`${this.name} 說 ${this.sound}`);
  }
}

// 兩種寫法都用 new 建立實例，用法完全一樣
const dog = new Animal('小黑', '汪汪');
dog.speak();   // 小黑 說 汪汪

// 型別和 prototype 都相同
console.log(dog instanceof Animal);      // true
console.log(dog.speak === Animal.prototype.speak);  // true（共享）
```

---

### 4-1 為什麼要學 Class？

- TypeScript 大量使用 `class` 定義型別和邏輯
- 後端 SQLAlchemy Model 也是 class 語法（Flask 已在用）
- Vue 的 Options API 本質也是 class

### 4-2 Class 完整語法

```js
class Animal {
  // constructor：用 new 建立實例時自動呼叫
  constructor(name, sound) {
    this.name = name;    // 實例屬性（每個實例自己有一份）
    this.sound = sound;
  }

  // 實例方法（自動放在 prototype 上，所有實例共享）
  speak() {
    console.log(`${this.name} 說 ${this.sound}`);
  }

  // getter：用 . 存取時自動執行
  get info() {
    return `${this.name}（${this.sound}）`;
  }

  // static 方法：屬於 class 本身，不需要實例
  // 用 Animal.create() 呼叫，不是 dog.create()
  static create(name, sound) {
    return new Animal(name, sound);
  }
}

const dog = new Animal('小黑', '汪汪');
dog.speak();             // 小黑 說 汪汪
console.log(dog.info);  // 小黑（汪汪）  ← getter，存取時自動呼叫

const cat = Animal.create('咪咪', '喵喵');  // static 方法
cat.speak();             // 咪咪 說 喵喵
```

### 4-3 繼承（extends）

繼承讓你可以「基於現有的 class 建立新的 class」，複用已有的邏輯。

```js
class Dog extends Animal {   // Dog 繼承 Animal 的所有東西
  constructor(name, breed) {
    super(name, '汪汪');      // ⚠️ 必須先呼叫 super()，才能用 this
    //    ↑ 呼叫父類別（Animal）的 constructor
    this.breed = breed;        // 子類別自己的屬性
  }

  // 覆寫父類別方法（Override）
  speak() {
    super.speak();                          // 先呼叫父類別的 speak
    console.log(`品種：${this.breed}`);    // 再加自己的邏輯
  }

  // 子類別獨有的方法
  fetch() {
    console.log(`${this.name} 去撿球！`);
  }
}

const dog = new Dog('小黑', '柴犬');
dog.speak();
// 小黑 說 汪汪   ← super.speak() 的結果
// 品種：柴犬     ← 子類別的額外邏輯

dog.fetch();   // 小黑 去撿球！

// 繼承關係
console.log(dog instanceof Dog);     // true
console.log(dog instanceof Animal);  // true（繼承了 Animal）
```

**`super` 的作用**：
- 在 `constructor` 裡：`super(...)` 呼叫父類別的 constructor
- 在方法裡：`super.方法名()` 呼叫父類別的同名方法

### 4-4 TS 裡的 Class（預覽）

```typescript
// TypeScript 的 class 加上型別標注
class User {
  id: number;           // 需要事先宣告屬性和型別
  name: string;
  private password: string;  // private：只有 class 內部可用

  constructor(id: number, name: string, password: string) {
    this.id = id;
    this.name = name;
    this.password = password;
  }

  getInfo(): string {   // 回傳型別也要標注
    return `${this.id}: ${this.name}`;
  }
}

// TS 更常見的簡寫（constructor 參數加修飾符直接變屬性）
class User {
  constructor(
    public id: number,       // public = 外部可存取
    public name: string,
    private password: string // private = 只有內部可用
  ) {}
  // 不需要再手動 this.id = id，TS 自動幫你做
}
```

### 4-5 Prototype（理解原理，不常手寫）

```js
// class 只是語法糖，底層還是 prototype
class Animal {
  speak() { console.log('...'); }
}

// 兩者等價：
function Animal() {}
Animal.prototype.speak = function() { console.log('...'); };

// 所有實例共享 prototype 上的方法
const a = new Animal();
const b = new Animal();
console.log(a.speak === b.speak);  // true（同一個函式，節省記憶體）

// 屬性查找順序：自身屬性 → __proto__（Animal.prototype）→ Object.prototype → null
// 這條鍊叫做「原型鏈（Prototype Chain）」
// 你在實例上找不到的屬性，JS 會沿著原型鏈往上找
```

---

### 3-5 Prototype（理解原理，不常手寫）

```js
// class 只是語法糖，底層還是 prototype
class Animal {
  speak() { console.log('...'); }
}

// 等價於：
function Animal() {}
Animal.prototype.speak = function() { console.log('...'); };

// 所有實例共享 prototype 上的方法（記憶體效率高）
const a = new Animal();
const b = new Animal();
console.log(a.speak === b.speak);  // true（同一個函式）

// 查找順序：實例自身屬性 → prototype → prototype.prototype → ...
// 這條鍊叫做「原型鏈」（Prototype Chain）
```

---

## 5. 解構與 Spread 進階

> **解構（Destructuring）**：從物件或陣列中「取出」特定值，賦給變數的語法。  
> **展開（Spread）**：把物件或陣列「攤開」的語法。  
> 這兩個概念在 Vue 3 + Pinia 的程式碼裡到處都是，學好很值得。

### 5-1 物件解構進階

```js
const user = { id: 1, name: 'Alice', email: 'alice@example.com', age: 25 };

// 基礎解構（你應該已經會）
const { id, name } = user;
console.log(id, name);  // 1 'Alice'

// ── 重新命名（解構時同時改變數名）──
const { id: userId, name: userName } = user;
console.log(userId);    // 1     ← 不能用 id，因為已經改名成 userId
console.log(userName);  // 'Alice'

// ── 預設值（屬性不存在時使用）──
const { role = 'user', name: n } = user;
console.log(role);  // 'user'  ← user 物件沒有 role 屬性，所以用預設值

// ── Rest 物件（取出幾個，剩下的打包成另一個物件）──
const { id: uid, name: nm, ...rest } = user;
console.log(uid);   // 1
console.log(rest);  // { email: 'alice@example.com', age: 25 }

// ── 巢狀解構（物件裡面有物件）──
const config = { db: { host: 'localhost', port: 5432 } };
const { db: { host, port } } = config;
console.log(host);  // 'localhost'
console.log(port);  // 5432
// 注意：這裡 db 不是變數，只是解構路徑，你拿到的是 host 和 port
```

### 5-2 函式參數解構

```js
// 不用解構（參數太多，很難記順序）
function createTask(title, priority, assignee, dueDate) { ... }
createTask('寫報告', 1, 'Alice', '2026-03-10');  // 1 是什麼？哪個是 assignee？

// ✅ 用物件解構當參數（順序無所謂，語意清楚，有預設值）
function createTask({ title, priority = 2, assignee = null, dueDate }) {
  console.log(`建立: ${title}, 優先級: ${priority}`);
}

createTask({ title: '寫報告', dueDate: '2026-03-10' });
// priority 用預設值 2，assignee 用預設值 null

// ── 整個參數物件設預設值（避免完全不傳時解構失敗）──
function init({ port = 3000, host = 'localhost' } = {}) {
  //                                              ↑ 整個參數預設為空物件
  console.log(`${host}:${port}`);
}
init();              // localhost:3000 ✅（不傳也不會報錯）
init({ port: 8080 }); // localhost:8080

// PrAjeKt 裡的實際例子（useConfirm.js）
async function confirm({ title = '確認', message, confirmText = '確認' } = {}) {
  // 這樣呼叫很清楚：
  await confirm({ title: '刪除任務', message: '確定要刪除嗎？' });
}
```

### 5-3 陣列解構進階

```js
// ── 跳過元素 ──
const [first, , third] = [1, 2, 3];
console.log(first, third);  // 1 3（第二個位置留空就跳過）

// ── Rest 陣列 ──
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head);  // 1
console.log(tail);  // [2, 3, 4, 5]

// ── 交換兩個變數（不需要暫存變數）──
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b);  // 2 1

// ── Promise.allSettled 結果解構（PrAjeKt 有用到）──
const [commentsResult, filesResult] = await Promise.allSettled([
  taskService.getComments(id),
  taskService.getFiles(id),
]);
// 解構讓程式碼更清楚哪個是哪個
```

### 5-4 Spread 展開進階

```js
// ── 合併物件（後面的覆蓋前面的）──
const defaults = { color: 'blue', size: 'md', disabled: false };
const custom = { color: 'red', onClick: () => {} };

const merged = { ...defaults, ...custom };
// { color: 'red', size: 'md', disabled: false, onClick: fn }
//        ↑ custom 的 color 覆蓋了 defaults 的 color

// ── 在合併中強制指定某個值 ──
const withOverride = { ...defaults, ...custom, size: 'lg' };
// size 強制為 'lg'，不管 defaults 或 custom 裡的值

// ── 陣列展開 ──
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];           // [1, 2, 3, 4, 5, 6]
const withExtra = [0, ...arr1, 3.5, ...arr2];  // [0, 1, 2, 3, 3.5, 4, 5, 6]

// ── 淺拷貝（避免直接修改原物件）──
const original = { a: 1, b: { c: 2 } };
const copy = { ...original };

copy.a = 99;          // ✅ 不影響 original.a（不同記憶體位置）
copy.b.c = 99;        // ⚠️ 會影響 original.b.c！因為 b 是巢狀物件，淺拷貝只複製參考

// 解釋：Spread 是「淺拷貝（shallow copy）」
// - 第一層的值（數字、字串）：複製值
// - 第一層的物件/陣列：複製「參考（reference）」，指向同一塊記憶體

// ── Vue/Pinia 常見模式：更新 store 裡的物件 ──
// 只改 name，其他欄位保留
profile.value = { ...profile.value, name: newName };

// ── 函式參數展開 ──
function add(a, b, c) { return a + b + c; }
const nums = [1, 2, 3];
add(...nums);  // 等於 add(1, 2, 3)
```

---

## 6. 錯誤處理模式

> 錯誤處理是「防守性程式設計」的核心。  
> 好的錯誤處理讓你的程式在出問題時，不會整個崩潰，  
> 而是優雅地告訴使用者「出了什麼問題」，並繼續運作其他功能。

### 6-1 try/catch/finally 完整版

JS 的錯誤處理語法由三個區塊組成：

```js
async function fetchData() {
  try {
    // ── 把可能出錯的程式碼放在這裡 ──
    const res = await api.get('/data');
    return res.data;

  } catch (err) {
    // ── 出錯時跑到這裡（err 是 Error 物件）──
    // err 的重要屬性：
    console.log(err.message);  // 錯誤描述文字
    console.log(err.stack);    // 錯誤發生的呼叫堆疊（除錯用）
    console.log(err.name);     // 錯誤類型（'Error'、'TypeError' 等）

    // 你可以選擇：
    return null;                          // 1. 靜默處理，回傳 null
    throw err;                            // 2. 繼續往上拋，讓呼叫者處理
    throw new Error(`fetchData 失敗：${err.message}`);  // 3. 包裝後拋出

  } finally {
    // ── 不管成功或失敗，最後一定執行 ──
    // 適合用來「清理」，確保某些事情一定會做
    loading.value = false;    // 關閉 loading（不管成功失敗都要關）
    isRefreshing = false;     // 重置 flag
    modal.close();            // 關閉 modal
  }
}
```

**`finally` 的典型使用場景**：

```js
async function submitForm() {
  isSubmitting.value = true;   // 開啟 loading
  try {
    await api.post('/tasks', formData);
    toast.success('建立成功！');
    closeModal();
  } catch (err) {
    toast.error(err.response?.data?.error || '建立失敗');
  } finally {
    isSubmitting.value = false;  // 不管成功失敗，都要關閉 loading
    // 如果不用 finally，要在 try 和 catch 兩個地方各寫一次
  }
}
```

---

### 6-2 什麼時候要 catch，什麼時候讓錯誤往上拋？

這是初學者最容易搞錯的地方。

**原則：誰能「真正處理」這個錯誤，誰才 catch。**

```js
// ❌ 不良範例：每層都 catch，但都不知道怎麼處理
async function getUser(id) {
  try {
    return await api.get(`/users/${id}`);
  } catch (err) {
    console.error(err);  // 只是印了，然後函式回傳 undefined
  }
}

async function loadProfile() {
  try {
    const user = await getUser(1);
    profile.value = user.data;  // ⚠️ user 是 undefined（上面 catch 了但沒拋也沒回傳）
    // 這裡會報 TypeError: Cannot read property 'data' of undefined
  } catch (err) {
    showError('載入失敗');  // 收到的是 TypeError 而不是原本的 API 錯誤
  }
}
```

```js
// ✅ 正確範例：底層不處理就往上拋，最上層負責 catch
async function getUser(id) {
  const res = await api.get(`/users/${id}`);  // 出錯直接往上拋，不 catch
  return res.data;
}

async function loadProfile() {
  try {
    profile.value = await getUser(1);  // ✅ 這裡 catch 才有意義
  } catch (err) {
    showError('載入失敗');  // 這裡真的能顯示錯誤給使用者
  }
}
```

**判斷方式**：
- 底層函式（service、API 呼叫）→ 通常不 catch，讓錯誤往上
- 中間層（store action）→ 視情況，可能轉換錯誤訊息
- 上層（Vue 元件的事件處理）→ 這裡 catch 並顯示給使用者

---

### 6-3 axios 的錯誤物件結構

axios 的錯誤物件比一般 JS 錯誤多了 HTTP 相關資訊：

```js
try {
  await api.post('/tasks', data);
} catch (err) {
  // ── 有伺服器回應（HTTP 狀態碼不是 2xx）──
  if (err.response) {
    console.log(err.response.status);       // 404、422、500...
    console.log(err.response.data);         // 後端回傳的 JSON body
    console.log(err.response.data.error);   // PrAjeKt 後端回 { error: '訊息' }

    if (err.response.status === 401) {
      router.push('/login');  // 未授權 → 跳登入
    }
  }
  // ── 沒有回應（網路錯誤、伺服器當機）──
  else if (err.request) {
    console.log('伺服器沒有回應，請檢查網路');
  }
  // ── 程式碼本身的錯誤（Bad request setup）──
  else {
    console.log('請求設定錯誤：', err.message);
  }
}

// ── PrAjeKt 裡的常見簡化寫法 ──
catch (err) {
  toast.error(err.response?.data?.error || '操作失敗');
  //                  ↑
  // Optional chaining：err.response 不存在時不報錯，直接回傳 undefined
  // ?? 的意思：如果左邊是 null/undefined，就用右邊的預設值
}
```

---

### 6-4 自定義 Error（TS 遷移後很常用）

有時候你需要讓 catch 知道「是哪種錯誤」，方便分別處理：

```js
// 繼承 Error 建立自定義錯誤類型
class ApiError extends Error {
  constructor(message, statusCode, data) {
    super(message);           // 呼叫 Error 的 constructor，設定 .message
    this.name = 'ApiError';   // 覆蓋預設的 'Error' 名稱
    this.statusCode = statusCode;
    this.data = data;
  }
}

class AuthError extends ApiError {
  constructor(message) {
    super(message, 401, null);
    this.name = 'AuthError';
  }
}

class NotFoundError extends ApiError {
  constructor(resource) {
    super(`${resource} 不存在`, 404, null);
    this.name = 'NotFoundError';
  }
}

// 使用時可以用 instanceof 分辨錯誤類型
try {
  await loadUserData();
} catch (err) {
  if (err instanceof AuthError) {
    router.push('/login');           // 認證錯誤 → 跳登入頁
  } else if (err instanceof NotFoundError) {
    router.push('/404');             // 找不到資源 → 404 頁
  } else if (err instanceof ApiError) {
    toast.error(err.message);        // 一般 API 錯誤 → 顯示訊息
  } else {
    console.error('未知錯誤', err);  // 非預期錯誤 → 記錄 log
  }
}
```

---

### 6-5 optional chaining 與 nullish coalescing

這兩個運算子在錯誤處理和資料存取裡非常常用：

```js
// ── ?. (optional chaining)：避免 "Cannot read property of undefined" ──
const user = null;

// ❌ 沒有 ?. 會報 TypeError
console.log(user.address.city);   // TypeError: Cannot read properties of null

// ✅ 用 ?. 安全存取，不存在就回傳 undefined
console.log(user?.address?.city); // undefined（不報錯，程式繼續）

// 也可以用於方法呼叫
user?.notify?.('訊息');   // user 或 notify 不存在時，直接跳過，什麼都不做

// 用於陣列
const arr = null;
arr?.[0];  // undefined（不報錯）

// ── ?? (nullish coalescing)：只對 null 和 undefined 起作用 ──
// 和 || 的差異：
const name1 = user?.name ?? '訪客';  // user.name 是 '' 時，name1 = ''（保留空字串）
const name2 = user?.name || '訪客';  // user.name 是 '' 時，name2 = '訪客'（空字串被換掉）

// 更具體：
// ?? 只對 null 和 undefined 換成預設值
// || 對 null、undefined、0、''、false 都換（所有 falsy 值）

// 如果你想「只有真正沒有值才用預設」→ 用 ??
// 如果你想「只要 falsy 就用預設」→ 用 ||

// ── ??= (nullish assignment)：如果是 null/undefined 才賦值 ──
let config = null;
config ??= { port: 3000 };  // config 是 null，所以賦值
console.log(config);  // { port: 3000 }

config ??= { port: 9999 };  // config 已有值，不賦值
console.log(config);  // { port: 3000 }（沒被改）
```

---

## 📌 在 PrAjeKt 裡的對照表

| 概念 | PrAjeKt 中出現的位置 |
|------|----------------------|
| `Promise.allSettled` | `TasksView.vue`、`TimelineDetailDialog.vue` 的 `openTaskDetail` |
| `Promise`（手動建立）| `api.js` 的 Token 刷新 failedQueue |
| `async/await` | 全站所有 Pinia store action、元件的事件處理 |
| Closure（閉包） | `api.js` 的 `isRefreshing`、`failedQueue`；所有 Pinia store |
| `finally` | `api.js` 的 `isRefreshing = false`；表單提交的 loading 狀態 |
| `new`（手動使用）| `new Promise()`、`new Error()`、`new Date()` |
| `this` | Class 方法、建構函式；Vue Options API 的 `this.count`；`api.js` 攔截器 |
| `class extends` | 後端所有 SQLAlchemy Model（`class Task(db.Model):`）；自定義 ApiError |
| 物件字面量 / Spread | `profile.value = { ...profile.value, name: newName }` |
| Rest 物件 `...rest` | Vue Composables、store 的 storeToRefs 解構 |
| 函式參數解構 | `useConfirm.js` 的 `confirm({ title, message, confirmText })` |
| `err.response?.data?.error` | 全站 catch block 的錯誤訊息顯示 |
| `??` nullish coalescing | `getDaysRemaining` 回傳值的預設值 |
| `?.` optional chaining | 全站 axios catch block 的安全存取 |

---

## 💡 學習建議

**建議學習順序**（照這份筆記的章節順序就對了）：

1. **非同步** — 先理解為什麼需要，再學 Promise，再學 async/await
2. **閉包** — 理解 scope 後再看閉包，然後對照 api.js 的 token 刷新機制
3. **物件與 new 與 this** — 先理解物件字面量，再看工廠函式，再看 `new`，最後看 `this`
4. **Class** — 理解 `new` 和 `this` 後，class 就只是更好看的語法而已
5. **解構** — 這個相對獨立，可以隨時用到隨時查
6. **錯誤處理** — 最後學，因為它用到所有前面的概念

**每學完一個章節，去 PrAjeKt 的對照位置看實際程式碼**：理論 + 實踐結合，記憶效果最好。

---

## 🔗 延伸閱讀資源

- **非同步**：https://javascript.info/async-await（免費，每章有小測驗）
- **Event Loop 視覺化**：https://www.jsv9000.app/（可以看程式碼的執行順序動畫）
- **Closure**：https://javascript.info/closure
- **物件 / Prototype**：https://javascript.info/object
- **Class**：https://javascript.info/class
- **錯誤處理**：https://javascript.info/try-catch

> 💡 javascript.info 是目前最好的免費 JS 學習資源，每個章節都簡短且有題目。建議每章讀完後做課後題，確認自己真的懂了再往下。
