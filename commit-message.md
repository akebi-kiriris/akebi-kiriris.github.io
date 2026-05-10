feat: 完成專案頁多文件架構與導覽體驗打磨

## 變更摘要
- 專案內容由單篇模式升級為「專案資料夾 + 多篇 Markdown 文件」模式。
- 新增專案頁文件導覽元件，支援目前位置顯示與上一篇/下一篇切換。
- 將 about 從主內容區塊抽離為摘要導向入口，避免首屏被單一介紹區塊佔據。
- 補齊專案 frontmatter 規格文件與打磨計畫更新，讓後續內容擴充有一致格式。

## 前端功能調整
- `frontend/src/composables/useProjects.js`
  - 改為讀取 `frontend/src/content/projects/**/*.md`。
  - 建立「專案分組 + 文件分組」資料模型：
    - `about.md` 作為專案簡介來源。
    - 其他 md 作為 `documents` 清單。
  - 提供 `findProject`、`findProjectDocument` 與搜尋能力。

- `frontend/src/router/index.js`
  - 專案詳情路由升級為 `/projects/:slug/:docSlug?`。

- `frontend/src/views/ProjectDetailView.vue`
  - 導入文件導覽元件，採用文件導覽主導的閱讀版型。
  - about 改為「閱讀專案介紹」入口，不再獨立佔據主要閱讀區。
  - 補上目前閱讀位置顯示與 about 路由的正確選中邏輯。

- `frontend/src/components/projects/ProjectDocNavigator.vue`（新增）
  - 顯示專案文件清單。
  - 提供 About 入口。
  - 提供上一篇/下一篇導覽。
  - active 狀態與一般文件一致。

- `frontend/src/components/projects/ProjectCard.vue`
  - 卡片補上專案文件數量資訊，提升列表可判讀性。

- `frontend/src/components/layout/CommandPalette.vue`
  - 納入專案內容搜尋。

- `frontend/src/services/markdown.js`
  - 補齊專案 frontmatter `status` 欄位解析。
  - 既有 code block 與 callout 客製渲染維持可用。

## 內容與文件
- `frontend/src/content/projects/personal-website/about.md`
  - 作為專案簡介文件。
- 新增示範文件：
  - `frontend/src/content/projects/personal-website/architecture.md`
  - `frontend/src/content/projects/personal-website/content-strategy.md`

- `docs/project-page-polish-plan.md`
  - 更新打磨項目進度（1/2/3 完成狀態）。

- `docs/project-frontmatter-spec.md`（新增）
  - 定義專案文件 frontmatter 規格：
    - 必填：`title`、`date`、`tags`、`summary`
    - 建議：`status`、`readingTime`、`level`

- `網站後續計畫.md`
  - 同步近期進度，補上專案頁第一輪打磨成果。

## 穩定性與維護性
- 修正多處 BOM（UTF-8 with BOM）導致的前端白屏風險。
- 新增 VSCode 編碼設定，降低後續再發生 BOM 問題機率：
  - `frontend/.vscode/settings.json`
    - `files.encoding = utf8`
    - `files.autoGuessEncoding = false`

## 驗證
- 已執行 `npm run build`，確認專案可成功編譯。
- 已確認 `frontend/src` 目前為 `NO_BOM` 狀態。

## 後續建議
- 先持續補齊專案內容文件，再視內容量決定是否啟動後端功能。
