---
title: Agents Course - The LangGraph framework
date: 2026-05-11
tags: [AI, 學習筆記]
summary: 整理「Agents Course - The LangGraph framework」主題，重點包含：> 來源: https://huggingface.co/learn/agents-course/ - **何時使用 LangGraph？** - 對比 LangGraph 與 L...
status: 草稿
---

# Agents Course - The LangGraph framework
> 來源: https://huggingface.co/learn/agents-course/

## 大綱

- **何時使用 LangGraph？** - 對比 LangGraph 與 LangChain，理解何時需要顯式控制流程
- **LangGraph 的核心構建模組** - 深入了解 State、Nodes、Edges、StateGraph 四大元件
- **實際應用場景** - 何時選擇 LangGraph 而不是純 Python 代碼
- **實現模式** - 從簡單流程到複雜多步驟 Agent



## 何時使用 LangGraph？

### 甚麼是 LangGraph ?

LangGraph 是由 LangChain 開發的框架， 用於管理整合 LLM 的應用程式的控制流 。


### LangGraph 和 LangChain 有何不同？

LangChain 提供了與模型和其他元件交互的標準介面，可用於檢索、LLM 調用和工具調用。 LangChain 的類可能會在 LangGraph 中使用，但不是必須的。

這兩個包是獨立的可以單獨使用，但最終你在網上找到的資源都會同時使用這兩個包。


### 何時應該使用 LangGraph ？

#### 控制 vs 自由度
在設計 AI 應用時，你面臨 **控制** 與 **自由度** 的基本權衡：

 - **自由度** 賦予 LLM 更多創造性地解決問題的空間
 - **控制** 能確保可預測的行為並維持安全護欄

像 smolagents 中的代碼 Agents（Code Agents）具有高度自由度。 它們可以在單個行動步驟中調用多個工具、創建自己的工具等。 然而，這種行為會使它們比使用 JSON 的常規 Agent 更難預測和控制！

LangGraph 則位於光譜的另一端，當你需要對Agent的執行進行 “控制” 時，它就會大放異彩。

當你需要 對應用程式保持控制 時，LangGraph 特別有價值。 它為你提供了構建可預測流程應用程式的工具，同時仍能利用 LLM 的強大能力。

簡而言之，如果你的應用程式包含需要以特定方式編排的多個步驟，並在每個連接點做出決策，LangGraph 就能提供你所需的結構 。

舉個例子，假設我們要構建一個能夠回答文檔相關問題的 LLM 助手。

由於 LLM 最擅長理解文字，在回答問題之前，你需要將其他複雜模態（圖表、表格）轉換為文本。 但這個選擇取決於你擁有的文檔類型！

我選擇將這種分支流程表示為：

![image](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit2/LangGraph/flow.png)

>左側部分不是智慧體，因為這裡不涉及工具調用。 但右側部分需要編寫代碼來查詢 xls 檔（轉換為 pandas 並操作它）。

雖然這個分支是確定性的，但你也可以設計基於 LLM 輸出結果的非確定性條件分支。

 - LangGraph 表現出色的關鍵場景包括：
 - 需要顯式控制流程的 **多步驟推理過程**
 - 需要在步驟之間 **保持狀態持久化** 的應用程式
 - **結合確定性邏輯與 AI 能力**的系統
 - 需要 **人工介入** 的工作流
 - 多個元件協同工作的**複雜智慧體架構**

本質上，只要有可能，作為人類 就應該根據每個操作的輸出設計行動流程，並據此決定下一步執行什麼。在這種情況下，LangGraph 就是正確的選擇！


### LangGraph 如何工作？

其核心在於，LangGraph 使用有向圖結構來定義應用程式的流程：

- **節點** 表示獨立的處理步驟（如調用 LLM、使用工具或做出決策）
- **邊**定義步驟之間可能的轉換
- **狀態** 由使用者定義和維護，並在執行期間在節點間傳遞。 當決定下一個目標節點時，我們查看的就是當前狀態


### 它和普通 Python 有何不同？ 為什麼需要 LangGraph？
你可能會想：“我可以用常規 Python 代碼和 if-else 語句來處理所有這些流程，對吧？ ”

雖然技術上可行，但對於構建複雜系統，LangGraph 相比原生 Python 有 諸多優勢 。 沒有 LangGraph 你也能構建相同應用，但它能為你提供更便捷的工具和抽象。

它包含狀態管理、可視化、日誌追蹤（traces）、內置的人類介入機制等功能。



## LangGraph 的構建模組

### LangGraph 的核心構建模組
LangGraph 應用程式從 entrypoint 開始，根據執行情況，流程可能流向不同的函數直到抵達 END。

![image](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit2/LangGraph/application.png)

### 1. 狀態（State）

**State** 是 LangGraph 中的核心概念，表示流經應用程式的所有資訊。
```python
from typing_extensions import TypedDict

class State(TypedDict):
    graph_state: str
```

狀態是 使用者自定義 的，因此需要仔細設計欄位以包含決策過程所需的所有數據！

>💡 提示： 仔細考慮應用程式需要在步驟之間跟蹤哪些資訊。

### 2. 節點（Nodes）

**Nodes** 是 Python 函數。 每個節點：
- 接收狀態作為輸入
- 執行某些操作
- 返回狀態更新
```python
def node_1(state):
    print("---Node 1---")
    return {"graph_state": state['graph_state'] +" I am"}

def node_2(state):
    print("---Node 2---")
    return {"graph_state": state['graph_state'] +" happy!"}

def node_3(state):
    print("---Node 3---")
    return {"graph_state": state['graph_state'] +" sad!"}
```

