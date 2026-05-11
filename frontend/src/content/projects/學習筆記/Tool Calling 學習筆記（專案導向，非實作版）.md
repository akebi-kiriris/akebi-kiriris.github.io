---
title: Tool Calling 學習筆記（專案導向，非實作版）
date: 2026-04-06
tags: [AI, 學習筆記]
summary: 整理「Tool Calling 學習筆記（專案導向，非實作版）」主題，重點包含：> 起始日期：2026/04/01   > 學習定位：先建立可落地的 Tool Calling 設計能力，再於專案開發中逐步優化。
status: 草稿
---

# Tool Calling 學習筆記（專案導向，非實作版）

> 起始日期：2026/04/01  
> 學習定位：先建立可落地的 Tool Calling 設計能力，再於專案開發中逐步優化。  
> 範圍：觀念、架構、設計準則、精簡代碼範例、上線前檢查。  
> 不做事項：不額外做完整 Demo 實作（避免重複投入）。

---

## 🧭 全文大綱（先看這裡）

### A. 閱讀順序
1. 第 1 章：先搞懂 Tool Calling 解決什麼問題。
2. 第 2 章：掌握完整流程與系統角色。
3. 第 3 章：學會定義高品質工具 Schema。
4. 第 4 章：掌握單工具、多工具、規劃-執行三種模式。
5. 第 5 章：建立安全、穩定、可觀測的執行機制。
6. 第 6 章：用可量化指標評估工具系統品質。
7. 第 7 章：對接你的專案，直接進入可開發狀態。

### B. 章節總覽
1. Tool Calling 核心概念與邊界
2. 端到端流程與組件拆解
3. 工具 Schema 設計準則
4. 常見調用模式（Single / Multi / Planner）
5. 可靠性與安全治理
6. 評估指標與最小驗收標準
7. 專案整合藍圖（你接下來要做的事）
8. 精簡代碼片段索引
9. 常見錯誤與修正清單

---

## 1. Tool Calling 核心概念與邊界

### 1.1 Tool Calling 是什麼
Tool Calling 是讓 LLM 在回答問題時，能「選擇並調用外部工具」來取得資料或執行動作，而不只靠模型記憶回答。

你可以把它想成三層分工：
- LLM：負責理解需求、規劃下一步、決定要不要調工具。
- Tool Layer：負責真的做事（查資料、計算、呼叫 API、讀寫系統）。
- Orchestrator：負責控制流程、驗證參數、處理失敗、記錄日誌。

### 1.2 與 RAG 的關係（重點）
RAG 與 Tool Calling 是互補，不是替代。

| 維度 | RAG | Tool Calling |
|---|---|---|
| 核心能力 | 檢索知識 | 執行動作 |
| 輸入來源 | 文件/向量庫 | API/函式/服務 |
| 結果型態 | 內容片段 | 結構化結果或操作回覆 |
| 常見用途 | 問答、知識補充 | 查天氣、下單、查庫存、運算、工作流調度 |

實務上常見組合：
1. 先用 RAG 提供背景知識。
2. 再由 Tool Calling 完成實際操作。
3. 最後由 LLM 整理最終回覆。

### 1.3 什麼情境該用 Tool Calling
適合：
- 需要即時資料（例如匯率、庫存、訂單狀態）。
- 需要執行動作（建立工單、發送通知、寫入資料庫）。
- 需要多步流程（查詢 -> 計算 -> 回寫）。

不適合：
- 單純知識問答且不需要外部動作。
- 工具結果不可靠、延遲過高且無 fallback。

---

## 2. 端到端流程與組件拆解

### 2.1 標準流程（最小可用）
1. 接收使用者問題。
2. LLM 判斷是否要調工具。
3. 若需要：輸出 `tool_name + arguments`。
4. Orchestrator 驗證參數，執行工具。
5. 工具結果回灌給 LLM。
6. LLM 產生對使用者可讀的最終答案。
7. 記錄全流程日誌（含錯誤與耗時）。

### 2.2 系統組件責任邊界
- Tool Registry：維護可用工具清單與 schema。
- Argument Validator：檢查必填欄位、型別、範圍。
- Executor：執行工具並捕捉錯誤。
- Policy Guard：限制危險操作（刪除、寫入、外呼）。
- Tracer：輸出觀測資料（latency、error rate、tool hit）。

