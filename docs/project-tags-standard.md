# Project Tags 標準表（Kiriris）

這份文件定義 `frontend/src/content/projects/**/*.md` 的 tags 命名標準，避免同義詞或中英混用造成搜尋與篩選混亂。

## 命名原則
- 以繁體中文為主。
- 每篇建議 2-4 個 tags。
- 優先使用下方「標準 tags」。
- 如遇同義詞，請改寫成「標準值」。

## 標準 tags 表

| 類別 | 標準 tag | 何時使用 |
|---|---|---|
| 技術領域 | 前端 | Vue、UI、CSS、Tailwind、互動行為、瀏覽器端邏輯 |
| 技術領域 | 後端 | API、Flask、資料模型、服務層、授權、資料庫流程 |
| 技術領域 | 全端 | 同篇內容同時聚焦前後端整合決策 |
| AI 主題 | AI | LLM、Agent、MCP、RAG、Prompt、評測與工具調用 |
| 內容型態 | 規劃 | Roadmap、phase 計畫、執行順序、優先級、風險評估 |
| 內容型態 | 部署 | Railway/Firebase/Supabase、上線流程、遷移、環境配置 |
| 內容型態 | 除錯 | Bug 調查、錯誤復盤、runbook、修復策略 |
| 內容型態 | 工程流程 | Git、測試流程、CI、開發協作規範 |
| 內容型態 | 學習筆記 | 課程筆記、概念整理、技術讀書摘要 |
| 內容型態 | 架構 | 模組邊界、分層設計、資料流設計 |
| 內容型態 | 內容策略 | 文件結構、寫作規則、知識庫維護策略 |
| 專案識別 | 專案介紹 | `about.md` 這類總覽型文件 |

## 同義詞與遷移對照

| 非標準寫法 | 請統一為 |
|---|---|
| Frontend | 前端 |
| Backend | 後端 |
| Fullstack | 全端 |
| Bugfix / Debug | 除錯 |
| Plan / Planning / Roadmap | 規劃 |
| Deploy / Deployment / Migration | 部署 |
| Notes / Learning | 學習筆記 |
| Architecture | 架構 |
| Content / Content-Plan | 內容策略 |

## 快速套用範例

### 1. 專案里程碑文
- 建議：`[規劃, AI, 前端]`

### 2. 部署與遷移文
- 建議：`[部署, 後端, 除錯]`

### 3. MCP / RAG 筆記
- 建議：`[AI, 學習筆記, 後端]` 或 `[AI, 學習筆記, 前端]`

### 4. about.md
- 建議：`[專案介紹, 全端, AI]`（依專案性質微調）

## 維護規則
- 新增 tag 前先檢查是否可由現有標準 tag 表達。
- 若確實需要新 tag，先更新本文件再套用到內容。
- 若同義詞已出現，優先批次統一，避免歷史資料分裂。