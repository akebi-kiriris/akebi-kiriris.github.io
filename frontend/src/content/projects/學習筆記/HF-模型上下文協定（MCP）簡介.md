---
title: 模型上下文協定（MCP）簡介
date: 2026-04-10
tags: [AI, 學習筆記]
summary: 整理「模型上下文協定（MCP）簡介」主題，重點包含：1. **關鍵概念和術語** - MCP 的定義、M×N 問題及核心術語 2. **架構組件** - Host、Client、Server 的角色與通訊流程
status: 草稿
---

# 模型上下文協定（MCP）簡介

## 大綱

1. **關鍵概念和術語** - MCP 的定義、M×N 問題及核心術語
2. **架構組件** - Host、Client、Server 的角色與通訊流程  
3. **通訊協定** - JSON-RPC 基礎、消息類型與傳輸機制
4. **MCP 功能** - Tools、Resources、Prompts、Sampling 四大能力及協同方式
5. **MCP SDK** - 使用官方 SDK 實現 MCP 客戶端和伺服器
6. **最佳實踐** - 安全性、可擴展性、版本管理


## 關鍵概念和術語

### MCP 的重要性

AI 生態系統正快速演進，大型語言模型（LLMs）及其他 AI 系統的能力日益提升。然而，這些模型往往受限於訓練資料，且缺乏即時資訊或專業工具的存取。這種限制限制了 AI 系統在許多情境下提供真正相關、準確且有幫助的回應的潛力。