### 2.3 最小流程圖（心智模型）
```
User -> LLM Planner -> Tool Call? -> Validator -> Tool Executor
   ^                                           |
   |------------------ Final Answer <- LLM <---|
```

---

## 3. 工具 Schema 設計準則

### 3.1 一個好工具的 5 個條件
1. 單一職責：一個工具只做一件事。
2. 參數明確：避免模糊欄位，例如 `query` 太泛應拆成 `city`、`date`。
3. 可驗證：每個欄位有型別、範圍、是否必填。
4. 可恢復：錯誤要有錯誤碼與可行修復訊息。
5. 可觀測：輸出可追蹤（request_id、duration_ms、status）。

### 3.2 Schema 設計範例（精簡）
```python
weather_tool = {
    "name": "get_weather",
    "description": "查詢指定城市與日期的天氣",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "城市名稱，例如 Taipei"},
            "date": {"type": "string", "description": "日期，格式 YYYY-MM-DD"},
            "unit": {"type": "string", "enum": ["c", "f"], "default": "c"}
        },
        "required": ["city", "date"],
        "additionalProperties": False
    }
}
```

### 3.3 參數命名實務規則
- 用業務語意命名，不用技術縮寫。
- 時間一律 ISO8601（例如 `2026-04-01`）。
- 能枚舉就枚舉（`status`, `unit`, `priority`）。
- 盡量不要讓模型猜格式。

---

## 4. 常見調用模式（Single / Multi / Planner）

### 4.1 單工具模式（Single Tool Call）
適用：一步可完成的任務。

流程：
1. LLM 決定工具。
2. 執行一次。
3. 回答使用者。

優點：簡單、穩定、好除錯。  
缺點：無法處理跨工具任務。

### 4.2 多工具串接模式（Multi Tool Chain）
適用：結果需經過 2 個以上工具。

範例：
1. `search_product` 找商品。
2. `check_inventory` 查庫存。
3. `create_order` 建立訂單。

關鍵：
- 每步都要保存結構化中間結果。
- 失敗時可重試單步，避免整段重跑。

### 4.3 規劃-執行模式（Planner-Executor）
適用：任務不固定、步驟可能動態。

拆分方式：
- Planner（LLM）：先輸出計畫。
- Executor（程式）：按計畫執行工具。
- Reviewer（可選）：檢查結果品質，必要時修正計畫。

風險控制：
- 設 `max_steps` 防止無限迴圈。
- 限制高風險工具需要人工確認。

---

## 5. 可靠性與安全治理

### 5.1 錯誤分層
1. 輸入錯誤：參數缺失、格式錯誤。
2. 工具錯誤：API timeout、429、500。
3. 流程錯誤：工具順序錯、依賴缺失。
4. 策略錯誤：誤調高風險工具。

### 5.2 最小防護清單
- 參數驗證：呼叫前必做。
- 重試策略：僅對可重試錯誤（timeout/429）重試。
- 熔斷機制：同工具連續失敗時暫停調用。
- 權限邊界：讀寫工具分開管理。
- 人工確認：刪除、支付、外發通知等高風險操作必確認。

### 5.3 精簡錯誤處理範例
```python
from time import sleep

def call_with_retry(fn, *, max_retries=2, backoff=0.5):
    for attempt in range(max_retries + 1):
        try:
            return fn()
        except TimeoutError:
            if attempt == max_retries:
                raise
            sleep(backoff * (2 ** attempt))
```

### 5.4 提示詞防護（Prompt Guard）
在 system prompt 明確規範：
1. 不能捏造工具結果。
2. 無工具結果時要誠實說明。
3. 缺參數要先追問，不可硬猜。
4. 高風險工具需取得確認字串才可執行。

---

## 6. 評估指標與最小驗收標準

### 6.1 你需要追的核心指標
- Tool Selection Accuracy：工具選擇正確率。
- Argument Valid Rate：參數一次驗證通過率。
- Task Success Rate：任務端到端成功率。
- Avg Latency：平均耗時。
- Fallback Rate：降級/人工接手比例。

### 6.2 最小驗收門檻（可作為專案起跑線）
- 工具選擇正確率 >= 90%
- 參數驗證通過率 >= 95%
- 端到端任務成功率 >= 85%
- 95 分位延遲（P95） <= 4 秒

