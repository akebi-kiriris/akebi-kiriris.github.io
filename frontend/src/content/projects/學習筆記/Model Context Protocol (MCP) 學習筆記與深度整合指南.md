---
title: Model Context Protocol (MCP) 學習筆記與深度整合指南
date: 2026-05-11
tags: [部署, AI, 前端, 後端]
summary: 整理「Model Context Protocol (MCP) 學習筆記與深度整合指南」主題，重點包含：1. [什麼是 MCP？ (背景與核心價值)](#1-什麼是-mcp-背景與核心價值) 2. [核心架構與名詞解釋](#2-核心架構與名詞解釋)
status: 草稿
---

# Model Context Protocol (MCP) 學習筆記與深度整合指南 📑

## 大綱

1. [什麼是 MCP？ (背景與核心價值)](#1-什麼是-mcp-背景與核心價值)
2. [核心架構與名詞解釋](#2-核心架構與名詞解釋)
3. [三大核心能力 (Core Primitives) 深度解析](#3-三大核心能力-core-primitives-深度解析與實戰)
4. [傳輸機制 (Transports) 底層原理](#4-傳輸機制-transports-底層原理)
5. [通訊生命週期與 JSON-RPC 解析](#5-通訊生命週期與-json-rpc-解析)
6. [Vue + Flask 專案整合實戰](#6-vue--flask-專案整合實戰-核心精華)
7. [進階特性：資源訂閱與分頁](#7-進階特性資源訂閱與分頁)
8. [除錯與測試工具](#8-除錯與測試工具-inspector)
9. [安全性與權限管理](#9-安全性與權限管理-user-in-the-loop)
10. [生態系配置實例](#10-生態系配置實例)
11. [常見錯誤與除錯技巧](#11-常見錯誤與除錯技巧)
12. [性能優化與最佳實踐](#12-性能優化與最佳實踐)
13. [開源 MCP Server 生態](#13-開源-mcp-server-生態)
14. [完整實戰案例指南](#14-完整實戰案例指南)
15. [總結與參考資源](#15-總結與參考資源)---

## 1. 什麼是 MCP？ (背景與核心價值)

Model Context Protocol (MCP) 是一個**開源的標準通訊協定**（由 Anthropic 提出），旨在解決 AI 模型與外部資料、工具之間連接的「N 對 N 碎片化問題」。

### 痛點

過去，如果你寫了一個 AI 應用，想讓它讀取 GitHub、查詢 PostgreSQL、抓取網頁，你需要為每個資料源寫一份特製的 API 串接程式碼。如果明天你想換成 Claude Desktop 或 Cursor，這些串接代碼全部無法共用，因為每個平台的 Plugin 格式都不同。

### MCP 的解法

它定義了一套標準的 JSON-RPC 通訊格式。只要你的資料庫封裝成了「MCP Server」，任何支援 MCP 的「MCP Client」（如各種主流 IDE、AI 助理）都能直接對接，完美達成「**Write once, use everywhere (by any AI)**」。

### 比喻

- **過去**：每個國家的插座形狀都不同，你需要準備一堆轉接頭（客製化串接）
- **MCP**：就像是 USB-C 接口，統一了設備與供電源之間的標準，插上去就能溝通與傳輸

---

## 2. 核心架構與名詞解釋

MCP 採用 Client-Server 架構，且雙方必須透過某種 Transport 層進行雙向通訊。

### 角色定義

| 角色 | 說明 |
|------|------|
| **MCP Host (宿主應用)** | 發起請求的 AI 應用程式，例如 Claude Desktop、Cursor，或是你自己寫的 Vue + Flask AI 聊天室前端。它負責處理 UI、展示結果。 |
| **MCP Client (客戶端)** | 內建在 Host 中的通訊層。負責與外部 Server 建立連線、解析協定、並將結果回傳給 Host 或直接傳給大語言模型 (LLM)。 |
| **MCP Server (伺服器端)** | 提供實際能力的輕量級服務。例如「本機檔案系統 Server」、「SQL Server」、「Git Server」。 |

### 互動流程拓樸

```
[人類使用者] 
    | (透過 UI 對話)
    v
[MCP Host / AI App] ──(傳送對話與可用 Tools)──> [LLM (如 OpenAI/Claude)]
    |                                            |
 (內含 MCP Client) <─(LLM 決定要呼叫特定 Tool)────┘
    |
    | (透過 stdio 或 SSE 傳輸 MCP 標準協定)
    v
[MCP Server] ────> 執行實際動作 (查詢資料庫、讀檔案)
```

---

## 3. 三大核心能力 (Core Primitives) 深度解析與實戰

MCP Server 可以宣告自己支援以下三種能力，讓 LLM 了解如何利用它。

> **強烈建議**：在 Python 中使用官方的 `FastMCP`（來自 `mcp` 套件）來開發 Server，它類似 FastAPI，使用裝飾器即可完成複雜定義。

### 3.1 Resources (資源) 與動態模板

**定義**：提供給 AI 的唯讀上下文資料。就像是把檔案攤在桌上讓 AI 看。

**實例：提供靜態配置檔與動態資料**

```python
from mcp.server.fastmcp import FastMCP
import json

mcp = FastMCP("MyProjectServer")

# 1. 靜態資源
@mcp.resource("file:///app/config/system_status.json")
def get_system_status() -> str:
    """讓 AI 隨時可讀取當前系統狀態"""
    return json.dumps({
        "status": "healthy", 
        "uptime": "3600s", 
        "version": "1.0.5"
    })

# 2. 動態資源模板 (帶參數)
@mcp.resource("db://users/{user_id}/profile")
def get_user_profile(user_id: str) -> str:
    """根據 user_id 獲取使用者資料"""
    mock_db = {"1": "User A, Admin", "2": "User B, Guest"}
    return mock_db.get(user_id, "User not found")
```

### 3.2 Prompts (提示詞模板)

**定義**：Server 端預先寫好的「最佳實踐提示詞」。由使用者主動從 UI 觸發。

```python
@mcp.prompt("review_flask_code")
def prompt_review_flask(code_snippet: str) -> str:
    """提供針對 Flask 代碼的專業 Review 指令"""
    return f"""
    你現在是一位資深的 Flask 後端工程師。
    請幫我 Review 以下這段 Flask 程式碼，專注於：
    1. SQL Injection 等安全漏洞
    2. Blueprint 路由設計是否合理
    3. Error Handling 是否完善

    程式碼：
    {code_snippet}
    """
```

### 3.3 Tools (工具) 與 Schema

**定義**：允許 AI 主動呼叫、執行動作、並改變系統狀態的能力。（**最常用也最強大**）

```python
from typing import Optional

@mcp.tool()
def execute_database_query(query: str, limit: Optional[int] = 10) -> str:
    """執行只讀的 SQL 查詢並回傳結果。
    
    注意：
    - 只能執行 SELECT 語句
    - 避免查詢超過 10 萬筆的資料
    
    Args:
        query: SQL 查詢字串 (例如 SELECT * FROM users)
        limit: 限制回傳筆數，預設 10
    """
    if not query.lower().startswith("select"):
        return "Error: 僅允許執行 SELECT 語句"
    return f"執行了查詢: {query} LIMIT {limit}"
```

---

## 4. 傳輸機制 (Transports) 底層原理

MCP 協定不綁定特定網路層，官方規範了兩種主要實作：

### 4.1 Stdio (Standard Input/Output)

- **原理**：Host 在背後開啟子進程 (Subprocess) 執行 Server
- **特點**：高度安全、極低延遲、設定簡單
- **限制**：只能在本機端運行

### 4.2 SSE (Server-Sent Events) over HTTP

- **原理**：Server 啟動 Web 伺服器，Client 建立持續連接
- **特點**：適合微服務架構、支援遠端連接
- **限制**：需要處理 CORS 和網路權限

---

## 5. 通訊生命週期與 JSON-RPC 解析

### 階段 1：Initialization (初始化)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "clientInfo": { "name": "MyVueFlaskHost", "version": "1.0.0" }
  }
}
```

### 階段 2：Tool 執行

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "execute_database_query",
    "arguments": {"query": "SELECT * FROM logs"}
  }
}
```

---

## 6. Vue + Flask 專案整合實戰 (核心精華)

你有兩種架構方向：

| 情境 | 你的角色 | 場景 |
|------|--------|------|
| **A (提供者)** | MCP Server | 讓 Claude Desktop 幫你操作專案資料庫 |
| **B (整合者)** | MCP Host/Client | 打造全能 AI 聊天助理 |

### 實戰 A：Flask MCP Server

#### 編寫 MCP Server (`mcp_server.py`)

```python
from mcp.server.fastmcp import FastMCP
from datetime import datetime
import json

mcp = FastMCP("LearnlinkServer", "0.1.0")

@mcp.resource("app://config/system_info")
def get_system_info() -> str:
    """取得系統整體資訊"""
    return json.dumps({
        "app_name": "Learnlink",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    })

@mcp.tool()
def list_all_tasks() -> str:
    """列出所有任務"""
    tasks = [
        {"id": "1", "title": "MCP 集成", "status": "進行中"},
        {"id": "2", "title": "前端測試", "status": "待開始"}
    ]
    return json.dumps({"tasks": tasks, "count": len(tasks)})

@mcp.tool()
def create_task(title: str, description: str, deadline: str = None) -> str:
    """建立新任務"""
    new_task = {
        "id": "new_123",
        "title": title,
        "description": description,
        "deadline": deadline,
        "status": "待開始",
        "created_at": datetime.now().isoformat()
    }
    return json.dumps({"status": "success", "task": new_task})

if __name__ == "__main__":
    mcp.run()
```

### 實戰 B：Flask MCP Client (連接 Claude)

#### 編寫 Flask 後端 (Quart 版本，支援 Async)

```python
# app.py
import asyncio
import json
from quart import Quart, request, jsonify
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from anthropic import AsyncAnthropic
import os

app = Quart(__name__)
client = AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

server_params = StdioServerParameters(
    command="python",
    args=["./mcp_server.py"],
    env=None
)

async def process_chat_with_mcp(user_message: str):
    """處理 MCP 和 LLM 互動"""
    
    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                
                # 初始化
                await session.initialize()
                
                # 取得 Tools
                tools_response = await session.list_tools()
                
                # 轉換為 Claude 格式
                tools_for_claude = []
                for tool in tools_response.tools:
                    tools_for_claude.append({
                        "name": tool.name,
                        "description": tool.description,
                        "input_schema": tool.inputSchema
                    })
                
                messages = [{"role": "user", "content": user_message}]
                
                # 第一次呼叫 Claude
                response = await client.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=2048,
                    tools=tools_for_claude if tools_for_claude else None,
                    messages=messages
                )
                
                # 檢查是否使用工具
                if response.stop_reason == "tool_use":
                    for content in response.content:
                        if content.type == "tool_use":
                            tool_name = content.name
                            tool_args = content.input
                            tool_use_id = content.id
                            
                            # 呼叫 MCP Server
                            mcp_result = await session.call_tool(
                                tool_name, 
                                tool_args
                            )
                            
                            # 取得結果文字
                            result_text = mcp_result.content[0].text
                            
                            # 將結果加入對話
                            messages.append({
                                "role": "assistant",
                                "content": response.content
                            })
                            messages.append({
                                "role": "user",
                                "content": [
                                    {
                                        "type": "tool_result",
                                        "tool_use_id": tool_use_id,
                                        "content": result_text
                                    }
                                ]
                            })
                            
                            # 第二次呼叫 Claude 生成最終答案
                            final_response = await client.messages.create(
                                model="claude-3-5-sonnet-20241022",
                                max_tokens=2048,
                                messages=messages
                            )
                            
                            # 提取最終回應
                            for final_content in final_response.content:
                                if hasattr(final_content, 'text'):
                                    return final_content.text
                    
                    return "No text response"
                else:
                    # 直接回答
                    for content in response.content:
                        if hasattr(content, 'text'):
                            return content.text
                            
    except Exception as e:
        print(f"❌ 錯誤: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"Error: {str(e)}"

@app.route('/api/chat', methods=['POST'])
async def chat():
    """API 端點"""
    data = await request.get_json()
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({"error": "Message required"}), 400
    
    reply = await process_chat_with_mcp(user_message)
    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

---

## 7. 進階特性：資源訂閱與分頁

### 分頁 (Pagination)

```python
# 獲取第一頁
resources = await session.list_resources()

# 如果有下一頁
if resources.nextCursor:
    next_resources = await session.list_resources(
        cursor=resources.nextCursor
    )
```

### 資源訂閱 (Subscriptions)

```python
# 訂閱資源變更
await session.subscribe_resource("file:///logs/app.log")

# 接收變更通知
# 當資源更新時，Session 會發出 notifications/resources/updated
```

---

## 8. 除錯與測試工具 (Inspector)

### 啟動 Inspector

```bash
npx @modelcontextprotocol/inspector python mcp_server.py
```

功能特性：
1. **Server 能力探索**：查看所有 Tools/Resources
2. **互動測試**：直接點擊按鈕測試工具
3. **通訊監控**：查看底層 JSON-RPC 通訊

---

## 9. 安全性與權限管理 (User-in-the-loop)

### Flask 後端篩選破壞性工具

```python
DESTRUCTIVE_TOOLS = {"delete_user", "drop_table", "reset_database"}

async def process_chat_with_mcp(user_message: str):
    # ...
    if content.type == "tool_use":
        if content.name in DESTRUCTIVE_TOOLS:
            return {
                "status": "require_approval",
                "tool": content.name,
                "args": content.input
            }
```

---

## 10. 生態系配置實例

### Claude Desktop 配置

編輯 `%APPDATA%\Claude\claude_desktop_config.json`（Windows）：

```json
{
  "mcpServers": {
    "learnlink-server": {
      "command": "python",
      "args": ["C:\\path\\to\\mcp_server.py"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."}
    }
  }
}
```

---

## 11. 常見錯誤與除錯技巧

### 錯誤 1：Asyncio 事件迴圈衝突

**解決**：使用 Quart 而不是 Flask

```python
# ✅ 正確
from quart import Quart
@app.route('/chat')
async def chat():
    reply = await process_chat()
```

### 錯誤 2：Tool Schema 定義不完整

```python
# ✅ 完整
from typing import Optional

@mcp.tool()
def my_tool(x: int, y: Optional[int] = 10) -> int:
    """把兩個數字相加。
    
    Args:
        x: 第一個數字
        y: 第二個數字，預設 10
    """
    return x + y
```

---

## 12. 性能優化與最佳實踐

### 連接池複用

```python
# ✅ 高效：複用連接
mcp_session = None

@app.before_serving
async def init_mcp():
    global mcp_session
    read, write = await stdio_client(server_params).__aenter__()
    mcp_session = await ClientSession(read, write).__aenter__()
    await mcp_session.initialize()
```

### 最佳實踐檢查清單

- [ ] Type Hints：所有參數都有型別提示
- [ ] Docstring：每個 Tool 都有詳細說明
- [ ] 錯誤處理：Tool 有 try-except
- [ ] 測試：用 Inspector 測試所有 Tool
- [ ] 安全驗證：對所有輸入進行驗證

---

## 13. 開源 MCP Server 生態

| Server 名稱 | 功能 | 命令 |
|-----------|------|------|
| **filesystem** | 讀寫本機檔案 | `npx -y @modelcontextprotocol/server-filesystem /path` |
| **github** | GitHub 操作 | `npx -y @modelcontextprotocol/server-github` |
| **git** | Git 版本控制 | `npx -y @modelcontextprotocol/server-git /repo` |
| **postgres** | PostgreSQL 查詢 | `npx -y @modelcontextprotocol/server-postgres` |
| **sqlite** | SQLite 查詢 | `npx -y @modelcontextprotocol/server-sqlite db.sqlite` |

訪問 https://smithery.ai/ 找更多社區 Server

---

## 14. 完整實戰案例指南

### 環境準備

```bash
cd learnlink
python -m venv venv
pip install mcp fastmcp quart anthropic

# .env
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

### 測試完整流程

```bash
# 1. 測試 MCP Server
npx @modelcontextprotocol/inspector python mcp_server.py

# 2. 啟動 Flask 應用
python app.py

# 3. 訪問 http://localhost:5000
```

---

## 15. 總結與參考資源

### 核心思維

將 **MCP 視為 AI 時代的 API Gateway**。將系統邏輯封裝成標準 MCP Server，讓任何 AI 工具都能無縫整合。

### 實作順序

1. **入門**：用 FastMCP 寫簡單 Tool，用 Inspector 測試
2. **進階**：寫 Python Client 跑通 Tool Calling Loop
3. **整合**：搬進 Flask，串接 Vue 前端
4. **深化**：多個 Server，效能優化，部署上線

### 必備連結

| 資源 | 連結 |
|------|------|
| 官方文件 | https://modelcontextprotocol.io/ |
| Python SDK | https://github.com/modelcontextprotocol/python-sdk |
| 開源 Server | https://smithery.ai/ |
| Anthropic Docs | https://docs.anthropic.com |

---

**最後更新**：2026年4月5日  
**使用環境**：Python 3.10+、Anthropic Claude API、Vue 3、Quart 2.0+

### 4.2 SSE (Server-Sent Events) over HTTP

- **原理**：Server 啟動 Web 伺服器，Client 建立持續連接
- **特點**：適合微服務架構、支援遠端連接
- **限制**：需要處理 CORS 和網路權限

---

## 5. 通訊生命週期與 JSON-RPC 解析

### 階段 1：Initialization (初始化)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "clientInfo": { "name": "MyVueFlaskHost", "version": "1.0.0" }
  }
}
```

### 階段 2：Tool 執行

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "execute_database_query",
    "arguments": {"query": "SELECT * FROM logs"}
  }
}
```

---

## 6. Vue + Flask 專案整合實戰 (核心精華)

你有兩種架構方向：

| 情境 | 你的角色 | 場景 |
|------|--------|------|
| **A (提供者)** | MCP Server | 讓 Claude Desktop 幫你操作專案資料庫 |
| **B (整合者)** | MCP Host/Client | 打造全能 AI 聊天助理 |

### 實戰 A：Flask MCP Server

#### 安裝依賴

```bash
pip install mcp fastmcp
