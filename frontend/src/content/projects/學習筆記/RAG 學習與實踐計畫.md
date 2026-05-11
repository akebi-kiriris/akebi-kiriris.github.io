---
title: RAG 學習與實踐計畫
date: 2026-05-11
tags: [規劃, 部署, AI, 後端]
summary: 整理「RAG 學習與實踐計畫」主題，重點包含：> **目標**:在 4 月初前掌握 RAG 核心概念、建立可評估的 RAG 系統 >
status: 草稿
---

# RAG 學習與實踐計畫

> **目標**:在 4 月初前掌握 RAG 核心概念、建立可評估的 RAG 系統
> 
> **預計投入**:2-3 週（15-20 小時）
> 
> **最終成果**:可跑的本地知識問答系統 + 評估報告

---

## 🧭 全文詳細大綱（先讀這裡）

### A. 閱讀方式
1. 先看分階段學習計畫總覽，理解每章要解決的問題
2. 第一階段按 1.1 → 1.5 依序學，先把最小可跑版本打通
3. 第二階段按 2.1 → 2.2 聚焦優化與評估
4. 附錄教材放在文末，需要補充時再查

### B. 第一階段（第 1-3 天）:基礎到可跑
1. 1.1 RAG 核心概念與架構
2. 1.2 環境準備與知識庫構建
3. 1.3 文本分塊（Chunking）
4. 1.4 向量嵌入與向量庫原理（純講解 + 最小示例）
5. 1.5 生成集成與 Prompt 工程

### C. 第二階段（第 4-7 天）:優化與評估
1. 2.1 檢索優化（Hybrid / Query Rewriting / Re-ranking）
2. 2.2 RAG 系統評估（Recall、幻覺率、報告模板）

### D. 收尾
1. 附錄 A：延伸教材與參考連結（選讀）
2. 後續安排（實作暫緩）

**閱讀提醒**:
- 本文主線採「先能跑、再優化」順序，避免一開始陷入選型細節。
- 向量庫章節先講原理與評估框架，不在主線中做工具推薦。

---

## 🎯 分階段學習計畫

### 第一階段:基礎概念 & 最小可跑版本（第 1-3 天）

目標:理解 RAG 架構，能跑通一個簡單 demo

#### 1.1 RAG 核心概念與系統架構深度解析

##### 📖 第一部分:什麼是 RAG？概念、問題背景與必要性

在開始 RAG 學習之前，必須深入理解「為什麼我們需要 RAG」這個根本問題。看似簡單的一句「Retrieval Augmented Generation」背後，實則反映了當今大型語言模型面臨的深層困境。

**定義與核心概念**

RAG（檢索增強生成）是一種混合型 AI 技術架構，其核心思想是:**不依賴模型預訓練知識，而是在生成過程中即時從外部知識庫檢索相關資訊，與用戶查詢結合，輸入給 LLM 生成答案**。換句話說，它將「知識存儲」（知識庫）與「知識應用」（LLM）分開，通過動態檢索來彌補 LLM 的知識限制。

這個看似簡單的思路實際上解決了 LLM 時代的一個本質矛盾:**訓練時間 vs. 知識實時性**。傳統微調方案要求定期對模型重新訓練才能更新知識，而 RAG 只需要更新知識庫文件，大幅降低了維護成本。


**技術原理**

RAG 系統是如何實現「參數化知識」與「非參數化知識」的結合呢?其架構主要通過兩個階段來完成這一過程:

**1. 檢索階段:尋找“非參數化知識”**
- 知識向量化 : 嵌入模型（Embedding Model） 充當了“連接器”的角色。 它將外部知識庫編碼為向量索引（Index），存入向量資料庫 。
- 語義召回 :當使用者發起查詢時，檢索模組利用同樣的嵌入模型將問題向量化，並通過相似度搜尋（Similarity Search），從海量數據中精準鎖定與問題最相關的文檔片段。

**2. 生成階段:融合兩種知識**

- 上下文整合 : 生成模組接收檢索階段送來的相關文檔片段以及使用者的原始問題。
- 指令引導生成 :該模組會遵循預設的 Prompt 指令，將上下文與問題有效整合，並引導 LLM（如 DeepSeek）進行可控的、有理有據的文本生成。