### 6.3 測試集設計（不做實作版）
請先準備 3 類測資：
1. 正常案例：參數完整、工具可用。
2. 異常案例：缺參數、錯格式、工具 timeout。
3. 對抗案例：要求模型跳過驗證或偽造結果。

---

## 7. 專案整合藍圖（直接對接你的下一步）

### 7.1 你的當前節奏（對齊）
- 你已完成 RAG 基礎學習，優化改為「遇到問題再補」。
- 下一步主線是 Tool Calling 多工具系統。

### 7.2 建議先做的工具分層
1. 查詢型工具：只讀、不改資料。
2. 計算型工具：純函式、可測試。
3. 動作型工具：會改狀態，需審批與審計。

### 7.3 專案導入順序（省時版）
1. 先上 2-3 個低風險工具，跑通整條鏈。
2. 再加參數驗證與重試。
3. 最後加高風險工具與人工確認。

### 7.4 與你路徑圖的連接點
- Tool Calling 期：完成工具 schema + orchestration loop。
- 應用期（Agents）：把工具系統接到 agent 決策。
- 工程期（LangGraph）：把流程改為狀態圖，強化可控性與可觀測。

---

## 8. 精簡代碼片段索引（解釋用）

### 8.1 工具註冊與派發
```python
from typing import Callable, Dict, Any

TOOLS: Dict[str, Callable[[Dict[str, Any]], Dict[str, Any]]] = {}

def register_tool(name: str, fn: Callable[[Dict[str, Any]], Dict[str, Any]]):
    TOOLS[name] = fn

def dispatch(tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    if tool_name not in TOOLS:
        return {"ok": False, "error": f"Unknown tool: {tool_name}"}
    return TOOLS[tool_name](args)
```

### 8.2 最小 orchestration loop
```python
def run_agent_loop(user_input: str, llm, max_steps: int = 5):
    messages = [{"role": "user", "content": user_input}]

    for _ in range(max_steps):
        resp = llm(messages)  # 假設 resp 可能包含 tool_call
        if "tool_call" not in resp:
            return resp["content"]

        call = resp["tool_call"]
        tool_result = dispatch(call["name"], call["arguments"])
        messages.append({"role": "tool", "content": str(tool_result)})

    return "超過最大步數，流程已停止。"
```

### 8.3 參數基本驗證
```python
def validate_required(args: dict, required: list[str]) -> tuple[bool, str]:
    for key in required:
        if key not in args or args[key] in (None, ""):
            return False, f"missing required arg: {key}"
    return True, "ok"
```

---

## 9. 常見錯誤與修正清單

| 問題 | 常見原因 | 修正方式 |
|---|---|---|
| 工具選錯 | 描述太模糊、工具重疊 | 重寫 description，避免多工具功能重複 |
| 參數常缺失 | schema 不明確 | 增加 required、enum、格式示例 |
| 無限迴圈調工具 | 無步數限制 | 設 `max_steps` 與中止條件 |
| 工具報錯後整體崩潰 | 未做錯誤分層 | 加入可重試與 fallback 回覆 |
| 模型偽造結果 | prompt 未約束 | 在 system prompt 加入「禁止捏造」規則 |

---

## 10. 一頁式結論（給未來專案開發時快速回看）

1. Tool Calling 的核心不是「讓模型會呼叫函式」，而是「建立可控的外部執行系統」。
2. 先把工具 schema 做好，再談 agent 智能，不然錯誤會放大。
3. 先追求穩定性（驗證、重試、日誌），再追求複雜多工具編排。
4. 你目前最省時路徑：低風險工具起步 -> 指標化驗收 -> 逐步接到 Agent/LangGraph。

---

## 11. 下一步（銜接專案，不新增學習負擔）

1. 從你的專案需求挑 3 個工具，先做 schema（不急著寫完整功能）。
2. 建立最小 orchestration loop，確保能跑完整流程。
3. 先做 20 筆測試案例，量測工具選擇率與成功率。
4. 等專案碰到瓶頸，再針對該瓶頸補 RAG 或 Tool Calling 優化。

這樣你就能保持「邊做邊優化」而不是「先把所有優化學完才開始」。
