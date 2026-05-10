# Code Block 實作說明（Kiriris）

這份文件是針對目前專案的 Markdown 程式碼區塊功能，解釋「它怎麼運作、為什麼這樣設計、你之後可以怎麼改」。

## 1. 功能目標

我們目前的目標不是只把 Markdown 顯示出來，而是把程式碼區塊升級成「可閱讀、可辨識、可複製」的體驗：

1. 支援語法高亮。
2. 在區塊上方顯示語言標籤。
3. 可選擇顯示檔名（例如 `file=xxx.ts`）。
4. 提供 Copy 按鈕，能一鍵複製程式碼內容。
5. 保持你網站目前的視覺風格（字體、邊框、底色、間距）。

## 2. 用到哪些套件

主要有兩個：

1. `markdown-it`
- 把 Markdown 文字解析成 HTML。
- 預設就能處理標題、清單、code fence（```）等。

2. `highlight.js`
- 負責程式碼語法高亮。
- 我們只註冊有需要的語言（`js`, `ts`, `json`, `bash`, `css`, `html`, `vue`, `markdown`）。

補充：
- `tailwindcss` + `main.css` 是用來控制最終樣式，不是做 Markdown 解析或高亮邏輯。

## 3. 檔案分工

### `frontend/src/services/markdown.js`
處理「把 Markdown 轉成你要的 HTML 結構」。

重點職責：
1. 初始化 `markdown-it`。
2. 註冊 `highlight.js` 語言。
3. 覆寫 `markdown.renderer.rules.fence`，客製 code block HTML。
4. 解析 code fence 的資訊字串（語言、檔名）。
5. 輸出給 Vue 使用的最終 HTML。

### `frontend/src/components/notes/MarkdownArticle.vue`
處理「渲染後的互動行為」。

重點職責：
1. 用 `v-html` 把 HTML 插進頁面。
2. 監聽 `.code-copy-button` 點擊。
3. 找到對應 `<pre><code>` 文字並寫入剪貼簿。
4. 按鈕暫時顯示 `Copied` 再恢復 `Copy`。

### `frontend/src/assets/main.css`
處理「顯示風格」。

重點職責：
1. 匯入 `highlight.js` 基礎主題（github）。
2. 定義 `.code-block`、`.code-block-header`、`.code-copy-button` 等樣式。
3. 把 highlight.js 預設輸出調整成符合你網站配色。

## 4. 實際資料流（從 Markdown 到畫面）

1. 你有一段 Markdown 原文（通常來自 `.md` 內容）。
2. `renderMarkdown(source)` 呼叫 `markdown.render(source)`。
3. `markdown-it` 遇到 code fence 時，會走我們覆寫的 `renderer.rules.fence`。
4. `fence` 規則內：
- 解析 `token.info`（語言/檔名）
- 用 `highlight.js` 高亮（若語言可用）
- 組出自訂 HTML（header + copy button + pre/code）
5. Vue component 收到 `html` 後，透過 `v-html` 顯示。
6. `MarkdownArticle.vue` 綁定 click 事件，接管 Copy 按鈕行為。

## 5. `markdown.js` 詳解

### A) 語言註冊（`hljs.registerLanguage`）

你現在是手動註冊。好處：
1. 不會把 highlight.js 全語言包都塞進來。
2. 較容易控制支援範圍與 bundle 大小。

若未註冊某語言：
- 會走 fallback，顯示純文字（不高亮），但內容仍可閱讀。

### B) `markdown` 設定

```js
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})
```

1. `html: false`
- 關閉原始 HTML 直接注入，較安全。
- 這對 `v-html` 場景很重要。

2. `linkify: true`
- 純文字 URL 自動轉連結。

3. `typographer: true`
- 做一些排版符號優化。

### C) 覆寫 `renderer.rules.fence`

這是整個功能的關鍵。預設 code fence 只會產生基礎 `<pre><code>`，我們改成客製結構：

1. 取得 token：
- `token.content`: 程式碼文字。
- `token.info`: 語言與額外資訊（例如 `ts file=demo.ts`）。

2. 解析資訊：
- 呼叫 `parseCodeInfo(token.info)`。

3. 高亮或 fallback：
- 若語言已註冊，用 `hljs.highlight(...)`。
- 否則用 `markdown.utils.escapeHtml(...)`，避免 HTML 被當成標記執行。

4. 組出 header：
- `.code-language` 顯示語言。
- `.code-filename`（有值才輸出）顯示檔名。
- `.code-copy-button` 提供複製入口。

5. 回傳完整 HTML 字串。

### D) `parseCodeInfo(info)`

它做兩件事：

1. 第一個 token 當語言：
- 例如 `ts file=app.ts` -> 語言是 `ts`。

2. 後續 token 找 `file=` 或 `title=`：
- `file=timelineService.ts`
- `title="demo.js"`

再去掉引號後回傳 `{ language, filename }`。

### E) 其他工具函式

1. `splitFrontmatter(raw)`
- 拆出 frontmatter 與正文。

2. `parseFrontmatter(source)`
- 把 `key: value` 解析成物件。

3. `parseList(value)`
- 把 frontmatter 內像 `[a, b]` 轉成陣列。

這些不是 code block 專屬，但影響整個 Markdown 資料處理流程。

## 6. `MarkdownArticle.vue` 詳解

### A) 為什麼用事件委派

程式碼區塊是由 `v-html` 動態插入，不能直接在模板上綁 `@click`。所以我們在外層 article 綁一個 listener，再判斷是不是點到 `.code-copy-button`。

好處：
1. 不需要為每個按鈕個別註冊監聽。
2. 內容更新後（`props.html` 變動）仍可正常運作。

### B) 複製流程

1. 點按鈕。
2. 找最近的 `.code-block`。
3. 從裡面抓 `pre code` 文字。
4. `navigator.clipboard.writeText(...)`。
5. 按鈕文字暫時改成 `Copied`，1.2 秒後恢復。

### C) 生命週期與清理

1. `onMounted(bindCodeActions)`：初次掛載時綁定。
2. `watch(() => props.html, bindCodeActions)`：內容換了要重綁。
3. `onBeforeUnmount(...)`：卸載前解除監聽，避免記憶體洩漏。

## 7. `main.css` 的 code block 區塊

你現在的樣式重點：

1. `.code-block`
- 外框、圓角、與正文間距。

2. `.code-block-header`
- 語言/檔名/按鈕所在列。

3. `.code-language` / `.code-filename`
- 顯示語意資訊，提高閱讀定位速度。

4. `.code-copy-button`
- 視覺回饋與 hover 狀態。

5. `.code-block pre.hljs`
- 覆蓋 highlight.js 預設 margin/padding/邊框，讓版面整齊一致。

## 8. 你之後最常改的地方

1. 想新增支援語言
- 到 `markdown.js` 增加語言 import + `hljs.registerLanguage(...)`。

2. 想改 header 顯示內容
- 改 `renderer.rules.fence` 回傳 HTML（例如加行號開關、複製成功 icon）。

3. 想改 Copy 互動
- 改 `MarkdownArticle.vue` 的 `handleCopyClick`。

4. 想改外觀
- 改 `main.css` 的 `.code-*` class。

## 9. 風險與注意事項

1. `v-html` 安全性
- 目前 `html: false` 是重要保護。
- 不要隨意改成 `html: true`，除非你有額外 sanitization。

2. 剪貼簿 API 限制
- `navigator.clipboard` 在某些環境可能需要 HTTPS 或使用者操作觸發。

3. 不支援語言時的回退
- 回退純文字是正常行為，不是 bug。

4. token.info 格式約定
- 若寫法不一致（例如 `filename=` 但程式只找 `file=`/`title=`），檔名不會顯示。

## 10. 測試清單（建議每次改完都跑）

1. 有語言無檔名
- ` ```ts ` 是否顯示 `ts`。

2. 有語言有檔名
- ` ```ts file=demo.ts ` 是否顯示檔名。

3. 無語言
- ` ``` ` 是否顯示 `text`。

4. Copy 功能
- 點 `Copy` 後，能否貼出完整程式碼。

5. RWD
- 手機寬度下 code block 是否可橫向捲動、header 是否不擠壓。

---

如果你想更進一步，下一版可以加：
1. `Copy` 失敗時的錯誤提示（現在是 optimistic flow）。
2. 行號顯示。
3. `diff` 樣式（新增/刪除行色彩）。
4. 語言別名映射（例如 `shell` -> `bash`）。