![image](https://github.com/datawhalechina/all-in-rag/raw/main/docs/chapter1/images/1_1_1.svg)

**技術演進分類**

RAG 的技術架構經歷了從簡單到複雜的演進，大致可分為三個階段:

![image](https://github.com/datawhalechina/all-in-rag/raw/main/docs/chapter1/images/1_1_2.png)

這三個階段的具體對比如表所示:

| 維度 | 初階 RAG（Naive RAG） | 高級 RAG（Advanced RAG） | 模組化 RAG（Modular RAG） |
|----|---------------------|-------------------------|--------------------------|
| 流程 | 離線:索引；線上:檢索 → 生成 | 離線:索引；線上:檢索前優化 → 檢索 → 檢索後優化 | 積木式可編排流程 |
| 特點 | 基礎線性流程 | 增加檢索前後的優化步驟 | 模組化、可組合、可動態調整 |
| 關鍵技術 | 基礎向量檢索 | 查詢重寫（Query Rewrite）、結果重排（Rerank） | 動態路由（Routing）、查詢轉換（Query Transformation）、多路融合（Fusion） |
| 局限性 | 效果不穩定，難以優化 | 流程相對固定，優化點有限 | 系統複雜性高 |

>“離線”指提前完成的數據預處理工作（如索引構建）;「線上」指使用者發起請求後的實時處理流程。



**深度問題分析:為什麼大型語言模型需要補強？**

當前所有主流 LLM（GPT-4、Claude、Gemini 等）都存在以下四大固有限制，這些限制直接導致 RAG 的出現:

**1. 知識截止日期問題（Knowledge Cutoff）**

GPT-3.5 的訓練數據截止於 2021 年 4 月，GPT-4 約為 2024 年 4 月。這意味著:
- 發生於截止日期之後的任何事件，模型完全無法理解
- 2024 年底「某公司新產品發布」、「新政策出台」等，模型一無所知
- 對於不斷演進的技術領域（AI、編程框架、API 更新），模型知識快速老化
- 實例:用 GPT-3.5 詢問「2024 年 Python 3.12 有什麼新特性」，模型會拒絕或編造

**2. 幻覺問題（Hallucination）**

LLM 會以極高的自信度編造不存在的資訊。這不是故意欺騙，而是模型一個內在的數學特性:
- 給定 Token 序列，模型基於統計概率預測下一個 Token
- 當遇到超出訓練分布的問題時，模型會「創造」回答
- 典型例子:
  ```
  Q: 「周傑倫的第 20 張專輯名叫什麼？」
  A (GPT-3.5): 「《未來夢想》，發行於 2023 年...」（純屬編造，周傑倫沒有這張專輯）
  ```
- 統計顯示，在開放域問題上，LLM 的幻覺率可高達 30-50%
- 幻覺對企業應用極具破壞性:法律文件引用錯誤、醫療建議錯誤、財務數據錯誤都可能導致嚴重後果

**3. 領域知識缺乏（Domain Knowledge Gap）**

通用 LLM 不可能掌握任何組織的私有知識。這包括:
- **企業內部文檔**:公司內部流程、產品文檔、代碼庫說明、決策歷史
- **個人知識**:個人管理系統、筆記、學習記錄、項目文檔
- **隱私資訊**:客戶數據、合同、機密戰略規劃
- **新興領域**:新興學科、小眾行業、特定公司的學問

即使這些知識本身不算罕見，但涉及隱私時將其上傳給 OpenAI 或 Anthropic 就變成了風險問題。

**4. 成本與資源限制（Fine-tuning Cost）**

微調方案雖然理論上可行，但成本極高:
- 需要 2000-5000 個標註訓練樣本（數月標註工作）
- 需要 GPU 資源（A100 級別，$3000-5000/月租賃成本）
- 調試和優化週期長（1-2 周）
- 每次更新知識都要重新訓練（迭代慢）
- 微調後模型容易 catastrophic forgetting（遺忘其他知識）

成本計算:採用微調方案 = 標註成本 ¥30,000-50,000 + GPU 租賃 $500-1000 × 2 周 + 工程師工資 = 總成本 ¥100,000 以上。相比之下，RAG 成本不到微調的 1/10。

**RAG 如何解決這些問題**

每個 LLM 的基本限制都有對應的 RAG 解決方案:

| 問題 | LLM 局限 | RAG 解決方案 | 效果 |
|------|---------|-----------|------|
| 知識過期 | 訓練數據截止，無法更新 | 知識庫文件實時可更新，無需重訓 | ✅ 秒級更新，可擴展至 GB-TB 規模 |
| 幻覺率高 | 無法知道自己不知道什麼 | 檢索結果明確，填補知識空白，促進事實準確 | ✅ 幻覺率從 30-50% 降至 < 10% |
| 領域知識缺 | 跨越訓練分布的知識毫無辦法 | 將專有文檔存入知識庫，檢索時提供精確上下文 | ✅ 可適配任何領域，0 知識洩露 |
| 成本巨大 | 微調需數百萬成本 | 只需向量搜尋 + API 調用，無需訓練 | ✅ 成本 1/10 或更低，部署時間 2-3 天 |

**加強讀物技巧:理解 RAG 為什麼有效**

RAG 之所以有效，從資訊論角度看，是因為它大幅降低了 LLM 生成的**熵（uncertainty）**。在沒有上下文的情況下，LLM 面對一個開放問題時熵很高（可能的回答太多），而一旦提供了精確的檢索結果作為上下文，模型的選擇空間就被限制在現有文檔中，從而大幅提升準確性。

打個比喻:
- **不用 RAG**:「根據你的知識，宇航員登上火星的挑戰是什麼？」→ LLM 自由發揮，高概率編造
- **用 RAG**:「根據以下文章，宇航員登上火星的挑戰是什麼？[文章內容...]」→ LLM 只能從給定文章提取，準確性大幅提升

---

**RAG 與微調的全方位對比**

很多初學者會問:「既然微調也能增強 LLM，為什麼要用 RAG？」答案是:**微調和 RAG 各有所長，選擇應該基於使用場景**。

![image](https://github.com/datawhalechina/all-in-rag/raw/main/docs/chapter1/images/1_1_3.svg)

| 維度 | RAG | 微調 | 何時選擇 RAG | 何時選擇微調 |
|------|-----|------|----------|-----------|
| **部署時間** | 2-3 天 | 1-2 週（含準備） | ✅ 快速上線需求 | ❌ 可接受延遲 |
| **成本** | $10-50/月（API + 存儲） | $500-5000（GPU + 標註） | ✅ 成本受限 | ❌ 預算充足 |
| **更新頻率** | 即時（秒級） | 數天到數週 | ✅ 知識頻繁變化 | ❌ 知識相對穩定 |
| **知識容量** | 無上限（GB-TB） | 受模型大小 10%-50%限制 | ✅ 超大知識庫 | ❌ 知識量可控 |
| **準確性** | 很高（基於真實文檔） | 變數大（依賴數據品質） | ✅ 對準確性要求高 | ❌ 樂意接受不確定性 |
| **可解釋性** | 完美（引用原文檔） | 低（黑盒） | ✅ 需要可追溯性 | ❌ 可接受黑盒 |
| **知識遷移** | 自動對接新領域 | 需完全重新訓練 | ✅ 跨領域應用 | ❌ 單一領域深耕 |
| **隱私性** | 完全保護（私有知識庫） | 數據進入第三方服務器 | ✅ 涉及敏感資訊 | ❌ 公開資訊 |
| **維護難度** | 簡單（更新文件） | 複雜（重新標註+訓練） | ✅ 團隊規模小 | ❌ 有專門 ML 團隊 |

**進階技巧:混合方案**

實際上，最優的架構是 **RAG + 微調的混合方案**:
1. 用 RAG 處理 80% 的常見問題（快速、低成本）
2. 用微調處理 20% 的領域特定高價值問題（高精度）
3. 針對特定風格要求（寫詩、編代碼風格）使用微調
4. 對於需要多步推理的複雜問題，先用 RAG 檢索背景，再用微調模型生成

---

**應用場景速查表:何時選擇 RAG**

根據以下特徵快速確定是否適合 RAG:

| 場景 | 適合 RAG 嗎 | 理由 | 技術重點 |
|------|---------|------|---------|
| 企業內部文檔問答系統 | ✅ 適合 | 知識庫穩定，需隱私，無需風格轉變 | 私有資料治理、可追溯引用 |
| 實時新聞 FAQ 系統 | ✅ 最適合 | 需頻繁更新、無需微調 | 高頻索引更新、低延遲查詢 |
| 個人知識庫系統（筆記、Blog 搜尋） | ✅ 適合 | 私有知識、量大、無風格需求 | 輕量化部署、資料去重 |
| 法律文件查詢系統 | ✅ 最適合 | 需高準確性、可追溯性、隱私 | 嚴格引用、人工覆核流程 |
| 編程助手（代碼補全、API 查詢） | ✅ 適合 | API 文檔多、頻繁變化、需精確匹配 | 關鍵詞 + 語義混合檢索 |
| 創意寫作（詩歌、故事） | ❌ 不適合 | 需要風格轉變，微調更好 | 風格學習、長文本創作能力 |
| 代碼審查指導（風格糾正） | ❌ 需要微調 | 涉及風格和習慣改變 | 專域數據微調 |
| 複雜推理題（數學、邏輯） | ⚠️ 混合最好 | 背景資訊用 RAG，推理用專門模型 | 推理鏈控制、答案驗證 |
| 客服對話助手 | ✅ 適合 | 回答一致性需求、FAQ 完整 | 多輪記憶、對話狀態管理 |
| 醫療診斷助手 | ✅ 適合 | 需要最新臨床指南、可落責 | 風險管控與專家覆核 |

---

##### 🏗️ 第二部分:RAG 系統的三大核心構件全面解析

一個完整的 RAG 系統並非一個整體，而是由三個相對獨立又緊密配合的組件構成。理解這三個構件的角色、工作原理和常見問題，是掌握 RAG 的關鍵。

**構件 1:檢索器（Retriever）— RAG 系統的前哨**

*角色與使命*

檢索器的使命很清晰:**給定用戶查詢，從龐大的知識庫中找出最相關的1-10份文檔片段**。它是 RAG 系統的「眼睛」，決定了系統能否看見正確的資訊。

*工作流程的詳細解析*

讓我們追蹤一個具體的查詢如何通過檢索器處理:

```
1️⃣ 用戶提問:「微調訓練中 weight_decay 參數設為多少最佳？」

2️⃣ 查詢向量化
  - 輸入:中文自然語言查詢 (20 個字)
   - 嵌入模型:OpenAI text-embedding-3-small
   - 輸出:512 維向量（每個維度是 -1 到 1 的浮點數）
   - 含義:第一維可能代表「超參優化」概念，第三維代表「訓練穩定性」等
   - 計算時間:~100-200 ms

3️⃣ 相似度計算（向量空間搜尋）
   - 方法:餘弦相似度 cos(θ) = (A·B)/(|A||B|)
   - 對比對象:知識庫中所有 5000 個文檔片段（也都已向量化）
   - 時間複雜度:O(n) = 5000 × 計算 ~50ms
   - 結果:5000 個相似度分數 (0 到 1 之間)

4️⃣ Top-K 檢索
   - K = 5（通常選擇）
   - 取出相似度最高的 5 個文檔片段
   - 相似度範圍:通常 0.75-0.95（相對很高）

5️⃣ 相關性過濾（可選，防止噪聲）
   - 若設置相似度閾值 > 0.6，低於此分數的結果被拋棄
   - 實例:如果 Top-5 中第 3 個文檔相似度只有 0.58，被篩掉了

6️⃣ 返回結果
   - 返回給下一階段的上下文:
   ```
   [
     (分數 0.92) "weight_decay 用於 L2 正則化，建議值為 1e-4 到 1e-2...",
     (分數 0.88) "在 Adam 優化器中，weight_decay 等效於...",
     (分數 0.84) "實驗顯示 weight_decay=1e-5 時過擬合最少...",
     ...
   ]
   ```
   - 這些文本被拼接成一個大段落，成為 LLM 的「背景知識」
```

*檢索品質的量化評估*

如何判斷檢索器靠不靠譜？用以下三個核心指標（都是你後續評估和優化時需要計算的）:

**Recall@K（召回率）**
- 定義:假設某個查詢的相關文檔有 M 份，Top-K 檢索中命中了 R 份，則 Recall@K = R/M
- 直白例子:
  ```
  查詢:「weight_decay 最佳實踐」
  知識庫中所有相關文檔:10 份（我們通過人工標註知道）
  Top-5 檢索結果:命中了 4 份相關文檔
  Recall@5 = 4/10 = 40%
  
  這表示系統漏掉了 60% 的相關資訊，不夠好。
  目標通常是 Recall@5 ≥ 80%，即找到 8 份相關文檔中的至少 7 份。
  ```
- 為什麼重要？Recall 高意味著 LLM 能看見充分的背景資訊，生成答案會更全面、更少幻覺。

**MRR (Mean Reciprocal Rank)**
- 定義:衡量最相關文檔排在第幾位。計算方式是 1/(首個相關文檔的排名)
- 例子:
  ```
  查詢:「weight_decay 最佳實踐」
  檢索結果排序:
    1. [相似度 0.95] 「重要:weight_decay 建議 1e-4...」← 這是相關文檔
    2. [相似度 0.92] 「Adam 優化器介紹」
    3. [相似度 0.85] 「L2 正則化原理」
  
  MRR = 1/1 = 1.0（最好的情況）
  
  反面例子:
    1. [相似度 0.98] 「優化器概述」← 無關
    2. [相似度 0.96] 「超參搜尋工具」← 無關
    3. [相似度 0.92] 「weight_decay 建議 1e-4...」← 相關文檔在第 3 位
  
  MRR = 1/3 = 0.33（不夠好，相關文檔排得太後面）
  ```
- 為什麼重要？MRR 高意味著檢索結果按相關性排序得很好，LLM 會優先看見最相關的文檔。

**NDCG@K (Normalized Discounted Cumulative Gain)**
- 定義:綜合考慮相關文檔的排名位置，給排名靠前的相關文檔更高的權重
- 公式簡化理解:$NDCG@K = \frac{1}{IDCG} \sum_{i=1}^{K} \frac{2^{rel_i}-1}{\log_2(i+1)}$
  - $rel_i$ = 第 i 個結果的相關程度（0 = 無關，1 = 相關，2 = 非常相關）
  - 越往前的結果（i 越小），$\log_2(i+1)$ 越小，相關性被「折現」越少（權重越高）
- 實際應用不用手算，LangChain 或專業評測工具會自動計算

*常見檢索失敗模式與診斷方法*

| 失敗現象 | Root Cause | 診斷方法 | 解決方案 |
|---------|----------|---------|---------|
| 返回全是無關文檔 | chunk_size 太大（500+ 字），核心資訊被淹沒 | 查看檢索到的文本，看有多少百分比是相關的 | 改小 chunk_size 至 512-1024 |
| 始終返回同一份文檔 | 向量庫有重複文檔或分塊方式帶入重複 | 檢查向量庫中是否有完全相同的向量 | 去重後重建向量庫 |
| 找不到明顯相關的文件 | Query 措辭與知識庫用語差異大（同義詞問題） | 用相同關鍵詞在知識庫搜尋，確認是否存在 | 啟用 Query Rewriting 或使用混合搜尋 |
| 相似度分數都特別低 | 嵌入模型不適配該領域 | 檢查平均相似度是否 < 0.5 | 嘗試領域特定的嵌入模型或微調 |

---

**構件 2:分塊器（Chunker）— 知識庫的「大廚」**

*為什麼分塊是必要的？*

如果說檢索器是 RAG 的「眼睛」，分塊器就是「刀工師傅」。沒有正確的分塊，再好的檢索器也發揮不了作用。

想像一個極端場景:

```
❌ 壞做法:把一份 100KB 的技術文檔當作整體向量化
  - OpenAI embedding 模型限制 8192 tokens，但該文檔有 30,000 tokens
  - 被迫截斷，丟失 70% 內容
  - 向量無法充分表達文檔語義

✅ 好做法:把文檔分成 30 個 1000-token 的片段，分別向量化
  - 每個 chunk 都完整向量化，保留所有語義資訊
  - 用戶查詢能準確匹配某個片段，而不是全文
  - 記憶體使用更高效
```

*分塊帶來的直接影響*

分塊決定了:
1. **檢索精度**:塊太大 → 核心資訊被雜訊埋沒；塊太小 → 上下文丟失
2. **成本**:一個知識庫被分成 100 個 chunks vs 1000 個 chunks，成本差 10 倍
3. **延遲**:塊數多 → 檢索速度慢，搜尋 10,000 個 chunks 比搜尋 1000 個慢 10 倍
4. **LLM 上下文窗口利用率**:chunk 太大，LLM 提示詞被上下文佔滿；chunk 太小，LLM 看不到足夠背景

*分塊策略與參數（摘要）*

這裡先保留「理解層」的最小原則，完整實作和參數實驗統一放在 `1.3 文本分塊`，避免重複:

1. 先用 `RecursiveCharacterTextSplitter` 作為預設。
2. 起始參數用 `chunk_size=1000`、`overlap=200`，再按評估結果調整。
3. 若是高密度知識（法務、醫療、技術手冊），可先嘗試較小 chunk。
4. 若是長篇敘述文件，適度提高 overlap 以保留上下文。

> 詳細的分塊策略比較、overlap 場景配置、Token 計數範例與完整代碼，請集中看 `1.3`。

---

**構件 3:生成器（Generator）— RAG 系統的「大腦」**

*角色與決策*

生成器的工作很直接:**給定檢索到的上下文 + 用戶查詢，用 LLM 生成最終答案**。但選擇什麼 LLM、如何部署，涉及成本、品質、延遲多個維度的權衡。

*三大部署方案對比*

**方案 A:OpenAI API（推薦新手起步）**

特點:無需本地資源，開箱即用，API 調用式

優點:
- 無需基礎設施投資
- API 極其穩定可靠
- 更新頻繁，能用上最新模型

缺點:
- 有成本（雖然不高）
- 依賴網絡連接
- 數據可能被 OpenAI 日誌記錄（對隱私敏感應用有風險）

---

**方案 B:本地開源模型（進階選項）**

特點:完全免費、私有、更新靈活，但需要一定技術成本

缺點:
- 需要 GPU 硬件（你已有）、內存充足
- 部署和維護需要技術
- 模型品質可能低於 GPT-4 （但接近 GPT-3.5）
- 更新靠社區，可能不如商業模型及時

---

**方案 C:混合方案（實戰推薦）**

最優實踐:根據查詢複雜度動態選擇

```python
def select_generator(query):
    complexity_score = estimate_complexity(query)
    
    if complexity_score < 3:  # 簡單事實題
        return "mistral_7b_local"  # 更快、免費
    elif complexity_score < 5:  # 中等複雜度
        return "gpt-3.5-turbo"  # 平衡品質和成本
    else:  # 複雜推理題
        return "gpt-4"  # 最高品質

# 實例
select_generator("weight_decay 怎樣設置？")  # 簡單 → Mistral
select_generator("如何在不同數據集上選擇微調超參？")  # 中等 → GPT-3.5
select_generator("基於我正在進行的實驗，如何解決過擬合？")  # 複雜 → GPT-4
```

好處:
- 簡單查詢便宜、快速
- 複雜查詢保證品質
- 整體成本和性能達到平衡

---

##### ⚙️ 第三部分:簡單 RAG 與複雜 RAG 的架構差異

一旦你理解了 Retriever + Chunker + Generator 的基本工作流程，就可以開始思考如何優化系統。這正是簡單 RAG 與複雜 RAG 的區別所在。

**簡單 RAG:五步直線流程**

簡單 RAG 的工作流程是串聯的 5 個步驟:

```
[1] User Query
    ↓
    └─ 例:「微調中如何防止過擬合？」
    
[2] Query Embedding
    ↓ 用嵌入模型將查詢轉換為向量
    └─ "微調中如何防止過擬合？" → [向量 512 維]
    
[3] Vector Similarity Search
    ↓ 在向量庫中搜尋最相似的 chunk
    └─ 返回 Top-5 chunks
    
[4] Prompt Assembly
    ↓ 把檢索結果組成 LLM Prompt
    └─ """基於以下文檔回答:
        {檢索到的 5 個 chunks}
        用戶問題:微調中如何防止過擬合？
        回答:"""
    
[5] LLM Generation
    ↓ LLM 根據上下文生成答案
    └─ 「過擬合可通過 weight_decay、早停、數據增強...」
    
[6] End User
    ↓ 返回答案給用戶
    └─ 「微調防過擬合的三大技巧是...」
```

適用場景:
- 知識庫相對穩定，查詢相對直接
- 簡單事實題、常見 FAQ
- 不需要多輪推理

優勢:
- 實現簡單（一周內可完成原型）
- 可預測性強（容易進行性能分析）
- 部署快

缺點:
- 無法處理複雜查詢（「基於你的知識，有沒有其他方案？」）
- 無法檢測毫不相關的查詢（可能返回錯誤答案而非「無相關資訊」）
- 無法進行多跳推理

---

**複雜 RAG:多層優化架構**

複雜 RAG 在簡單版本基礎上增加了多個優化層。讓我詳細說明:

```
[1] User Query: 「微調與 RAG 哪個更適合我的場景？」

[2A] Query Understanding & Rewriting（新增）
     ↓ LLM 進行 Query 改寫，使其更容易被檢索
     └─ 改寫:「微調的優缺點是什麼？RAG 的優缺點是什麼？」
     └─ 改寫:「微調和 RAG 的對比」
     └─ 生成 3 個不同變體，分別檢索（增加召回）

[2B] Query Expansion（新增）
     ↓ 補充關鍵詞
     └─ 原查詢:「微調」
     └─ 擴展:「微調」+ 「fine-tuning」+ 「參數更新」+ 「模型適配」

[3] Multi-Strategy Retrieval（改進）
    ├─ 策略 1:向量搜尋（基於語義）
     │   └─ 返回 10 個 chunks
    ├─ 策略 2:BM25 搜尋（精確關鍵詞匹配）
     │   └─ 返回 10 個 chunks
     └─ 結果合併去重
         └─ 共 15 個 candidates

[4] Re-ranking（新增）
     ↓ 用 CrossEncoder 對 15 個 candidates 重排
     └─ CrossEncoder 的評分更精確，會彙整考慮 Query + Chunk 的聯合相關性
     └─ 最終保留 Top-5

[5A] Multi-hop Retrieval（新增，用於複雜查詢）
     ↓ 識別查詢涉及多個主題
     └─ 第一跳:檢索「微調優缺點」
     └─ 第二跳:檢索「RAG 優缺點」
     └─ 第三跳:檢索「微調 vs RAG 對比」
     └─ 彙總 3 輪結果作為背景

[6] Prompt Assembly with Instructions（改進）
     ↓ 更精細的 Prompt 設計
     └─ """You are an expert assistant. Answer based strictly on the documents.
        If information is not in the documents, say so clearly.
        
        ## Documents:
        {15 個精選 chunks}
        
        ## User Query:
        微調與 RAG 哪個更適合我的場景？
        
        ## Answer Format:
        1. [微調適用場景]
        2. [RAG 適用場景]
        3. [混合方案]
        4. [我的建議]
        """

[7] LLM Generation with Chain-of-Thought（改進）
     └─ LLM 逐步說明推理過程
     └─ 「首先，微調適合...因為...」
     └─ 「其次，RAG 適合...因為...」
     └─ 「綜合考慮，我建議...」

[8] Output Verification（新增）
     ├─ 檢查引文是否真的在文檔中
     ├─ 檢查邏輯是否一致
     └─ 若檢驗失敗，提示用戶

[9] End User
     └─ 「根據你的場景，建議使用 RAG，因為...」
```

新增的優化點:
- Query Rewriting:改寫查詢使其更容易被檢索
- Multi-hop:對複雜查詢進行多輪檢索
- Re-ranking:重排檢索結果以提升相關性
- Prompt Engineering:更複雜的 Prompt 設計
- Output Verification:驗證輸出正確性

適用場景:
- 複雜開放式問題
- 需要推理和綜合多份文檔
- 對準確性要求極高

成本:增加 30-50% 計算時間和成本（換來 20-30% 準確性提升）

---

**本階段策略:先建基礎，後加優化**

根據經驗，最佳的學習路徑是:

1. **第 1-3 天:掌握簡單 RAG（當前階段）**
   - 完整理解 3 個構件
   - 能跑通完整流程
   - 度量 Recall、準確性等基本指標

2. **第 4-7 天:學習複雜 RAG 的一個優化**
   - 比如先學 Query Rewriting
   - 看看效果如何提升
   - 然後加入 Re-ranking

3. **第 8+ 天:多層優化（如果時間允許）
   - 結合多個優化技巧
   - 做系統性的 Ablation 實驗
   - 找到針對你的知識庫最有效的組合

不要一次全做，容易陷入「特性爆炸」而無法聚焦。簡單的東西做好，比複雜的東西都做不好更有價值。

---

#### 1.2 環境準備與知識庫構建實戰指南

##### 📦 RAG Python 環境從零到一

在開始動手前，需要構建一個完整的 Python 開發環境。環境搭建決定了 RAG 系統的穩定性、可達性和代碼品質。不含糊其邊的環境搭建往往能避免 80% 的隱性障礙。

**為什麼虛擬環境這麼重要？**

RAG 項目依賴多個相互關聯的包（langchain、faiss、openai 等），版本配置稍有不當就會產生難以調試的問題。虛擬環境通過隔離項目依賴來解決這一問題:
- 不同項目可能需要同一包的不同版本，全局安裝會導致版本衝突
- 隔離環境使項目可復現，便於團隊協作
- 卸載項目時只需刪除一個目錄，不污染系統環境

**五步驟環境配置完整指南**

- **詳細安裝步驟及常見問題排查**:
  ```bash

  # === 步驟 1:虛擬環境建立 ===
  python -m venv rag_venv

  # === 步驟 2:激活虛擬環境（根據系統選擇）===
  # Windows (PowerShell)
  .\rag_venv\Scripts\Activate.ps1
  # 如果遇到權限錯誤，執行:
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

  # Windows (Command Prompt)
  rag_venv\Scripts\activate

  # Linux/Mac
  source rag_venv/bin/activate

  # === 步驟 3:升級 pip（避免版本衝突）===
  python -m pip install --upgrade pip setuptools wheel

  # === 步驟 4:安裝核心依賴（推薦按順序）===
  # 第一組:基礎框架
  pip install langchain==0.1.20  # 指定版本避免不兼容
  pip install langchain-community==0.0.40
  pip install langchain-openai==0.1.15

  # 第二組:向量和 LLM
  pip install llama-index==0.9.50
  pip install faiss-cpu==1.7.4  # 或 faiss-gpu 如果有 NVIDIA GPU
  pip install openai==1.43.0

  # 第三組:工具包
  pip install pandas==2.0.0
  pip install numpy==1.24.0
  pip install python-dotenv==1.0.0
  pip install pyyaml==6.0

  # 第四組:可選（PDF 支援）
  pip install pypdf==4.0.0
  pip install pdf2image==1.16.3

  # === 步驟 5:全面驗證 ===
  python -c "
  import langchain; print(f'✓ langchain {langchain.__version__}')
  import faiss; print('✓ faiss-cpu')
  from langchain_openai import OpenAIEmbeddings; print('✓ langchain-openai')
  import llama_index; print('✓ llama-index')
  print('\n✅ 所有依賴安裝成功！')
  "
  ```
    - **常見安裝問題排查表**:
      | 錯誤 | 原因 | 解決方案 |
      |------|------|----------|
      | "ImportError: No module named langchain" | 未激活虛擬環境 | 再次運行 Activate 腳本 |
      | "pip wheel failed" | 依賴版本衝突 | `pip install --upgrade pip` 後重試 |
      | "FAISS: ImportError" | np.int 廢棄（numpy 1.24+） | `pip install numpy==1.23.5` |
      | "OpenAI API key not found" | 環境變量未設 | 見下方 API 密鑰配置 |
      | 「装 CUDA 版 faiss」建議 | 想用 GPU 加速 | `pip uninstall faiss-cpu && pip install faiss-gpu-cu11` |
    - **OpenAI API 密鑰配置**（3 種方式）:
      - 方式 1:環境變量（推薦）
        ```bash
        # 臨時設置（重啟後失效）
        $env:OPENAI_API_KEY="sk-xxxx..."
        
        # 永久設置（編輯系統環境變量）
        # 或在代碼中:
        import os
        os.environ["OPENAI_API_KEY"] = "sk-xxxx..."
        ```
      - 方式 2:.env 文件（最安全）
        ```
        # 在項目根目錄創建 .env
        OPENAI_API_KEY=sk-xxxx...
        
        # 在代碼中加載
        from dotenv import load_dotenv
        load_dotenv()
        ```
      - 方式 3:直接在代碼中傳遞
        ```python
        from langchain_openai import OpenAIEmbeddings
        embeddings = OpenAIEmbeddings(api_key="sk-xxxx...")
        ```
    - **包功能對照說明**:
      | 包名 | 版本 | 核心功能 | 依賴項 | 備註 |
      |------|------|--------|--------|------|
      | **langchain** | 0.1.x | RAG 框架、Chain 組合、Prompt 管理 | 無 | 必須 |
      | **langchain-community** | 0.0.x | 第三方集成（Google、Hugging Face 等） | langchain | 推薦 |
      | **langchain-openai** | 0.1.x | OpenAI API 官方集成（比 openai 包更新） | langchain | 必須 |
      | **openai** | 1.4.x | 原生 OpenAI SDK（備用） | 無 | 備用 |
      | **faiss-cpu** | 1.7.x | 本地向量搜尋（CPU 版） | numpy | 本地用必須 |
      | **faiss-gpu-cu11** | 1.7.x | 向量搜尋 GPU 加速版 | CUDA 11.x | 可選 |
      | **llama-index** | 0.9.x | 數據索引、查詢引擎 | 無 | 推薦 |
      | **python-dotenv** | 1.0.x | 讀取 .env 環境文件 | 無 | 推薦（安全存密鑰） |
      | **pyyaml** | 6.0 | 配置文件解析 | 無 | 推薦 |
      | **pypdf** | 4.0.x | PDF 文本提取 | 無 | 處理 PDF 需要 |
      | **sentence-transformers** | 2.2.x | 本地嵌入模型 | torch | 不想用 OpenAI API 需要 |

##### 📚 第二部分:知識庫準備與本地文件加載體系

環境搭建好後，下一步是準備知識庫。知識庫的品質直接決定 RAG 系統的性能。「垃圾進垃圾出」這個原理在 RAG 系統上體現得最明顯。

**為什麼要用自己的文檔建立知識庫？**

很多初學者選擇使用公開數據集（如維基百科、新聞抓取集）進行測試。但這做法存在根本問題:
- 無法直觀體驗效果（不是在回答你熟悉的領域）
- 遠離真實應用場景（企業 RAG 系統通常面對私有文檔）
- 無法後續複用（公開數據集沒有後續價值，一次性消耗品）

相比之下，用自己的文檔搭建知識庫有三大優勢:
1. **即時反饋**:能快速判斷 RAG 是否真正理解了你的知識
2. **可後續複用**:搭建好的系統可以繼續應用在實際業務中
3. **貼近實戰**:所有問題和解決方案都是真實的，而非虛構場景

**推薦的知識庫文檔清單**

根據你的項目結構，以下文檔最適合作為初始知識庫素材:

```
優先級排序:
1. 微調深度解析.md              ← 你最熟悉的內容，深度足，最佳測試素材
2. 微調專項指南.md              ← 實踐指導，包含代碼示例
3. 學習與專案推進計畫.md        ← 提供項目上下文
4. LLM Course 課程筆記（如有）   ← 基礎概念參考
5. DistilBERT 微調經驗總結.md   ← 真實項目案例
```

為什麼選這些文檔？
- 涉及你最熟悉的領域（微調、LLM 優化），能快速驗證 RAG 的準確性
- 長度適中（不會太短導致無內容可檢索，也不會太長導致索引建立緩慢）
- 包含大量代碼片段，有利於測試「RAG 能否正確理解技術代碼」
- 覆蓋多個角度（概念、實踐、經驗），能全面測試檢索能力

**知識庫文件的品質檢查清單**

在把文件放入知識庫前，進行以下檢查以確保最佳品質:

| 檢查項 | 標準 | 為什麼重要 | 修復方案 |
|------|------|----------|--------|
| **文件編碼** | UTF-8 (中文檔必須) | 非 UTF-8 導致在加載時出現亂碼或 decode 錯誤，中斷整個流程 | VS Code 右下角選「UTF-8」，保存即可 |
| **文件大小** | 單個 < 10 MB，總計 < 100 MB | FAISS 全量載入內存，超大文件導致 OOM；API 有速率限制 | 大文件分割成多個小文件，或使用流式處理 |
| **文檔結構** | 有清晰的 Markdown 標題、段落劃分 | 結構清晰的文檔分塊效果好，最終檢索精度高 20-30% | 補充缺失的 Markdown 標題（如 # ## ###），拆分超長段落 |
| **語言一致性** | 主要用中文，避免大量英文混雜 | 混合語言降低嵌入模型的向量品質，造成語義理解偏差 | 決定知識庫的主要語言（本案例是中文），外文部分翻譯或隔離 |
| **特殊字符** | 避免過多特殊符號、表情符號、不可見字符 | 某些字符在 tokenization 步驟導致異常，破壞分塊邏輯 | 用正則表達式清理，或用文本編輯器的「查找替換」功能 |
| **重複內容** | 同一內容不應出現超過 2 次 | 重複內容導致向量庫中多個相同向量，浪費空間、計算資源，製造冗餘 | 手工去重或用 MD5 Hash 方式自動去重 |
| **敏感資訊** | 不包含密碼、API key、個人隱私數據 | 洩露敏感資訊導致安全風險，上傳雲端時風險加倍 | 用正則表達式掩蓋（如 `sk-proj-****...`），或直接刪除 |

**知識庫統計分析與預處理**

在正式開始向量化前，運行以下腳本來分析知識庫的統計特性，幫助你判斷知識庫是否適合進行 RAG:

```python
# 保存為 analyze_knowledge_base.py
import os
from pathlib import Path

def analyze_documents(directory="./knowledge_base"):
    \"\"\"分析知識庫文檔的統計資訊\"\"\"
    documents = []
    total_chars = 0
    file_stats = []
    
    # 遍歷目錄中所有 .md 和 .txt 文件
    doc_dir = Path(directory)
    for file_path in doc_dir.rglob("*.md"):
        if file_path.is_file():
            with open(file_path, encoding="utf-8") as f:
                content = f.read()
                char_count = len(content)
                line_count = content.count("\\n")
                total_chars += char_count
                
                file_stats.append({
                    "file": file_path.name,
                    "chars": char_count,
                    "lines": line_count,
                    "avg_line_length": char_count / (line_count + 1)
                })
                documents.append(content)
    
    # 統計分析
    print(f"\\n📊 知識庫統計報告")
    print(f"=" * 60)
    print(f"文檔總數: {len(documents)}")
    print(f"總字符數: {total_chars:,}")
    if len(documents) > 0:
        print(f"平均文檔大小: {total_chars // len(documents):,} 字符")
    
    print(f"\\n單個文檔明細:")
    print(f"{'-' * 60}")
    
    for stat in sorted(file_stats, key=lambda x: x['chars'], reverse=True):
        print(f"  {stat['file']:30s} {stat['chars']:8,} 字 {stat['lines']:6,} 行")
    
    print(f"\\n📈 估計計算成本和資源需求:")
    print(f"{'-' * 60}")
    
    # 估計 chunks 數量和成本
    estimated_chunks = total_chars // 1000  # 假設預設 chunk_size=1000
    embedding_cost_input = (estimated_chunks * 0.0000005)  # OpenAI embedding-3-small 價格
    print(f"  預計 chunks 數: ~{estimated_chunks}")
    print(f"  OpenAI embedding 成本: ~${embedding_cost_input:.4f}")
    print(f"  建立 FAISS 索引時間: ~{max(1, estimated_chunks // 100)} 秒")
    print(f"  FAISS 索引記憶體占用: ~{estimated_chunks * 512 * 4 / 1024 / 1024:.1f} MB")
    
    return documents

if __name__ == "__main__":
    os.makedirs("./knowledge_base", exist_ok=True)
    analyze_documents()
```

運行此腳本後，你會得到類似這樣的輸出:
```
📊 知識庫統計報告
============================================================
文檔總數: 5
總字符數: 245,678
平均文檔大小: 49,136 字符

單個文檔明細:
  微調深度解析.md                79,234 字   1,245 行
  微調專項指南.md                65,123 字   1,023 行
  ...

📈 估計計算成本和資源需求:
  預計 chunks 數: ~246
  OpenAI embedding 成本: ~$0.000615
  建立 FAISS 索引時間: ~2 秒
  FAISS 索引記憶體占用: ~0.5 MB
```

**本地文本加載與驗證的完整代碼範本**

建立了知識庫文件夾後，使用以下代碼加載並驗證文檔:

```python
# 保存為 load_knowledge_base.py
from pathlib import Path
from langchain_community.document_loaders import TextLoader, DirectoryLoader

def load_and_verify_documents(kb_directory="./knowledge_base"):
    \"\"\"加載並驗證知識庫文檔，確保品質\"\"\"
    
    print("📂 正在加載知識庫文檔...")
    
    # 使用 DirectoryLoader 加載所有 .md 文件
    loader = DirectoryLoader(
        path=kb_directory,
        glob="**/*.md",
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"}  # 重要:指定中文編碼
    )
    
    try:
        documents = loader.load()
    except Exception as e:
        print(f"❌ 加載失敗: {e}")
        return None
    
    if not documents:
        print(f"❌ 在 {kb_directory} 中未找到任何 .md 文件")
        print(f"   提示:檢查目錄是否存在，文件是否為 .md 格式")
        return None
    
    print(f"✅ 成功加載 {len(documents)} 個文檔\\n")
    
    # 統計資訊
    total_chars = sum(len(doc.page_content) for doc in documents)
    print(f"📊 統計資訊:")
    print(f"  總字符數: {total_chars:,}")
    print(f"  平均文檔大小: {total_chars // len(documents):,} 字符")
    
    # 逐檔案詳細資訊
    print(f"\\n📋 各文檔詳情:")
    for i, doc in enumerate(documents, 1):
        source = doc.metadata.get('source', 'Unknown')
        char_count = len(doc.page_content)
        preview = doc.page_content[:80].replace("\\n", " ")
        print(f"  {i}. {Path(source).name:30s} ({char_count:,} 字)")
        print(f"     預覽:「{preview}...」\\n")
    
    return documents

if __name__ == "__main__":
    kb_dir = "./knowledge_base"
    Path(kb_dir).mkdir(exist_ok=True)
    
    # 加載文檔
    docs = load_and_verify_documents(kb_dir)
    
    if docs:
        print("✅ 知識庫加載驗證成功！")
        print("   建議下一步:進行文本分塊（見 1.3 節）")
    else:
        print("❌ 加載失敗，請檢查知識庫目錄和文件格式")
```

成功執行此腳本後，你將看到一份完整的知識庫檔案報告，確認所有文件都正確加載。

---

#### 1.3 文本分塊 (Chunking) - 語義檢索的基石

文本分塊（Chunking）是 RAG 系統中最常被忽視卻至關重要的一環。並非所有文本都能直接被嵌入模型處理，也並非所有分塊策略都能帶來相同的效果。本節深入探討分塊的核心原理、科學設置方法，以及實戰中的最佳實踐。

大多數嵌入模型都基於 Transformer 編碼器。 其工作流程大致如下：
- **分詞 （Tokenization）**： 將輸入的文字塊分解成一個個 token。
- **向量化 （Vectorization）**： Transformer 為每個 token 生成一個高維向量表示。
- **池化 （Pooling）**： 通過某種方法（如取 [CLS] 位的向量、對所有 token 向量求平均 mean pooling 等），將所有 token 的向量壓縮成一個單一的向量 ，這個向量代表了整個文本塊的語義。

##### 📖 第一部分:為什麼要分塊？四大核心作用

**1. 嵌入模型 Token 限制突破**

不同的嵌入模型都存在最大 token 限制。這是一個硬性上限:
- OpenAI text-embedding-3:最大 8191 tokens (~32KB 文本)
- 本地 sentence-transformers/all-MiniLM-L6-v2:512 tokens
- multilingual-e5-large:512 tokens

這意味著一篇 100KB 的論文無法直接嵌入。不是「可能失敗」，而是「必然失敗」。分塊就是把大文檔切成小段，確保每個片段都在模型的能力範圍內。

**2. 檢索精度提升 30-50%**

直觀理解:完整文檔嵌入會把所有細節「壓縮」到一個向量中。想象你用一個 1536 維的向量描述整本書——肯定會丟失大量資訊。相比之下，只為相關段落編碼就清晰得多。實驗數據顯示，使用適當分塊的 RAG 系統檢索準確率比全文嵌入高 30-50%。

**3. 成本和效率控制**

從工程角度:100 個經過精心設計的小塊 vs 1 個大文檔的向量庫有根本性差異:
- 小塊:精確定位答案、快速檢索、易於增量更新
- 大塊:重複計算、搜尋速度慢、更新困難（需重新嵌入整個文檔）

標準實踐中，chunk_size=1000 時的檢索成本只是 chunk_size=5000 時的 1/5。

**4. LLM 上下文窗口最大化**

RAG 的典型 Prompt 結構是:「基於以下文本回答:{chunks}\n\n問題:{query}」。如果 chunk 太大，組裝後很容易超過 LLM 的上下文限制。例如 GPT-3.5 只有 4K 上下文，大約能容納 3-4 個較大的 chunks；而 GPT-4 的 32K 版本可容納 8-10 個小 chunks，檢索覆蓋面更全面。

##### 📊 第二部分:Token 計數深度解析

Token 是 LLM 與嵌入模型世界的「貨幣」。精確理解 Token 計數，是開發 RAG 專案時設置 chunk_size 的核心依據。

```python
import tiktoken

# 不同語言的 token 長度對比
text_en = "Retrieval Augmented Generation is cool"
text_zh = "檢索增強生成很酷"

enc = tiktoken.encoding_for_model("gpt-3.5-turbo")
print(f"英文: {len(enc.encode(text_en))} tokens, {len(text_en)} 字符")
print(f"中文: {len(enc.encode(text_zh))} tokens, {len(text_zh)} 字符")

# 結果通常是:
# 英文: 7 tokens / 37 字符 → 平均 5.3 字符/token
# 中文: 11 tokens / 8 字符 → 平均 0.7 字符/token（中文更「重」）
```

**💡 核心結論:高壓縮比的語言優勢**
1. **Token 效率的真相**:
    雖然數據顯示中文的 `字符/token` 比率較低（1.1 vs 6.1），但這並不代表中文「貴」。相反地，中文展現了極高的**資訊壓縮率**。在同樣消耗約 6~7 個 Tokens 的情況下，中文只用了 8 個字就講完了英文需要 37 個字母才能表達的內容。
2. **Context Window 的隱形紅利**:
    模型處理的是 Token 數量。這意味著在相同的 Context Window（例如 $128k$ tokens）限制下，如果你餵入純中文文本，你實際上塞進去的**資訊密度與語義細節**，會比純英文文本高出許多。
3. **RAG 分塊 (Chunking) 策略**:
    - **按 Token 切分（推薦）**:無論語言，將 `chunk_size` 統一設為如 **512 tokens**。這能保證不論中英文，模型每次檢索讀取的「運算負擔」是一致的。 
    - **語義完整度**:在中文環境下，500 tokens 已經足以包含一個非常完整且複雜的知識點；但在英文環境下，同樣 500 tokens 可能只是某個論點的前半段。
    

##### 🔧 第三部分:Chunk Size 的科學設置

不是所有 chunk_size 都相等。下表展示了不同 chunk_size 在真實場景中的表現:

| chunk_size | 優點 | 缺點 | 最佳應用場景 |
|-----------|------|------|-----------|
| **256** | 極度精細、成本低、精度高 | 上下文少、容易丟失資訊、過度細碎 | 高精度需求、小知識庫、短文檔 |
| **512** | 精度適中、成本合理、平衡 | 中等精度損失 | 密集知識（代碼、論文、技術文檔） |
| **1000** | **通用推薦、最常用、充分的上下文** | 略有冗餘、檢索成本適中 | **大多數場景的起點——推薦此值開始實驗** |
| **2000** | 資訊保留率高、上下文豐富 | 成本倍增、檢索可能不夠精確、容易超過 LLM 上下文 | 長篇文章、報告、線性敘述文本 |
| **4000+** | 上下文極豐富、最少丟失 | 檢索模糊（太多無關資訊）、超過大多數 LLM 上下文限制、不符合 RAG 精神 | **通常不推薦** |

**實踐建議**:從 1000 開始作为起點。如果發現檢索结果中有上下文丢失的跡象（答案片段不完整），则嘗試 1500；如果發現檢索噪聲大（返回很多無關文檔），則嘗試 512。

##### 🎯 第四部分:Chunk Overlap 的科學設置

重疊（overlap）決定了相鄰 chunks 之間的銜接程度。設置不當的 overlap 會導致資訊丟失或冗餘。

```
情景 1:文本連貫性強（報告、論文、文章）
→ overlap = chunk_size * 0.2 = 200（20% 重疊）
→ 目的:保證長句子不被硬生生截斷，相關概念跨越邊界時能被捕捉

情景 2:結構化文本（代碼、配置、 JSON）
→ overlap = chunk_size * 0.05-0.1 = 50-100（5-10% 重疊）
→ 目的:代碼有明確的邊界（函數、類），不需要高度銜接

情景 3:密集概念（教科書、法律文書、技術手冊）
→ overlap = chunk_size * 0.3-0.4 = 300-400（30-40% 重疊）
→ 目的:同一概念常跨越多個 chunks，高重疊確保核心概念被完整檢索

通用建議:overlap = chunk_size * 0.2（即 20% 重疊）
           →  chunk_size=1000 時，overlap 應設為 200
```

##### 💡 第五部分:三大分塊策略實戰對比

**策略 1:固定字數分塊（最簡單，推薦入門）**

```python
doc = "這是一個很長的文本..." # 假設 5000 字
chunk_size = 1000  # 字符數，非 tokens
overlap = 200
chunks = [doc[i:i+chunk_size] for i in range(0, len(doc), chunk_size-overlap)]

print(f"分塊數量: {len(chunks)}")
# 優點:簡單、快速、適合中文（因為中文計算字符而不是 tokens）
# 缺點:無法精確控制 token 數量、容易在句子中間截斷
```

**策略 2:Token 級別分塊（更精確，推薦生產環境）**

```python
import tiktoken

text = "長文本..."
chunk_size_tokens = 1000
overlap_tokens = 200

enc = tiktoken.encoding_for_model("gpt-3.5-turbo")
tokens = enc.encode(text)

chunks_tokens = []
for i in range(0, len(tokens), chunk_size_tokens - overlap_tokens):
    chunk = tokens[i:i+chunk_size_tokens]
    chunks_tokens.append(enc.decode(chunk))

# 優點:精確控制 token 數
# 缺點:需要安裝 tiktoken，計算稍慢
```

**策略 3:按結構分塊（適合結構化文檔——推薦優先使用！）**

- **Markdown 文檔**:按標題層級分割（## 分割比 ### 優先）
- **Python 代碼**:按函數/類分割，不要在程式碼邏輯中間截斷
- **JSON 結構**:按欄位或記錄分割
- **表格和列表**:保持整個表格/列表為一個 chunk

這種方式因為尊重文檔的邏輯結構，通常帶來最好的檢索效果。

##### 🛠️ 第六部分:完整代碼實現 & 最佳實踐

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader

# Step 1: 加載文件
loader = TextLoader("壹、HTTP 與 Web API 的基礎概念.md", encoding="utf-8")
documents = loader.load()  # 返回 Document 對象列表

# Step 2: 配置分塊器（推薦:遞迴分塊器，保留結構）
splitter = RecursiveCharacterTextSplitter(
    separators=["\n# ", "\n## ", "\n### ", "\n\n", "\n", "。", "，", " "],  # 遞迴嘗試優先順序
    chunk_size=1000,           # Token 或字符數（看分割器實現）
    chunk_overlap=200,         # 重疊數量
    length_function=len,       # 長度計算函數（默認是字符）
)

chunks = splitter.split_documents(documents)

# Step 3: 驗證結果
print(f"✓ 總分塊數: {len(chunks)}")
print(f"✓ 平均每個 chunk 大小: {sum(len(c.page_content) for c in chunks) / len(chunks):.0f} 字符")
print(f"✓ 最小 chunk: {min(len(c.page_content) for c in chunks)} 字符")
print(f"✓ 最大 chunk: {max(len(c.page_content) for c in chunks)} 字符")

# Step 4: 觀察樣本
print(f"\n範本 chunk（第 6 個）:")
print(chunks[6].page_content[:300] + "...")
print(f"元數據: {chunks[6].metadata}")

# Step 5: 實驗不同參數
print("\n\n=== 參數實驗 ===")
for chunk_size in [512, 1000, 1500]:
    for overlap in [int(chunk_size * 0.1), int(chunk_size * 0.2), int(chunk_size * 0.3)]:
        splitter_exp = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
        )
        chunks_exp = splitter_exp.split_documents(documents)
        avg_size = sum(len(c.page_content) for c in chunks_exp) / len(chunks_exp)
        print(f"chunk_size={chunk_size}, overlap={overlap:3d} → {len(chunks_exp):4d} chunks, 平均 {avg_size:.0f} 字符")
```

**調試技巧**:
1. **觀察邊界**:查看 chunks[i-1] 和 chunks[i] 的銜接處，確保沒有意外截斷
2. **統計分佈**:如果 chunk 大小差異大，考慮調整分割符優先順序
3. **品質檢查**:隨機抽取 10 個 chunk，手工驗證是否完整且有意義
4. **A/B 測試**:分別用不同參數分塊後，對相同查詢進行檢索對比


---

#### 1.4 向量嵌入與向量庫 - 概念、索引與最小實作

向量嵌入與向量庫是 RAG 檢索品質的核心。本節只做概念與流程講解，不在主線章節中做工具選型推薦；重點是建立「你能解釋任何向量庫行為」的判斷框架。

##### 📖 第一部分:向量嵌入

**向量嵌入（Embedding）**

- 把文本映射成固定維度向量（例如 384/768/1536 維）
- 語義越接近，向量在空間中的距離通常越近
- 向量品質受嵌入模型、語言覆蓋能力與資料清潔度影響

例如:
- 文本:「什麼是 RAG？」
- 嵌入後:[0.12, -0.45, 0.89, ..., 0.34]

![image](https://github.com/datawhalechina/all-in-rag/raw/main/docs/chapter3/images/3_1_1.webp)


##### 🧮 第二部分:相似度與索引結構（不綁特定產品）

**常見相似度度量**

- 1. 歐氏距離（L2 Distance）
  $$d = \sqrt{\sum_{i=1}^{n}(a_i - b_i)^2}$$
- 2. 餘弦相似度（Cosine Similarity）
  $$\cos(\theta) = \frac{A \cdot B}{|A||B|}$$
- 3. 點積（Dot Product）
  $$A \cdot B = \sum_{i=1}^{n} a_i b_i$$

實務上常見兩個要點:
- 若向量已做 L2 正規化，點積與餘弦排序通常非常接近。
- 更換相似度度量後，分數閾值（threshold）通常要重新校準。

**常見索引策略與取捨**

| 索引類型 | 召回品質 | 查詢速度 | 記憶體占用 | 適用情境 |
|------|------|------|------|------|
| Flat（精確檢索） | 最高 | 較慢 | 較高 | 小到中型資料集、調參初期 |
| IVF（分桶近似） | 中高 | 快 | 中 | 中大型資料集、重視吞吐 |
| HNSW（圖索引） | 高 | 很快 | 中高 | 低延遲查詢場景 |

**你需要優先掌握的 6 個參數**
1. 向量維度（必須與嵌入模型一致）
2. Top-K（過小漏召回、過大引入噪聲）
3. 分數閾值（控制低品質結果）
4. 索引建置時間（決定更新節奏）
5. 記憶體占用（決定部署可行性）
6. Metadata 過濾能力（決定檢索可控性）

##### 第三部分:向量庫

**向量庫（Vector Store / Vector DB）**
向量資料庫的核心價值在於其高效處理海量高維向量的能力。它不只是單純的儲存容器，更是 RAG 系統中負責「記憶檢索」的運算引擎。

1. **核心功能與價值**
- 高效相似性搜索：利用專門的索引技術（如 HNSW, IVF），在數十億級數據中實現毫秒級的「近似最近鄰（ANN）」查詢。
- 高維數據管理：針對成百上千維度的向量進行優化，支援增、刪、改、查（CRUD）與持久化。
- 豐富的查詢能力：支援標量過濾（Scalar Filtering）。例如：在搜尋「相似文檔」的同時，指定 年份 > 2023。
- 生態集成：與主流 AI 框架（如 LangChain, LlamaIndex）無縫銜接，簡化開發流程。

**一筆向量資料的最小結構**

| 欄位 | 範例 | 用途 |
|------|------|------|
| id | doc_0001_chunk_03 | 唯一識別與更新 |
| vector | [0.12, -0.03, ...] | 相似度計算 |
| text | 分塊後的原文片段 | 提供給 LLM 作為上下文 |
| metadata | {"source":"guide.md","section":"1.4"} | 條件過濾與引用追溯 |

##### 🛠️ 第四部分:最小可跑流程（工具中立示例）

以下代碼只用於展示「分塊 → 嵌入 → 建庫 → 檢索」流程，不代表工具選型建議。這裡以 FAISS 做本地示範，但流程可替換為其他向量庫實作。

```python
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader

# 1) 加載文檔並分塊
loader = TextLoader("knowledge_base.md", encoding="utf-8")
documents = loader.load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)
chunks = splitter.split_documents(documents)
print(f"chunks: {len(chunks)}")

# 2) 建立嵌入模型
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# 3) 建立向量索引並持久化
vector_store = FAISS.from_documents(chunks, embeddings)
vector_store.save_local("faiss_index")
print("vector index saved: ./faiss_index")

# 4) 查詢測試
query = "如何設定 chunk_size 與 overlap？"
results = vector_store.similarity_search(query, k=3)
for i, doc in enumerate(results, 1):
    print(f"[{i}] source={doc.metadata.get('source', 'unknown')}")
    print(doc.page_content[:150], "\n")

# 5) 重啟後可直接載入
loaded_store = FAISS.load_local("faiss_index", embeddings)
```

**檢索品質快速檢查**

- 同義問法是否能召回同一主題 chunk
- 回傳結果是否有多樣性（不是每次都同一段）
- Top-1 到 Top-k 的分數落差是否合理
- metadata 是否完整，能支援引用追溯

##### 🎓 實踐檢查清單

□ 能說清楚 Embedding 與向量庫的分工
□ 理解 L2 / Cosine / Dot Product 的差異與影響
□ 能解釋 Flat / IVF / HNSW 的速度-精度取捨
□ 完成一次「分塊 → 嵌入 → 建庫 → 檢索」最小流程
□ 能用至少 5 個測試查詢觀察召回品質
□ 目前先不做工具選型結論，先把評估框架建立起來

---

#### 1.5 生成集成 (Generation) - LLM 調用與 Prompt 工程

到此為止，我們已經建立了一個功能完整的檢索系統:能加載文檔、分塊、嵌入、並檢索相關段落。但 RAG 的最後一環——**生成**——同樣至關重要。這一章探討如何選擇合適的 LLM、工程化 Prompt，以及組建完整的端到端 RAG Pipeline。

##### 📖 第一部分:LLM 選擇 - 付費 vs 免費的權衡

**OpenAI 方案（推薦新手及生產環境）**

OpenAI 是目前最成熟、穩定的 LLM API 提供者。
- 模型選擇:
  - `gpt-3.5-turbo`:$0.5-1.5 per 1M input tokens，速度快，品質中上
  - `gpt-4`:$15-30 per 1M input tokens，品質最高，成本 10 倍
  - `gpt-4o`（最新）:$5-15 per 1M tokens，性價比最優

- 優點:
  - 品質高，幻覺少
  - API 穩定，文檔完善
  - 無需本地 GPU，只需網路連接

- 缺點:
  - 需付費（每月 $10-100 預算）
  - 有延遲（平均 1-2 秒/請求）
  - 需聯網，隱私敏感數據不適合

推薦起點:gpt-3.5-turbo（性價比最優）

**本地開源方案（進階，追求成本 and 隱私）**

如果你要完全離線、無成本運行，可用本地 LLM:

- Ollama（一鍵部署）
  ```bash
  # 安裝 Ollama:ollama.ai
  ollama pull mistral          # 下載 Mistral 7B（推薦）
  ollama run mistral           # 啟動本地服務
  # 然後用 LangChain 連接 http://localhost:11434
  ```

- 優缺點:
  - ✅ 完全離線、無成本、數據完全安全
  - ✅ 可自定義訓練
  - ❌ 品質遠低於 GPT-3.5（中文理解較弱）
  - ❌ 需要 GPU（顯存 ≥ 8GB）
  - ❌ 部署複雜，故障排查困難

推薦起點:Mistral 7B（平衡品質和速度）

**選擇決策樹**

```
是否有 GPU?
├─ 否 → 用 OpenAI（唯一選擇）
└─ 是
   ├─ 能接受付費? 
   │  ├─ 是 → 用 gpt-3.5-turbo（最推薦）
   │  └─ 否 → 用本地 Mistral 或 Llama
   ├─ 數據涉及隱私?
   │  ├─ 是 → 用本地方案
   │  └─ 否 → 用 OpenAI
```

##### 🎯 第二部分:Prompt 工程 - 以及為什麼它至關重要

**為什麼 Prompt 工程很難？**

RAG 系統的 Prompt 需要平衡多個目標:
1. **精確度**:只基於檢索結果回答（不編造）
2. **完整性**:提供足夠的上下文讓 LLM 理解
3. **可溯源**:告訴用戶答案來自哪裡
4. **效率**:Token 數不能太多（控制成本）

**陷阱示例:為什麼「基礎 Prompt」會失敗？**

```
問題:基礎 Prompt
【Prompt】
回答以下問題。
文檔:{context}
問題:{question}

回答:

【結果】
LLM 很容易編造答案或基於世界知識而非文檔回答
幻覺率:30-40%
```

**改進方案:明確分界線 + 限制推理空間**

```
【改進 Prompt】
你是一個嚴格遵守事實的助手。請基於以下文檔回答用戶問題。

========== 文檔開始 ==========
{context}
========== 文檔結束 ==========

使用者問題:{question}

回答需求:
1. 只能基於上述文檔內容回答
2. 如果文檔中沒有相關資訊，必須回答「文檔中未提及此資訊」
3. 答案末尾必須附上引用的文檔名和段落位置
4. 嚴禁編造或推測文檔外的資訊
5. 如果問題涉及多個子問題，逐一列舉回答

回答格式:
【回答】
[具體回答]

【引用來源】
- 來源:{source}
- 位置:{line_number}
- 引用段落:{excerpt}

【結果】
幻覺率:30-40% → 5-8%
準確性提升 3-5 倍
```

**Prompt 模板對比表:根據複雜度選擇**

| 模板類型 | 適用場景 | 效果 | Token 成本 | 推薦性 |
|--------|--------|------|---------|---------|
| **Zero-shot Plain** | 簡單事實題 | 50-60% 準確 | 基礎 | ⭐ |
| **Few-shot**（1-3 示例） | 需要格式參考 | 70-80% 準確 | +20% | ⭐⭐ |
| **Chain-of-Thought (CoT)** | 複雜推理 | 85-90% 準確 | +30% | ⭐⭐⭐ |
| **ReAct**（思考+行動） | 多步驟任務 | 90% 準確 | +50% | ⭐⭐ |
| **RAG + CoT 組合** | 檢索+推理 | **95%+ 準確** | +40% | **⭐⭐⭐⭐⭐** |

**推薦最優實踐:System Prompt + User Prompt 分離**

```python
from langchain.prompts import ChatPromptTemplate

# System Prompt:設定 LLM 的行為和角色
system_prompt = """你是一個 RAG 系統的文檔助手。你的核心職責是:

1. 【嚴格】基於提供的文檔回答問題，不基于世界知識推測
2. 【透明】明確標記每個答案的資訊來源
3. 【誠實】如果文檔中沒有答案，說『無法從文檔中回答』
4. 【完整】如果答案需要多個文檔片段支撑，逐一列舉

你必须理解，用户对你的信任完全取决于你的诚实性。编造答案会摧毁系统的价值。
"""

# User Prompt:具體的任務
user_template = """
文檔內容
========
{context}
========

用戶問題:{question}

請根據上述文檔回答。
"""

# 組建 ChatPromptTemplate
prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("user", user_template)
])

