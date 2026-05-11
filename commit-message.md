feat: 專案內容標準化與專案頁導覽體驗優化

## 變更摘要
- 補齊並標準化 `projects` 內容體系，新增 `PrAjeKt` 與 `學習筆記` 的 `about.md` 專案介紹入口。
- 建立 tags 命名標準文件，統一中英混用與同義詞映射規則。
- 批次整理專案文件 frontmatter（tags/summary）與精修清單文件，提升內容可維護性。
- 優化專案詳情頁導覽互動：標籤篩選、上下篇切換、文件分組分頁與長標題溢出修正。

## 文件與規格更新
- 新增 `docs/project-tags-standard.md`
  - 定義標準 tags、同義詞對照與維護規則。
- 新增 `docs/content-polish-checklist.md`
  - 建立第一輪內容精修清單與完成勾選標準。
- 更新 `docs/project-frontmatter-spec.md`
  - 補充 tags 命名標準參考。

## 內容資料更新（projects）
- 新增專案介紹頁：
  - `frontend/src/content/projects/PrAjeKt/about.md`
  - `frontend/src/content/projects/學習筆記/about.md`
- 批次清理 `projects` 內 markdown：
  - frontmatter 欄位對齊（title/date/tags/summary/status）
  - tags 與 summary 正規化
  - 移除重複 frontmatter 殘留
  - AI tags 精準化（避免非 AI 主題誤標）

## 前端頁面與互動調整
- `frontend/src/views/ProjectDetailView.vue`
  - 新增 tags 篩選並同步影響文件清單/目前文章/上下篇。
  - 導覽控制列重排為獨立上層區塊，降低視覺重疊感。
  - 調整內容卡片間距與文章區顯示層級。
- `frontend/src/components/projects/ProjectDocNavigator.vue`
  - 導覽改為每組 10 篇文件分頁（上一組/下一組）。
  - About active 狀態與一般文件一致。
  - 修正長檔名斷行與邊界溢出。
- `frontend/src/views/NotesView.vue`
  - 筆記頁新增「專案筆記」區塊並置於一般筆記上方。
  - 搜尋與 tags 篩選同時套用一般筆記與專案筆記。
- `frontend/src/views/AboutView.vue`
  - 主容器改為 `reading-shell`，提升內容寬度一致性。
- `frontend/src/assets/main.css`
  - 字體方案改為 `LXGW WenKai TC`（標題）+ `Noto Sans TC`（內文）。

## 穩定性
- 持續處理 BOM 造成的白屏風險，新增/改寫檔案皆轉為 UTF-8 無 BOM。

## 驗證
- 已執行 `npm run build`，編譯通過。