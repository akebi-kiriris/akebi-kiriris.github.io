# 專案頁下一步打磨（2026-05）

## 目標
在不增加後端的前提下，把目前的專案閱讀體驗從「可用」提升到「更順、更像文件系統」。

## 打磨方向

### 1. 專案資訊層級
- `about` 區塊收斂為短摘要（2-4 行重點） ✅ 已完成
- 專案卡片可補 `readingTime` / `level`（後續 frontmatter）
- 降低首屏資訊噪音，讓人快速判斷「這個專案在講什麼」

### 2. 文件導覽體驗
- 將「專案內文件」改為獨立導覽組件，不再只放在文章下方 ✅ 已完成
- 提供目前位置顯示（project / document） ✅ 已完成
- 提供上一篇 / 下一篇切換 ✅ 已完成
- 文件列表保持可點入，和筆記頁一致的閱讀節奏 ✅ 已完成

### 3. 內容規格一致化
- 補一份 `project frontmatter` 規格文件 ✅ 已完成（`docs/project-frontmatter-spec.md`）
- 建議欄位：`title`、`date`、`tags`、`summary`、`status`、`readingTime`、`level`
- 確保新增文件時格式一致，利於搜尋與排序

## 本次實作範圍
- 完成第 1 項（about 摘要化，不再佔主內容區）
- 完成第 2 項（`ProjectDocNavigator` 導覽組件 + 上下篇 + 目前位置）
- 完成第 3 項（frontmatter 規格文件）

## 目前狀態
- 本輪 1/2/3 已完成，可進入下一輪細節優化（例如 `readingTime` / `level` 真正顯示到 UI）。