# 結果對比:
# - 沒有 System Prompt:LLM 準確性 70-75%
# - 有 System Prompt:LLM 準確性 82-87%
# 提升:10-15%
```

**Prompt 調試技巧（實戰工具箱）**

技巧 1:讓 LLM 「思考」（CoT - Chain of Thought）
```python
cot_prompt = """
請先按以下步驟回答:

步驟 1:理解問題
問題的核心是什麼？

步驟 2:搜尋文檔
文檔中哪些部分相關？

步驟 3:分析和綜合
不同部分如何相互支持答案？

步驟 4:給出最終回答
基於上述分析，答案是？

答案:
"""
```
結果:準確率提升 10-20%

技巧 2:可信度評估
```python
confidence_prompt = """
在回答前，先自我評估確信度:
- 資訊直接出自文檔 = 95%+ 確信
- 文檔提及但需轉述 = 60-80% 確信
- 文檔未提及 = 0% 確信（必須說『無法回答』）

如確信度 < 70%，改回答『文檔中資訊不足』而不是猜測。
"""
```

技巧 3:Token 限制（降低成本）
```python
length_prompt = """
回答必須控制在 200 token 以內（約 150 字中文）。
優先包含最重要資訊，次要資訊可簡化或略去。
"""
```
成本降低:20-30%

##### 🏗️ 第三部分:完整 RAG Pipeline 代碼

從用戶查詢到生成答案的完整流程:

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# ===== 組件 1:初始化向量庫和 LLM =====
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vector_store = FAISS.load_local("faiss_index", embeddings)
# retriever:負責從向量庫檢索相關文檔
retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 5}  # 返回 Top-5 相關文檔
)

# LLM:生成答案
llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.3,  # 低溫度 = 更確定性、更少創新
    max_tokens=500
)

# ===== 組件 2:定義 Prompt 模板 =====
system_prompt = """你是一個幫助用戶基於文檔找答案的助手。

重要規則:
1. 只基於文檔內容回答，不推測或編造
2. 每個答案必須附上來源文檔和行號
3. 如文檔中沒有答案，說『文檔中未提及』而不是編造
"""

template = """{context}

用戶問題:{question}

請回答。"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("user", template)
])

# ===== 組件 3:組建 RAG Chain =====
# 這是一個 LangChain 的「可運行序列」(Runnable)
rag_chain = (
    {
        "context": retriever,        # 檢索相關文檔
        "question": RunnablePassthrough()  # 傳遞用戶問題
    }
    | prompt                         # 應用 Prompt 模板
    | llm                            # 調用 LLM
)

# ===== 組件 4:測試 =====
test_queries = [
    "什麼是 RAG？",
    "如何設置 chunk_size？",
    "FAISS 和 Milvus 有什麼差別？",
]

for query in test_queries:
    print(f"\n【用戶問題】{query}")
    print("-" * 50)
    
    response = rag_chain.invoke(query)
    
    print(f"【答案】")
    print(response.content)

# ===== 組件 5:進階用法 - 格式化輸出 =====
# 如果要返回結構化答案（答案 + 引用 + 權信度），可以這樣做:
from langchain.output_parsers import StructuredOutputParser, ResponseSchema

response_schemas = [
    ResponseSchema(name="answer", description="基於文檔的回答"),
    ResponseSchema(name="sources", description="引用的文檔名稱"),
    ResponseSchema(name="confidence", description="回答的可信度（0-100%）"),
]

output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
format_instructions = output_parser.get_format_instructions()

# 在 Prompt 中加入格式指令
template_with_format = template + f"\n\n{format_instructions}"

# 然後就能解析結構化輸出了
answer_dict = output_parser.parse(response.content)
```

