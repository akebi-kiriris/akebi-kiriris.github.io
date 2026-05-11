export const projectTimelines = {
  PrAjeKt: [
    {
      date: '2026/02/24-25',
      phase: 'Phase 0',
      title: '前端結構重構起步',
      summary:
        '建立 service/store 分層，並把 TimelinesView 從 2569 行拆到 301 行，讓後續功能不再堆在單一巨大元件裡。',
      type: 'architecture',
      evidence: ['Service 層', 'Store 層', 'TimelinesView 拆分'],
      links: [{ label: '重構計畫', to: '/projects/PrAjeKt/重構計畫' }],
    },
    {
      date: '2026/02/26-27',
      phase: 'Phase 1',
      title: '多人協作與權限主線完成',
      summary:
        '補齊 timeline/task 的 owner、member 權限判斷，讓專案、任務、成員管理開始具備協作產品的基本邊界。',
      type: 'feature',
      evidence: ['Timeline role', 'Task role', '成員管理'],
      links: [{ label: '重構計畫', to: '/projects/PrAjeKt/重構計畫' }],
    },
    {
      date: '2026/03/01-02',
      phase: 'Phase 1',
      title: '任務留言、附件與垃圾桶落地',
      summary:
        '任務詳情補上留言、附件上傳下載與刪除流程，同時加入垃圾桶機制，讓資料操作有可恢復空間。',
      type: 'feature',
      evidence: ['Comments', 'Task files', 'Trash flow'],
      links: [{ label: '重構計畫', to: '/projects/PrAjeKt/重構計畫' }],
    },
    {
      date: '2026/03/13',
      phase: 'Phase 3',
      title: 'TypeScript 基礎層與資料契約收斂',
      summary:
        '整理 types、services、stores、composables，並處理 UTC 日期問題，開始把前端從可用功能推向可維護結構。',
      type: 'quality',
      evidence: ['Types', 'Services', 'Stores', 'UTC 修正'],
      links: [{ label: '重構計畫', to: '/projects/PrAjeKt/重構計畫' }],
    },
    {
      date: '2026/03/22',
      phase: 'Phase 5',
      title: '部署主線完整收斂',
      summary:
        '完成 Supabase PostgreSQL、Railway 後端與 Firebase 前端部署，並修正生產環境相容性與 CORS 問題。',
      type: 'release',
      evidence: ['Supabase', 'Railway', 'Firebase'],
      links: [
        { label: '部署安全筆記', to: '/projects/PrAjeKt/DEPLOYMENT_SAFETY_2026-04-04' },
        { label: 'PostgreSQL 遷移', to: '/projects/PrAjeKt/Phase5_1_PostgreSQL遷移流程' },
      ],
    },
    {
      date: '2026/03/29',
      phase: 'Phase 5.6',
      title: '後端測試與 CI coverage 落地',
      summary:
        '擴充 pytest 測試並接上 GitHub Actions，建立 80% 以上 coverage 基線，讓後端改動開始有穩定回歸保護。',
      type: 'quality',
      evidence: ['pytest', 'coverage', 'GitHub Actions'],
      links: [{ label: '測試計畫', to: '/projects/PrAjeKt/測試計畫' }],
    },
    {
      date: '2026/04/02',
      phase: 'Phase 6',
      title: 'Blueprint / Service / Repository 邊界收斂',
      summary:
        'auth、groups、tasks 主線完成分層整理，移除 service 中散落查詢，讓後端責任邊界更清楚。',
      type: 'architecture',
      evidence: ['Blueprint', 'Service', 'Repository'],
      links: [
        {
          label: '分層收斂報告',
          to: '/projects/PrAjeKt/後端分層重構收斂報告_2026-04-02',
        },
      ],
    },
    {
      date: '2026/04/04',
      phase: 'Phase 6.0',
      title: '本地 PostgreSQL 遷移完成',
      summary:
        '修復 migration 鏈、補齊 schema 與資料遷移工具，將開發主線從 SQLite 推進到 PostgreSQL。',
      type: 'architecture',
      evidence: ['Migration chain', 'Data migration', 'PostgreSQL'],
      links: [
        { label: '開發資料庫遷移流程', to: '/projects/PrAjeKt/Phase6_0_開發資料庫遷移流程' },
      ],
    },
    {
      date: '2026/04/06',
      phase: 'Phase 6.3+',
      title: 'Copilot + MCP 工具路由完成',
      summary:
        '建立 MCP bridge 與 Copilot 編排層，讓自然語言能選擇後端工具並批次建立任務，AI 從文字建議走向工具執行。',
      type: 'ai',
      evidence: ['MCP bridge', 'Tool selection', 'Batch create'],
      links: [
        { label: 'MCP 整合詳解', to: '/projects/PrAjeKt/Phase6_3_Copilot_MCP整合詳解' },
        { label: 'MCP Tool Calling', to: '/projects/PrAjeKt/MCP_Tool_Calling_整合指南' },
      ],
    },
    {
      date: '2026/04/17',
      phase: 'Phase 7.1',
      title: '週報與衝突檢查 MVP',
      summary:
        '新增 weekly report 與 conflict check API，讓 timeline 不只管理任務，也能回顧進度與提前檢查排程衝突。',
      type: 'feature',
      evidence: ['Weekly report', 'Conflict check', 'Privacy guard'],
      links: [{ label: 'Phase 7 精簡版', to: '/projects/PrAjeKt/Phase7_精簡執行版' }],
    },
    {
      date: '2026/04/20',
      phase: 'Phase 7.2',
      title: '進度風險分析與依賴圖視覺化',
      summary:
        '任務支援前置依賴，新增 critical path 與 risk analysis，並在前端渲染依賴圖，讓計畫風險變得可檢查。',
      type: 'ai',
      evidence: ['Critical path', 'Risk analysis', 'Dependency graph'],
      links: [{ label: 'Phase 7.2 詳解', to: '/projects/PrAjeKt/Phase7_2_進度風險分析詳解' }],
    },
    {
      date: '2026/05/08',
      phase: 'Phase 7.3',
      title: '知識庫、Project Files 與 RAG 閉環',
      summary:
        '完成個人知識庫、專案檔案區、source_references 契約與 RAG fallback，讓 AI 規劃能追溯到歷史任務與知識文件。',
      type: 'ai',
      evidence: ['Knowledge base', 'Project Files', 'source_references'],
      links: [
        { label: '知識增強規劃', to: '/projects/PrAjeKt/Phase7_3_知識增強規劃詳解' },
        { label: 'RAG 前端對齊', to: '/projects/PrAjeKt/Phase7_3_RAG_前端對齊與操作規劃' },
      ],
    },
  ],
}