舉例， 節點可以包含：
 - **LLM 調用** ： 生成文字或做出決策
 - **工具調用** ： 與外部系統交互
 - **條件邏輯** ： 決定後續步驟
 - **人工干預** ： 獲取使用者輸入

>💡 資訊： 像 START 和 END 這樣的必要節點已直接包含在 LangGraph 中。

### 3. 邊（Edges）

**Edges** 連接節點並定義圖中的可能路徑：

```python
import random
from typing import Literal

def decide_mood(state) -> Literal["node_2", "node_3"]:
    
    # 通常我們會根據狀態決定下一個節點
    user_input = state['graph_state'] 
    
    # 這裡我們在節點2和節點3之間簡單實現 50/50 的 機率分配
    if random.random() < 0.5:

        # 50% 時間，我們返回節點2
        return "node_2"
    
    # 50% 時間，我們返回節點3
    return "node_3"
```

邊可以是：
 - **直接邊** ： 始終從節點 A 到節點 B
 - **條件邊** ： 根據當前狀態選擇下一個節點


### 4. 狀態圖（StateGraph）

StateGraph 是包含整個 agent 工作流的容器：
```python
from IPython.display import Image, display
from langgraph.graph import StateGraph, START, END

# 構建圖表
builder = StateGraph(State)
builder.add_node("node_1", node_1)
builder.add_node("node_2", node_2)
builder.add_node("node_3", node_3)

# 連接邏輯
builder.add_edge(START, "node_1")
builder.add_conditional_edges("node_1", decide_mood)
builder.add_edge("node_2", END)
builder.add_edge("node_3", END)

# 編譯
graph = builder.compile()
```

可以可視化圖表：
```python
display(Image(graph.get_graph().draw_mermaid_png()))
```
![image](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit2/LangGraph/basic_graph.jpeg)

最重要的是可以調用：
```python
graph.invoke({"graph_state" : "Hi, this is Lance."})
```

output :
```python
---Node 1---
---Node 3---
{'graph_state': 'Hi, this is Lance. I am sad!'}
```


## 實際應用場景

以下是最常見且適合 LangGraph 的落地場景：

1. 文件問答工作流
   - 流程：問題分類 -> 檢索策略選擇 -> 產生答案 -> 可信度檢查。
2. 工單處理流程
   - 流程：解析需求 -> 查詢工單狀態 -> 需要時升級人工。
3. 多工具 Agent
   - 流程：規劃步驟 -> 呼叫工具 -> 整理結果 -> 決定是否繼續。
4. 高風險操作流程
   - 流程：先草擬動作 -> 人工確認 -> 真正執行。

共通特徵是：
- 不是單步就能完成。
- 需要保存中間狀態。
- 需要明確且可追蹤的分支邏輯。


## 實現模式（從簡到難）

### 模式 A：線性流程（Linear Flow）

適合固定順序任務，例如 `預處理 -> 呼叫模型 -> 格式化輸出`。

```python
builder.add_edge(START, "preprocess")
builder.add_edge("preprocess", "llm_call")
builder.add_edge("llm_call", "postprocess")
builder.add_edge("postprocess", END)
```


### 模式 B：路由流程（Router Flow）

適合根據狀態選擇不同路徑，例如依問題類型走不同工具鏈。

```python
from typing import Literal

def route(state) -> Literal["db_path", "web_path"]:
    if state["question_type"] == "internal":
        return "db_path"
    return "web_path"

builder.add_conditional_edges("classifier", route)
```


### 模式 C：帶保護的迴圈（Loop with Guard）

適合需要反覆嘗試的任務，例如「檢索結果不夠好就再查一次」。

```python
def should_retry(state):
    return state["retry_count"] < 2 and state["score"] < 0.7

if should_retry(state):
    state["retry_count"] += 1
    # 回到 retriever 節點
```

關鍵是一定要有 guard：
- 最大重試次數
- 逾時條件
- 失敗回退路徑


## 狀態設計建議（State Schema）

狀態欄位建議至少包含：

1. `input`：原始使用者需求。
2. `intermediate_results`：中間結果，方便追蹤。
3. `decision`：當前路由決策。
4. `retry_count`：重試次數，防止死循環。
5. `errors`：錯誤訊息，用於診斷與 fallback。

狀態設計原則：
- 欄位名稱要業務語意化。
- 只存下一步決策需要的資料。
- 避免把大量原始資料直接塞進 state。


## 常見錯誤與排查

| 問題 | 常見原因 | 修正方式 |
|---|---|---|
| 圖無法收斂 | 缺少終止條件 | 每個迴圈加 `max_steps` 或 `retry_count` |
| 路由錯誤 | state 欄位命名不一致 | 固定 schema，並在節點入口先校驗 |
| 中間結果遺失 | 節點回傳覆蓋舊 state | 採用 merge 更新策略，保留必要欄位 |
| 難以除錯 | 無執行追蹤 | 打開 trace/log，記錄節點進出與耗時 |
| 成本過高 | 不必要節點重跑 | 拆快取層，對穩定步驟做結果緩存 |


## 與 LangChain 的搭配方式

最實用的分工如下：

1. LangChain：提供模型、Retriever、Tools 的標準介面。
2. LangGraph：提供流程控制、狀態管理、分支與迴圈。

實作上常見做法：
- 節點內部使用 LangChain 元件執行單一步驟。
- 圖層由 LangGraph 管理整體控制流。


## 本章小結

1. LangGraph 的核心價值是可控流程，不是取代模型。
2. 當任務出現分支、迴圈、人工介入時，LangGraph 優勢會很明顯。
3. 設計好 state 與終止條件，是避免工作流失控的關鍵。
4. 與 LangChain 搭配時，通常是 LangChain 管能力，LangGraph 管流程。