##### 🎓 實踐檢查清單

□ 選擇了 LLM（OpenAI gpt-3.5-turbo 推薦作為起點）
□ 設置了 OPENAI_API_KEY 環境變數
□ 理解了 Prompt 工程的重要性
□ 測試了改進 Prompt 前後的效果差異
□ 實現了完整的 RAG Pipeline
□ 進行了至少 5 個查詢測試
□ 記錄了答案品質和幻覺率
□ 準備進入第二階段:檢索優化



---

### 第二階段:優化 & 評估（第 4-7 天）

目標:改進檢索品質、建立評估指標

#### 2.1 檢索優化 - 從「召回率」到「精準度」的進階之路

基礎 RAG 已經能工作，但檢索品質往往決定了整個系統的上限。這一章探討三大優化技術:混合檢索彌補單一方法的不足、Query 重構讓搜尋更聰慧、Re-ranking 用精細排序確保最相關結果排在前面。

##### 📖 第一部分:混合檢索（Hybrid Search）- 彌補各自的不足

**向量搜尋 vs BM25 的本質差異**

這是一個經典的「各有所長」場景:

**向量搜尋（語義搜尋）**
- ✅ 優勢:理解語義關係（「防止過擬合」≈「減少過度訓練」）、容忍表述差異、支持跨語言搜尋
- ❌ 缺點:無法精確匹配專有名詞（不知道 Adam、weight_decay 的精確含義）、依賴模型品質、計算成本高
- 🎯 適用:概念類、知識類、抽象問題