這正是模型上下文協定(模型情境協定，Model Context Protocol，MCP）發揮作用的地方。MCP 使 AI 模型能與外部資料來源、工具及環境連結，實現資訊與能力在 AI 系統與更廣泛數位世界間無縫轉移。這種互通性對於真正有用的 AI 應用的成長與採用至關重要。

MCP 常被形容為「AI 應用的 USB-C」。正如 USB-C 提供標準化的物理與邏輯介面，將各種周邊設備連接到運算裝置，MCP 也提供一套一致的協定，將 AI 模型與外部功能連結。此標準化惠及整個生態系統：

 - 使用者在 AI 應用中享受更簡單且一致的體驗
 - AI 應用程式開發者輕鬆整合日益豐富的工具與資料來源生態系統
 - 工具與資料提供者只需要建立一個能同時支援多個 AI 應用的實作
 - 更廣泛的生態系統受益於互通性提升、創新性及碎片化減少


### 整合問題(M×N Integration Problem)

M×N 整合問題是指在沒有標準化方法的情況下，將 M 個不同的 AI 應用程式連接到 N 個不同的外部工具或資料來源的挑戰。

### 沒有 MCP（M×N 問題）

如果沒有像 MCP 這樣的協議，開發人員將需要創建 M×N 個自訂整合——每個 AI 應用程式與外部功能的組合都需要一個整合。

![image](https://huggingface.co/datasets/mcp-course/images/resolve/main/unit1/1.png)

每個人工智慧應用都需要單獨與每個工具/資料來源整合。這是一個非常複雜且成本高昂的過程，會為開發人員帶來許多不便，並增加維護成本。

一旦我們有了多個模型和多個工具，整合數量就會變得太龐大而難以管理，因為每個整合都有其獨特的介面。

![image](https://huggingface.co/datasets/mcp-course/images/resolve/main/unit1/1a.png)


### 採用 MCP（M+N Solution）

MCP 透過提供標準接口，將此問題轉化為 M+N 問題：每個 AI 應用程式只需實現一次 MCP 的客戶端，每個工具/資料來源只需實現一次伺服器端。這顯著降低了整合複雜性和維護負擔。

![image](https://huggingface.co/datasets/mcp-course/images/resolve/main/unit1/2.png)


### 核心 MCP 術語

:::success
MCP 是一種類似 HTTP 或 USB-C 的標準，它是一種用於將 AI 應用連接到外部工具和資料來源的協定。因此，使用標準術語對於 MCP 的有效運作至關重要。

在記錄我們的應用程式並與社區溝通時，我們應該使用以下術語。
:::

#### Components 

就像 HTTP 中的客戶端/伺服器關係一樣，MCP 也具有客戶端和伺服器。

![image](https://huggingface.co/datasets/mcp-course/images/resolve/main/unit1/3.png)

 - **Host**:使用者導向的 AI 應用，最終使用者可直接與之互動。例如，Anthropic 的 Claude Desktop、Cursor 等 AI 增強型 IDE、Hugging Face Python SDK 等推理庫，或 LangChain 或 smolagents 等庫中構建的自訂應用。主機負責啟動與 MCP 伺服器的連接，並協調使用者請求、LLM 處理和外部工具之間的整體流程。
 - **Client** ：主機應用程式中的一個元件，負責管理與特定 MCP 伺服器的通訊。每個客戶端與單一伺服器保持一對一連接，處理 MCP 通訊的協定級細節，並充當主機邏輯和外部伺服器之間的中介。
 - **Server** ：透過 MCP 協定公開功能（工具、資源、提示）的外部程式或服務。

:::danger
很多內容中「客戶端(Client)」和「主機(Host)」這兩個詞經常互換使用。嚴格來說，主機是面向使用者的應用程序，而客戶端是主機應用程式中負責與特定 MCP 伺服器通訊的元件。
:::


#### Capabilities

當然，應用程式的價值取決於其提供的所有功能。因此，功能是應用程式最重要的組成部分。 MCP 可以連接任何軟體服務，但許多 AI 應用程式都使用一些通用功能。

|能力|描述|範例|
|---|---|----|
|工具(Tools)|AI 模型可以呼叫的可執行函數，用於執行操作或檢索計算資料。通常與應用程式的使用案例相關。|天氣應用程式中的一個工具可能是一個傳回特定地點天氣狀況的函數。|
|資源(Resources)|只讀資料來源，提供上下文信息，無需進行大量計算。|研究助理可能掌握一些科學論文資源。|
|提示(Prompts)|預先定義的範本或工作流程，用於指導使用者、人工智慧模型和可用功能之間的互動。|總結提示。|
|取樣(Sampling)|伺服器發起請求，要求客戶端/主機執行 LLM 交互，從而實現遞歸操作，使 LLM 能夠查看生成的內容並做出進一步的決定。|一款寫作應用程式會檢查自己的輸出結果，並決定進一步改進。|

![image](https://huggingface.co/datasets/mcp-course/images/resolve/main/unit1/8.png)

此應用程式可能以下列方式使用其 MCP 實體：

|Entity|Name|Description|
|---|----|---|
|Tool|Code Interpreter|能夠執行 LLM 編寫的程式碼的工具。|
|Resource|Documentation|包含應用程式文件的資源。|
|Prompt|Code Style|引導 LLM 產生程式碼的提示。|
|Sampling|Code Review|透過Sampling，LLM 可以審查程式碼並做出進一步的決定。|


## 架構組件

### Host, Client, and Server(主機、客戶端和伺服器)

模型上下文協定 (MCP) 建立在客戶端-伺服器架構之上，實現了 AI 模型與外部系統之間的結構化通訊。
![image](https://huggingface.co/datasets/mcp-course/images/resolve/main/unit1/4.png)

MCP 架構由三個主要元件組成，每個元件都有明確的角色和職責：主機、用戶端和伺服器。

#### Host
Host 是面向用戶的 AI 應用程序，end-users可直接與之互動。

例如：
 - 類似 OpenAI ChatGPT 或 Anthropic 的 Claude Desktop 這樣的 AI 聊天應用
 - 像 Cursor 這樣的 AI 增強型 IDE，或與 Continue.dev 等工具的集成
 - 使用 LangChain 或 smolagents 等庫構建的自訂 AI 代理和應用程式

Host 的職責包括：
 - 使用者互動和權限管理
 - 透過 MCP 用戶端發起與 MCP 伺服器的連接
 - 協調使用者請求、LLM 處理和外部工具之間的整體流程
 - 以統一的格式向使用者呈現結果

大多數情況下，使用者會根據自身需求和偏好選擇宿主應用程式。例如，開發人員可能會選擇 Cursor，因為它具有強大的程式碼編輯功能；而領域專家則可能使用在 smolagents 中建立的自訂應用程式。


#### Client

Client 是Host應用程式中的一個元件，負責管理與特定 MCP 伺服器的通訊。其主要特性包括:
- 每個客戶端都與單一伺服器保持一對一的連線。
- 處理 MCP 通訊的協定級細節
- 充當主機邏輯和外部伺服器之間的中介


#### Server

Server 是一個外部程式或服務，它透過 MCP 向 AI 模型公開功能。Server:
- 提供對特定外部工具、資料來源或服務的存取權限
- 作為現有功能的輕量級封裝
- 既可以本地運作（與主機在同一台機器上），也可以遠端運作（透過網路）。
- 以標準化的格式展示其功能，以便Client能夠發現和使用。

### Communication Flow

讓我們來看看這些元件在典型的 MCP 工作流程中是如何相互作用的：
- **使用者交互** ：使用者與主機應用程式進行交互，表達意圖或查詢。
- **主機處理** ： 主機處理使用者的輸入，可能會使用 LLM 來理解請求並確定可能需要哪些外部功能。
- **客戶端連線** ： 主機指示其客戶端元件連接到對應的伺服器。
- **功能發現** ： 客戶端向伺服器查詢，以發現它提供的功能（工具、資源、提示）。
- **功能呼叫** ：根據使用者的需求或 LLM 的判斷，主機指示客戶端從伺服器呼叫特定功能。
- **伺服器執行** ： 伺服器執行請求的功能並將結果傳回給客戶端。
- **結果整合** ： 客戶端將這些結果回饋給主機 ，主機將這些結果整合到 LLM 的上下文中，或直接呈現給使用者。

這種架構的關鍵優勢在於其模組化設計。單一主機可以透過不同的客戶端同時連接到多個伺服器 。無需更改現有主機即可為生態系統中新增伺服器 。不同伺服器的功能可以輕鬆組合。

該架構看似簡單，但其強大之處在於通訊協定的標準化以及組件間職責的清晰劃分。這種設計建構了一個緊密協作的生態系統，使人工智慧模型能夠與日益豐富的外部工具和資料來源無縫連接。


### 結論

這些互動模式遵循若干關鍵原則，這些原則塑造了 MCP 的設計和演進。該協議強調標準化 ，為 AI 連接提供通用協議，同時保持簡潔性 ，核心協議簡單易懂，並支援高級功能。 安全性優先，敏感操作需要使用者明確授權；可發現性支援動態發現功能。該協議在設計時充分考慮了可擴展性 ，支援透過版本控制和功能協商進行演進，並確保不同實現和環境之間的互通性 。


## 通訊協定

MCP 定義了一種標準化的通訊協議，使客戶端和伺服器能夠以一致且可預測的方式交換訊息。這種標準化對於整個社區的互通性至關重要。

### JSON-RPC：基礎

MCP 的核心是使用 JSON-RPC 2.0 作為客戶端和伺服器之間所有通訊的訊息格式。 JSON-RPC 是一種輕量級的遠端過程呼叫協議，採用 JSON 編碼，這使得它：
- 易於閱讀和調試
- 與程式語言無關，支援在任何程式設計環境中實現
- 成熟完善，規範明確，應用廣泛。

![image](https://huggingface.co/datasets/mcp-course/images/resolve/main/unit1/5.png)

該協定定義了三種類型的消息：

#### 1. 請求

由客戶端傳送到伺服器以啟動操作的請求訊息。請求訊息包含：
- 唯一識別符（ id ）
- 要呼叫的方法名稱（例如， tools/call ）
- 方法的參數（如有）

請求範例：
```python
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "weather",
    "arguments": {
      "location": "San Francisco"
    }
  }
}
```

#### 2. 回應

伺服器向客戶端發送的回應訊息，用於回覆請求。回應訊息包含以下內容：
- 與對應請求相同的 id
- result 要麼是成功，要麼是 error （失敗）。

成功回應範例：
```python
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "temperature": 62,
    "conditions": "Partly cloudy"
  }
}
```

失敗回應範例：
```python
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid location parameter"
  }
}
```

#### 3. 通知

單向訊息，無需回應。通常由伺服器傳送到客戶端，用於提供有關事件的更新或通知。

通知範例：
```python
{
  "jsonrpc": "2.0",
  "method": "progress",
  "params": {
    "message": "Processing data...",
    "percent": 50
  }
}
```


### 運輸機制

JSON-RPC 定義了訊息格式，而 MCP 也規定了這些訊息在用戶端和伺服器之間的傳輸方式。它支援兩種主要的傳輸機制：


#### 標準輸入/輸出 (stdio)

標準輸入輸出 (stdio) 傳輸用於本地通信，其中客戶端和伺服器運行在同一台機器上：

主機應用程式將伺服器作為子進程啟動，並透過寫入其標準輸入（stdin）和從其標準輸出（stdout）讀取資料來與其通訊。

:::success
這種傳輸方式的應用場景包括本機工具，例如檔案系統存取或執行本機腳本。
:::

這種傳輸方式的主要優點是簡單易用，無需網路配置，並且由作業系統進行安全沙盒保護。


#### HTTP + SSE(Server-Sent Events,伺服器傳送事件)/ Streamable HTTP

HTTP+SSE 傳輸協定用於遠端通信，其中客戶端和伺服器可能位於不同的機器上：

通訊透過 HTTP 進行，伺服器使用伺服器發送事件 (SSE) 透過持久連接向客戶端推送更新。

:::success
此傳輸方式的應用場景包括連接遠端 API、雲端服務或共享資源。
:::

這種傳輸方式的主要優點是：它能夠跨網路工作，能夠與 Web 服務集成，並且與無伺服器環境相容。

MCP 標準的最新更新引入或改進了“Streamable HTTP”，它允許伺服器在需要時動態升級到 SSE 以進行串流傳輸，從而提供了更大的靈活性，同時保持與無伺服器環境的兼容性。


### 互動生命週期

MCP 協定定義了客戶端和伺服器之間結構化的互動生命週期：

#### Initialization(初始化)

客戶端連接到伺服器，雙方交換協定版本和功能，伺服器以自身支援的協定版本和功能回應。

💻→🌐
initialize初始化
💻←🌐
response回覆	
💻→🌐
initialized已初始化

客戶端透過通知訊息確認初始化完成。


#### Discovery(發現)

客戶端請求有關可用功能的信息，伺服器則返回可用工具列表。
💻→🌐
tools/list工具/列表
💻←🌐
response

可以對每種工具、資源或提示類型重複此程序。


#### Execution(執行)

客戶端根據主機的需求呼叫對應的功能。

💻→🌐
tools/call工具/調用
💻←🌐
通知（可選進度）
💻←🌐
response


#### Termination(終止)

當不再需要連線時，連線會優雅地關閉，伺服器會確認關閉要求。

💻→🌐
shutdown
💻←🌐
response	
💻→🌐
exit

客戶端發送最終退出訊息以完成終止。


### 協定演化

MCP 的設計旨在實現可擴展性和適應性。初始化階段包含版本協商，從而確保協定在演進過程中保持向後相容性。此外，功能發現機制使客戶端能夠適應每個伺服器提供的特定功能，從而支援在同一生態系統中混合使用基礎伺服器和進階伺服器。



## 了解MCP功能

MCP 伺服器透過通訊協定向客戶端展現多種能力。這些能力分為四大類，各自具有獨特的特性與使用情境。


### Tools (工具)

Tools 是 AI 模型可透過 MCP 協議調用的可執行函式或動作。
- Control(控制) ：工具通常是由模型控制 ，意即 AI 模型（LLM）根據使用者的需求與情境決定何時呼叫工具。
- Safety(安全性) ：由於工具執行時可能有副作用，執行時可能很危險。因此，通常需要使用者明確批准。
- Use Cases(使用案例) ：發送訊息、建立工單、查詢 API、執行計算。

範例 ：一個能取得特定地點最新天氣資料的天氣工具：
```python
def get_weather(location: str) -> dict:
    """Get the current weather for a specified location."""
    # Connect to weather API and fetch data
    return {
        "temperature": 72,
        "conditions": "Sunny",
        "humidity": 45
    }
```


### Resources (資源)

資源提供唯讀存取資料來源，讓 AI 模型能在不執行複雜邏輯的情況下擷取上下文。

- Control(控制) ：資源由應用程式控制 ，意即主機應用程式通常決定何時存取資源。
- Nature(本質) ：它們設計用於以最小計算量進行資料檢索，類似 REST API 中的 GET 端點。
- Safety(安全性) ：由於它們是唯讀，通常比工具更低的安全風險。
- Use Cases(使用案例) ：存取檔案內容、擷取資料庫記錄、讀取設定資訊。

範例 ：提供檔案內容存取的資源：
```python
def read_file(file_path: str) -> str:
    """Read the contents of a file at the specified path."""
    with open(file_path, 'r') as f:
        return f.read()
```


### Prompts (提示)

提示是預先定義的範本或工作流程，引導使用者、AI 模型與伺服器能力之間的互動。

- Control(控制) ：提示由使用者控制 ，通常以 Host 應用程式介面中的選項形式呈現。
- Purpose(目的) ：他們結構化互動，以最大化利用現有工具與資源。
- Selection(選擇) ：使用者通常在 AI 模型開始處理前選擇提示，設定互動的上下文。
- Use Cases(使用案例) ：常見工作流程、專門任務範本、引導式互動。

範例 ：一個用於產生程式碼審查的提示範本：
```python
def code_review(code: str, language: str) -> list:
    """Generate a code review for the provided code snippet."""
    return [
        {
            "role": "system",
            "content": f"You are a code reviewer examining {language} code. Provide a detailed review highlighting best practices, potential issues, and suggestions for improvement."
        },
        {
            "role": "user",
            "content": f"Please review this {language} code:\n\n```{language}\n{code}\n```"
        }
    ]
```

### Sampling (抽樣)

取樣允許伺服器請求用戶端（特別是主機應用程式）執行大型語言模型（LLM）的互動。

- Control(控制) ：取樣由伺服器發起 ，但需要客戶端/主機的協助。
- Purpose(目的) ：它能實現伺服器驅動的代理行為，以及潛在的遞迴或多步驟互動。
- Safety(安全性) ：與工具一樣，取樣作業通常需要使用者批准。
- Use Cases(使用案例) ：複雜的多步驟任務、自主客服工作流程、互動流程。

範例 ：伺服器可能要求用戶端分析其已處理的資料：
```python
def request_sampling(messages, system_prompt=None, include_context="none"):
    """Request LLM sampling from the client."""
    # In a real implementation, this would send a request to the client
    return {
        "role": "assistant",
        "content": "Analysis of the provided data..."
    }
```

抽樣流程遵循以下步驟：
1. Server sends a sampling/createMessage request to the client
2. Client reviews the request and can modify it
3. Client samples from an LLM
4. Client reviews the completion
5. Client returns the result to the server


### 能力如何協同運作

|Capability|Controlled By|Direction|Side Effects|Approval Needed|Typical Use Cases|
|-----|------|------|------|------|------|
|Tools  工具|Model (LLM)|Client → Server|Yes (potentially)|Yes|動作、API 呼叫、資料操作|
|Resources  資源|Application|Client → Server|No (read-only)|Typically no|資料擷取、上下文收集|
|Prompts  提示|User|Server → Client |No|No (selected by user)|引導式工作流程、專門範本|
|Sampling  抽樣|Server|Server → Client → Server|Indirectly|Yes|多步驟任務，能動行為(agentic behaviors)|

這些能力設計上能以互補的方式協同運作：
1. 使用者可能會選擇一個提示來啟動專門的工作流程
2. 提示詞可能會包含來自資源的上下文
3. 在處理過程中，AI 模型可能會呼叫工具來執行特定動作
4. 對於複雜的操作，伺服器可能會使用取樣來請求額外的大型語言模型處理

這些原語(primitives)之間的區分為 MCP 互動提供了明確結構，使 AI 模型能在維持適當控制邊界的同時，存取資訊、執行動作並參與複雜的工作流程。


### Discovery Process

MCP 的一大特色是動態能力發現。當客戶端連接到伺服器時，可以透過特定的清單方法查詢可用的工具、資源和提示：

- `tools/list`：發現可用工具
- `resources/list`：發現可用資源
- `prompts/list` ：發現可用提示

這種動態發現機制讓用戶端能適應每個伺服器所提供的特定能力，而無需硬編碼該伺服器的功能。



## MCP SDK

MCP 提供 JavaScript、Python 及其他語言的官方 SDK。這讓你更容易在應用程式中實作 MCP 客戶端和伺服器。這些 SDK 負責底層協定細節，讓你能專注於應用程式的功能建置。


### SDK 概述
這兩個 SDK 提供相似的核心功能，遵循我們先前討論的 MCP 協議規範。他們處理的業務包括：
- 協定層級通訊
- 能力註冊與發現
- 訊息序列化/反序列化(serialization/deserialization)
- 連線管理
- 錯誤處理


### 核心原語實作

```python
from mcp.server.fastmcp import FastMCP

# Create an MCP server
mcp = FastMCP("Weather Service")

# Tool implementation
@mcp.tool()
def get_weather(location: str) -> str:
    """Get the current weather for a specified location."""
    return f"Weather in {location}: Sunny, 72°F"

# Resource implementation
@mcp.resource("weather://{location}")
def weather_resource(location: str) -> str:
    """Provide weather data as a resource."""
    return f"Weather data for {location}: Sunny, 72°F"

# Prompt implementation
@mcp.prompt()
def weather_report(location: str) -> str:
    """Create a weather report prompt."""
    return f"""You are a weather reporter. Weather report for {location}?"""


# Run the server
if __name__ == "__main__":
    mcp.run()
```    

當你的伺服器已經實作好後，你可以先執行伺服器腳本來啟動它。

```
mcp dev server.py
```

這會啟動執行該檔案 server.py 的開發伺服器。並記錄以下輸出：
```
Starting MCP inspector...
⚙️ Proxy server listening on port 6277
Spawned stdio transport
Connected MCP client to backing server transport
Created web app transport
Set up MCP proxy
🔍 MCP Inspector is up and running at http://127.0.0.1:6274 🚀
```

接著你可以在 http://127.0.0.1:6274 開啟 MCP 檢查器，查看伺服器的功能並與它們互動。

你會看到伺服器的功能，以及透過介面呼叫伺服器的功能。
![image](https://huggingface.co/datasets/mcp-course/images/resolve/main/unit1/6.png)



## MCP Clients

MCP 用戶端是關鍵元件，作為 AI 應用程式（主機）與 MCP 伺服器外部能力之間的橋樑。可以把主機想像成你的主要應用程式（像是 AI 助理或整合開發環境），而用戶端則是主機內負責處理 MCP 通訊的專門模組。



 

















