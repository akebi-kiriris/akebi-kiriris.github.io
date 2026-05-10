# Project Frontmatter 規格（Kiriris）

這份規格用在 `frontend/src/content/projects/<project-slug>/*.md`，目的是讓專案內容格式一致、方便排序、搜尋與後續 UI 顯示。

## 適用範圍
- `about.md`：專案介紹（摘要導向）
- 其他文件（例如 `architecture.md`、`content-strategy.md`）：專案內筆記/紀錄

## 建議欄位

### 必填欄位
- `title`: 文件標題
- `date`: 日期（`YYYY-MM-DD`）
- `tags`: 標籤陣列
- `summary`: 1-2 句摘要

### 建議欄位
- `status`: 例如 `草稿`、`已整理`、`已完成`
- `readingTime`: 例如 `6 min`
- `level`: 例如 `初階`、`中階`、`進階`

## 範例（about.md）

```md
---
title: Kiriris 個人網站
date: 2026-05-11
tags: [Vue, Markdown, 內容架構]
summary: 以 Vue 與 Markdown 建立的內容網站，聚焦可維護的寫作流程與閱讀體驗。
status: v0 建置中
readingTime: 4 min
level: 中階
---
```

## 範例（一般文件）

```md
---
title: 架構切分紀錄
date: 2026-05-11
tags: [Vue, 架構, Frontend]
summary: 將專案內容改為資料夾 + 多篇 md 時，路由與資料模型怎麼拆。
status: 已整理
readingTime: 6 min
level: 中階
---
```

## 撰寫建議
- `summary` 控制在 40-90 字，方便卡片與清單顯示。
- `date` 一律用同格式，避免排序錯亂。
- `tags` 優先用 2-4 個關鍵詞，避免太散。
- `about.md` 偏「定位與脈絡」，其他文件偏「單一主題」。

## 與目前實作的關係
- 現行程式已使用：`title`、`date`、`tags`、`summary`、`status`
- `readingTime`、`level` 已納入規格，後續可直接接到 UI