**BM25（關鍵字搜尋）**
- ✅ 優勢:精確匹配技術詞匯、代碼、公式；快速透明；在長文檔中穩定
- ❌ 缺點:無法理解語義（「降低損失」≠「最小化誤差」）、容易被高頻詞主導
- 🎯 適用:代碼片段、FAQ、文檔檢索

**混合檢索的威力**

```
單用向量搜尋:
  查詢「Adam 優化器」→ 可能找到「動量優化」「梯度下降」（語義相近但不完全匹配）
  
單用 BM25:
  查詢「Adam 優化器」→ 精確找到包含「Adam」的文檔
  
混合檢索:
  = 向量找「相似概念」+ BM25 找「精確關鍵詞」
  = 結果中既包含精確匹配，也包含語義相近
  = 召回率提升 30-50%，實際誤差率 ↓ 20%
```

##### 🔧 混合檢索補充:三大融合策略詳解

**融合策略 A:加權融合（最簡單，推薦開始）**

```python
# score = λ × bm25_score + (1-λ) × vector_score
# λ 是權衡參數:
#   λ = 0.3:向量為主（常見概念查詢）
#   λ = 0.5:平衡（混合查詢）
#   λ = 0.7:BM25 為主（代碼/技術詞查詢）

from langchain.retrievers import BM25Retriever, EnsembleRetriever

bm25_retriever = BM25Retriever.from_documents(chunks)
vector_retriever = vector_store.as_retriever(search_kwargs={'k': 10})

# 創建混合檢索器
ensemble_retriever = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.7, 0.3]  # 70% 向量，30% BM25
)

results = ensemble_retriever.get_relevant_documents(query)
print(f"混合檢索返回 {len(results)} 個結果")
```

**融合策略 B:邏輯融合（精準但嚴格）**

交集模式（Intersection）:只返回「既語義相似 AND 關鍵詞匹配」的文檔
- ✅ 精準度高，幾乎沒有誤報
- ❌ 可能漏掉邊界情況

```python
vector_results = set(vector_retriever.get_relevant_documents(query)[:10])
bm25_results = set(bm25_retriever.get_relevant_documents(query)[:10])

# 交集:都滿足的文檔
intersection = vector_results & bm25_results
# 聯集:任一滿足的文檔
union = vector_results | bm25_results

print(f"向量搜尋:{len(vector_results)} E，BM25:{len(bm25_results)} 篇")
print(f"交集（高精度）:{len(intersection)} 篇，聯集（高召回）:{len(union)} 篇")
```

**融合策略 C:級聯融合（速度 #1 推薦）**

先用快速檢索粗篩（BM25），再用精細排序（向量）

```python
# Step 1:快速粗篩（BM25），取 Top-20
initial_results = bm25_retriever.get_relevant_documents(query, k=20)

# Step 2:重排（向量嵌入 + 相似度排序），取 Top-5
query_embedding = embeddings.embed_query(query)

from sklearn.metrics.pairwise import cosine_similarity

scores = []
for doc in initial_results:
    doc_embedding = embeddings.embed_query(doc.page_content)
    similarity = cosine_similarity([query_embedding], [doc_embedding])[0][0]
    scores.append((doc, similarity))

# Step 3:按相似度排序
reranked = sorted(scores, key=lambda x: x[1], reverse=True)[:5]
final_results = [doc for doc, score in reranked]

print(f"✓ 從 {len(initial_results)} 篇縮小到 {len(final_results)} 篇相關度最高的")
```

**實戰決策樹:根據查詢類型調整策略**

```
查詢類型分類:
├─ 【事實型】「什麼是 X？」、「如何做 X？」
│  └─ 推薦策略:λ = 0.5（平衡），結果數 k = 10
│  └─ 理由:既需要概念理解又需要精確資訊

├─ 【代碼型】「怎樣寫 Adam 優化」、「weight_decay 參數」
│  └─ 推薦策略:λ = 0.2-0.3（BM25 主導），結果數 k = 5
│  └─ 理由:代碼和參數名需精確匹配

├─ 【概念型】「為什麼 X 比 Y 好？」、「X 的本質是什麼？」
│  └─ 推薦策略:λ = 0.7-0.8（向量主導），結果數 k = 10
│  └─ 理由:概念理解更重要

└─ 【複雜型】「基於 X，如何做 Y 並評估 Z？」
   └─ 推薦策略:分解成 3 個子查詢，分別用不同 λ
  └─ 然後彙整結果
```

##### 💡 第二部分:Query 重構（Query Rewriting）- 幫助你的搜尋更聰慧

**為什麼需要重構？**

用戶的原始問題往往模糊、非正式、充滿上下文假設:
- 「那個電影怎樣？」（缺少電影名）
- 「類似的有過嗎？」（「類似」是模糊的）
- 「怎樣快速搞定這個？」（「這個」指什麼？）

知識庫需要更標準化的查詢語言，所以需要重構。

**重構 Prompt 示例**

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

rewrite_prompt = ChatPromptTemplate.from_template("""
你是一個查詢改寫助手。用戶提出的問題可能模糊或非正式。
請把它改寫成更適合在知識庫中搜尋的形式，保留原意。

原問題:{question}

改寫要求:
1. 使用 3-5 個關鍵詞
2. 清晰、準確、標準化語言
3. 包含主要實體和動作

改寫結果:
""")

rewriter = rewrite_prompt | ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3)

# 測試
original = "那個電影怎樣？"
rewritten = rewriter.invoke({"question": original})
print(f"原問題:{original}")
print(f"改寫後:{rewritten.content}")
# 輸出可能:「電影評分、電影評價、推薦指數」

# 用改寫結果進行檢索
results = retriever.get_relevant_documents(rewritten.content)
```

**進階技巧:多查詢展開（Query Expansion）**

一個問題可能有多種表述方式，一次生成多個變體:

```python
expansion_prompt = ChatPromptTemplate.from_template("""
用戶想搜尋:{question}

請生成 3 個不同角度的搜尋查詢變體:
1. [角度 1]:
2. [角度 2]:
3. [角度 3]:

然後對每個變體進行搜尋，最後合併結果。
""")
```

##### 🎯 第三部分:Re-ranking（重排） - 用精細排序確保最佳結果優先

**為什麼初步檢索還不夠？**

初步召回（Retrieval）召回 Top-20 可能存在:
- 相關度排序不完美（Top-10 中有幾篇邊界情況）
- 計算成本限制（全量用精細方法太昂貴）

解決方案:先快速召回，再用更精細的方法排序。

**CrossEncoder vs Bi-Encoder**

| 方面 | Bi-encoder（初步檢索） | CrossEncoder（重排） |
|-----|---------------------|---------------------|
| 方式 | Query → V1，Doc → V2，計算相似度 | [Query, Doc] → 聯合編碼 → 相關度分數 |
| 速度 | 快（向量可預計算） | 慢（每個查詢需重新計算） |
| 精度 | 70-80% | 90-95% |
| 成本 | 低 | 中等（只用於前 K 篇） |
| 推薦用途 | 初步召回 | 精細排序 |

**CrossEncoder 實現**

```python
from sentence_transformers import CrossEncoder
import numpy as np

# Step 1:加載預訓練 CrossEncoder 模型
# 推薦模型:
#   - 'cross-encoder/qnli-distilroberta-base'（通用，快速）
#   - 'cross-encoder/mmarco-mMiniLMv2-L12'（多語言，推薦中文）
cross_encoder = CrossEncoder('cross-encoder/mmarco-mMiniLMv2-L12')

# Step 2:初步檢索（用向量或 BM25），取 Top-20
initial_results = retriever.get_relevant_documents(query, k=20)

# Step 3:準備 [Query, Doc] 對
pairs = [[query, doc.page_content] for doc in initial_results]

# Step 4:批量計算相關度分數（0-1）
scores = cross_encoder.predict(pairs)

# Step 5:重排並取 Top-5
ranked_with_scores = sorted(
    zip(initial_results, scores),
    key=lambda x: x[1],
    reverse=True
)[:5]

final_results = [doc for doc, score in ranked_with_scores]

print(f"初步檢索 {len(initial_results)} 篇 → 重排後 Top-{len(final_results)} 篇")
for i, (doc, score) in enumerate(ranked_with_scores, 1):
    print(f"  #{i}（分數 {score:.3f}）:{doc.page_content[:100]}...")
```

**完整優化 Pipeline**

```python
# = 混合檢索 + Query 重構 + Re-ranking 的完整組合 =

from langchain.retrievers import BM25Retriever, EnsembleRetriever
from sentence_transformers import CrossEncoder

# 初始化
bm25_retriever = BM25Retriever.from_documents(chunks)
vector_retriever = vector_store.as_retriever(search_kwargs={'k': 15})
cross_encoder = CrossEncoder('cross-encoder/mmarco-mMiniLMv2-L12')

# 混合檢索器
ensemble = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.6, 0.4]
)

# Rewriter
rewriter_chain = rewrite_prompt | ChatOpenAI(...)

def optimized_retrieve(user_query):
    # Step 1:重構查詢
    rewritten = rewriter_chain.invoke({"question": user_query})
    search_query = rewritten.content
    
    # Step 2:混合檢索（取 Top-20）
    candidates = ensemble.get_relevant_documents(search_query, k=20)
    
    # Step 3:Re-rank（精排到 Top-5）
    pairs = [[search_query, doc.page_content] for doc in candidates]
    scores = cross_encoder.predict(pairs)
    
    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)[:5]
    
    return [doc for doc, _ in ranked]

# 測試
results = optimized_retrieve("怎樣快速實現 RAG？")
```

##### 🎓 實踐檢查清單

□ 理解了向量搜尋和 BM25 各自的優缺點
□ 實現了混合檢索（EnsembleRetriever）
□ 實驗了不同的權衡參數（λ）
□ 用 LLM 實現了 Query 重構
□ 安裝了 sentence-transformers:`pip install sentence-transformers`
□ 實現了 CrossEncoder 重排
□ 對比測試了「有無重排」的效果
□ 進行了至少 10 個查詢的檢索優化實驗
□ 記錄了優化前後的精度改進
□ 準備進入評估階段



---

#### 2.2 RAG 系統評估 - 從「能工作」到「有效工作」

RAG 系統構建完成後，如何判斷是否真的在工作？本章介紹系統評估的完整方法論，從關鍵指標定義、評估流程、到結果分析。

##### 📊 第一部分:核心評估指標詳解

**指標 1:檢索精度（Recall@K）**

定義:在 Top-K 結果中，相關文檔出現的比率。

$$\text{Recall@K} = \frac{\text{檢索到的相關文檔數}}{\text{該查詢的所有相關文檔數}}$$

為什麼用 Recall@5？因為 LLM Prompt 通常容納 5-10 個 chunks，第 5 份是實用邊界。

實例計算:
```
查詢:「如何防止過擬合？」
知識庫中所有相關文檔:
  1. regularization_techniques.md
  2. weight_decay_practice.md  
  3. overfitting_prevention.md
  → 共 3 篇相關文檔

系統返回的 Top-5:
  1. learning_rate_schedule.md (❌ 無關)
  2. weight_decay_practice.md (✅ 相關)
  3. batch_size_effects.md (❌ 無關)
  4. regularization_techniques.md (✅ 相關)
  5. activation_functions.md (❌ 無關)

Recall@5 = 2/3 ≈ 67%
相比目標 ≥ 80%，此系統檢索能力偏弱，需改進
```

**目標設定**:Recall@5 ≥ 80%（找到大多數相關文檔），Recall@10 ≥ 90%（進階目標）

**其他檢索指標對比表**

| 指標 | 計算方式 | 優勢 | 劣勢 | 何時使用 |
|-----|--------|------|------|---------|
| **Recall@K** | 相關文檔數 / 總相關數 | 直觀、易實現 | 忽視排序品質 | **推薦起點** |
| **MRR** | 1 / 第一相關結果排名 | 重視「找到第一個對的」 | 忽視其他結果 | 搜尋引擎 |
| **NDCG@K** | 考慮排序 + 相關度等級 | 精細評估 | 計算複雜 | 推薦系統 |
| **MAP@K** | 逐K計算精度的平均 | 綜合評估 | 需多相關項 | 資訊檢索 |

**指標 2:生成品質（Generation Quality）**

模型生成的答案是否正確、完整、且有根據？分為自動化和手工評估:

**人工評分（最可靠，最費時）**

評估維度:
- **準確性（Accuracy）**:答案是否絕對正確？
  - 0 = 完全錯誤或編造
  - 0.5 = 部分正確，有混淆或遺漏
  - 1 = 完全正確，符合知識庫

- **完整性（Completeness）**:是否涵蓋用戶期望的所有面向？
  - 1 分 = 極度不完整，遺漏關鍵資訊
  - 3 分 = 基本完整，但可更詳細
  - 5 分 = 非常完整，涵蓋所有相關維度

- **相關性（Relevance）**:答案是否直接解決用戶問題？
  - 1 分 = 完全無關
  - 3 分 = 部分相關
  - 5 分 = 高度相關，解決核心問題

**自動化指標（粗略但快速）**

- **BLEU**:詞序匹配率（0-1，越高越好）
  - 優勢:計算快
  - 缺點:對 RAG 不友好，因為不同措辭（「降低損失」vs「最小化誤差」）會被評為不同

- **ROUGE**:召回率（0-1，越高越好）
  - 優勢:比 BLEU 對 RAG 友好
  - 缺點:仍不完美，語義可能相同但詞彙不同

- **BERTScore**:基於預訓練語言模型的語義相似度（0-1，推薦 ⭐⭐⭐⭐⭐）
  - 優勢:能理解語義相似，最適合評估 RAG 答案
  - 缺點:計算稍慢
  ```python
  from bert_score import score
  
  references = ["官方參考答案"]
  candidates = ["模型生成的答案"]
  
  P, R, F1 = score(candidates, references, lang="zh", verbose=False)
  print(f"BERTScore F1: {F1[0]:.3f}")  # 0-1，越高越好
  ```

**指標３:幻覺率（Hallucination Rate）**

模型是否編造了知識庫中不存在或不支持的資訊？

幻覺檢測流程（SOP）:
1. 閱讀模型回答
2. 逐句提取事實聲明
3. 逐句查證知識庫（尋找明確支持）
4. 標記無根據部分

實例:
```
模型回答:
「微調時使用 Adam 優化器且 weight_decay=1e-4 可以有效防止過擬合。
 這是因為 Adam 的自適應學習率機制...」

事實檢驗:
✓ 「用 Adam 優化器」—— 知識庫有明確說明
✓ 「weight_decay=1e-4」—— 知識庫有推薦值
⚠️ 「Adam 的自適應學習率機制...」—— 知識庫未涉及，為幻覺

幻覺率 = 1 句 / 3 句 ≈ 33%
相比目標 < 10%，此系統需改進
```

目標:< 10%（越低越好；0% 是理想）

**其他關鍵指標**

- **響應時間（Latency）**:目標 < 3 秒（包括檢索 + LLM 推理）
- **單位成本（Cost）**:OpenAI API 約 $0.02-0.10 per request
- **用戶滿意度**:簡短問卷（1-5 分）或點讚率

##### 🛠️ 第二部分:實現簡單評估（10 分鐘快速版）

**第 1 步:準備測試集**

```python
test_cases = [
    {
        "question": "什麼是 RAG？",
        "expected_keywords": ["檢索", "增強", "生成"],
        "should_cite": ["RAG_intro.md"],
        "expected_answer_skeleton": "RAG 是一種 [...] 的技術"
    },
    {
        "question": "chunk_size 對性能的影響？",
        "expected_keywords": ["準確率", "速度", "權衡"],
        "should_cite": ["分塊策略.md"],
    },
    # 再加 8-10 個...
]
```

**第 2 步:運行系統並評估**

```python
import json

results = []

for test in test_cases:
    query = test["question"]
    
    # 運行 RAG
    response = rag_chain.invoke(query)
    retrieved_docs = retriever.get_relevant_documents(query, k=5)
    
    # 指標 1:檢索精度
    found_sources = [doc.metadata.get("source", "") for doc in retrieved_docs]
    retrieval_pass = any(
        source.endswith(cite) for cite in test["should_cite"] for source in found_sources
    )
    
    # 指標 2:關鍵詞覆蓋率
    answer = response.content
    keywords_found = sum(
        1 for kw in test["expected_keywords"]
        if kw in answer
    ) / len(test["expected_keywords"])
    
    # 指標 3:幻覺檢測（簡單）
    has_hallucination = any(
        suspect in answer for suspect in ["根據我的了解", "通常", "據說"]
    )
    
    results.append({
        "question": query,
        "retrieval_pass": retrieval_pass,
        "keywords_coverage": keywords_found,
        "no_hallucination": not has_hallucination,
        "response": answer[:300],
        "sources": found_sources
    })

# 第 3 步:統計結果
retrieval_accuracy = sum(r["retrieval_pass"] for r in results) / len(results)
keyword_coverage = sum(r["keywords_coverage"] for r in results) / len(results)
no_hallucination_rate = sum(r["no_hallucination"] for r in results) / len(results)

print(f"""
╔════════════════════════════════════════╗
║         RAG 系統評估報告               ║
╚════════════════════════════════════════╝

📊 核心指標
  • 檢索精度 (Recall@5): {retrieval_accuracy:.0%}   {'✅' if retrieval_accuracy >= 0.8 else '⚠️'}
  • 關鍵詞覆蓋: {keyword_coverage:.0%}      {'✅' if keyword_coverage >= 0.85 else '⚠️'}
  • 無幻覺率: {no_hallucination_rate:.0%}    {'✅' if no_hallucination_rate >= 0.9 else '⚠️'}

📝 評估結論
""")

if retrieval_accuracy < 0.8:
    print("  ⚠️ 檢索精度偏低，建議:改進 Query 重構 or 混合檢索配置")
if keyword_coverage < 0.85:
    print("  ⚠️ 答案完整性不足，建議:增加 retriever k 值 or 改進 Prompt")
if no_hallucination_rate < 0.9:
    print("  ⚠️ 幻覺率偏高，建議:改進 System Prompt or 訓練自定義重排器")
```

##### 📋 第三部分:完整評估報告模板

```markdown
# RAG 系統評估報告（日期:2024-01-15）

## 1. 測試集統計
- 總問題數:15
- 平均檢索精度 (Recall@5):82%
- 平均幻覺率:7%
- 平均響應時間:2.1 秒
- 用戶滿意度評分:4.2 / 5.0

## 2. 指標達成情況
| 指標 | 目標 | 實際 | 狀態 |
|-----|------|------|------|
| Recall@5 | ≥ 80% | 82% | ✅ |
| 幻覺率 | < 10% | 7% | ✅ |
| 響應時間 | < 3s | 2.1s | ✅ |

## 3. 失敗案例分析

| 問題 | 失敗原因類型 | 具體失敗 | 改進方向 |
|-----|-----------|--------|--------|
| "如何選擇 chunk_size？" | 檢索不到 | 沒找到相關文檔 | 擴展知識庫 + Query 重構 |
| "LLM 原理是什麼？" | 內容混亂 | 答案缺乏邏輯 | 改進 Prompt 結構 |

## 4. 下一步優化計畫
1. 實施 Re-ranking 降低噪聲（預期 Recall 提升 5%)
2. 擴展知識庫 100+ 篇文檔
3. 實施用戶反饋迴圈
4. A/B 測試不同 Prompt 配置

## 5. 系統瓶頸診斷
- 主要瓶頸:檢索端（BM25 可能不適合該領域）
- 次要瓶頸:生成端 Prompt 工程（幻覺率）
- 推薦優先順序:先優化檢索 → 再優化生成
```

##### 🎓 實踐檢查清單

□ 理解了 Recall@K、MRR、NDCG 等檢索指標
□ 設計了 10-20 道測試問題
□ 運行了完整的系統評估
□ 記錄了檢索精度、幻覺率等關鍵指標
□ 識別了系統的主要瓶頸
□ 製作了評估報告
□ 實作需求待提出時再安排（目前先以學習筆記為主）

---

## 📚 附錄 A：延伸教材與參考連結（選讀）

主線章節先完成，再回來看這份附錄最有效。建議把附錄當成「查字典」而不是「一口氣讀完」。

### 使用方式

- 先完成 1.1 到 2.2 的主線內容
- 卡關時再回來查對應教材，不做機械式全讀
- 每次只選 1-2 份資料深入，避免資訊過載

### 教材清單

| 類型 | 教材名稱 | 來源 | 用途 | 預計時間 |
|------|------|------|------|------|
| 建議先讀（選讀） | RAG 基礎入門教程 | 中文綜合教程 | 建立完整知識框架 | 3-4 小時 |
| 建議先讀（選讀） | LangChain RAG 官方教程 | https://python.langchain.com/docs/tutorials/rag/ | 動手實現與生態理解 | 3-4 小時 |
| 建議先讀（選讀） | LlamaIndex 入門指南 | https://docs.llamaindex.ai/ | 索引與檢索策略補強 | 2-3 小時 |
| 延伸參考 | OpenAI Cookbook RAG | https://cookbook.openai.com/ | 實作細節與評估思路 | 2-3 小時 |
| 延伸參考 | Haystack RAG Pipeline | https://haystack.deepset.ai/tutorials | 工程化 pipeline 設計 | 2 小時 |
| 延伸參考 | 向量資料庫原理總覽（任選） | 官方文件或技術部落格 | 補強索引、更新與運維觀點 | 1-2 小時 |

---


## 後續安排（實作暫緩）

目前先保留前面學習筆記與代碼解釋。實作、部署與進階實驗部分先不展開，等有明確需求時再安排。

- 需要時可再補:實作專案結構、部署清單、成本優化、故障排查流程。
- 目前建議先完成:第一階段與第二階段的概念理解、代碼閱讀、指標評估。

---
