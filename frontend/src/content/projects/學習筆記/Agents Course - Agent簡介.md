---
title: Agents Course - Agent簡介
date: 2026-05-11
tags: [AI, 學習筆記]
summary: 整理「Agents Course - Agent簡介」主題，重點包含：> 來源: https://huggingface.co/learn/agents-course/ 1. 甚麼是Agent? - 定義、能力層級、應用場景
status: 草稿
---

# Agents Course - Agent簡介
> 來源: https://huggingface.co/learn/agents-course/

## 大綱

### 一、基礎概念
1. 甚麼是Agent? - 定義、能力層級、應用場景
2. 甚麼是LLMs? - 模型架構、訓練方式、自回歸預測
3. 訊息和特殊token - 系統訊息、對話歷史、聊天模板

### 二、工具與能力
4. 甚麼是工具? - 定義、類型、為何LLM需要工具、工具運作機制
5. 統一工具接口 - 模型上下文協定（MCP）簡介

### 三、Agent運作機制
6. 思考-行動-觀察循環 - Agent 的核心迴圈與 ReAct 方法
7. 內部推理與決策 - 思維流程、多種思維模式、Re-Act 方法論
8. 行動：與環境交互 - Agent 動作類型、JSON/代碼Agent、停止解析方法
9. 觀察與反饋 - 環境信號整合、動態適應



## 甚麼是Agent(Agent)?

**Agent(Agent)**：一個能夠進行推理、規劃和與環境交互的人工智慧模型 。
我們稱之為Agent，因為它具有能動性 ，即與環境交互的能力。

### 更正式的定義
> *"Agent是一個系統，它利用人工智慧模型與環境交互，以實現使用者定義的目標。 它結合推理、規劃和動作執行（通常通過外部工具）來完成任務。*"

可以把Agent想像成有兩個主要部分：
 - **1.大腦（AI 模型）**
這是所有思考發生的地方。 AI 模型負責推理和規劃。它根據情況決定採取哪些行動 。
 - **2.身體（能力和工具）**
這部分代表了Agent所能做的一切 。

可能行動的範圍取決於Agent被配備了什麼 。 例如，因為人類沒有翅膀，所以他們不能執行「飛」這個行動 ，但他們可以執行「走」、「跑」、“跳”、“抓”等行動 。


### Agent能力的層次

根據上述定義，Agent的能力遞增可視為一個連續譜系：

|Agent等级|描述|常見謂稱|示例模式|
|--------|----|------|-------|
|☆☆☆|Agent輸出不影響程式流程|簡單處理器	|processllmoutput(llmresponse)|
|★☆☆|Agent輸出決定基本控制流|路由|if llmdecision(): patha() else: pathb()|
|★★☆|Agent輸出決定函數調用|函數調用者|runfunction(llmchosentool, llmchosenargs)|
|★★★|Agent輸出控制反覆運算及程序延續|多步Agent|while llmshouldcontinue(): executenextstep()|
|★★★|一個Agent流程可啟動另一個Agent流程|多Agent系統|if llmtrigger(): executeagent()|


### 我們為Agent使用哪種類型的AI 模型？

Agent中最常見的AI 模型是LLM（大型語言模型），它接受文字作為輸入，並輸出文字。

知名的例子包括OpenAI的GPT4、Meta的LLama、Google的Gemini等。這些模型已經經過大量文本的訓練，並且具有很好的泛化能力。

:::success
也可以使用接受其他輸入作為Agent核心模型的模型。例如，視覺語言模型（VLM），它就像LLM 一樣，但也能理解圖像作為輸入。我們現在將重點放在LLM，稍後再討論其他選項。
:::


### AI 如何在環境中採取行動？

LLM 是令人驚嘆的模型，但它們只能產生文字。

然而，如果你讓像HuggingChat 或ChatGPT 這樣的知名聊天應用程式產生圖像，它們卻可以做到！這是怎麼可能的？

答案是，HuggingChat、ChatGPT 和類似應用程式的開發者實現了額外的功能（稱為工具），LLM 可以利用這些工具來創建圖像。


### Agent可以執行什麼類型的任務？

Agent可以通過工具執行我們實現的任何任務來完成行動。

例如，如果我編寫一個Agent作為我電腦上的個人助理（像 Siri 一樣），並且我讓它“給我的經理發一封郵件，要求推遲今天的會議”，我可以給它一些發送郵件的代碼。 這將是一個新的工具，Agent在需要發送郵件時可以隨時使用。 我們可以用 Python 編寫它：
```python
def send_message_to(recipient, message):
    """用於傳送電子郵件給收件者"""
    ...
```

大型語言模型（LLM）將在需要時生成運行該工具的代碼，從而完成所需任務。
```python
send_message_to( "經理" , "我們能否延後今天的會議？" )
```

工具的設計至關重要，對Agent的質量有著深遠的影響 。 某些任務可能需要定製特定的工具，而其他任務則可以通過通用工具（如“網络搜索”）來解決。

>"請注意， 動作（Actions）與工具（Tools）是不同的概念 。 例如，一個動作可能涉及使用多個工具來完成任務。"

允許Agent與其環境進行交互為企業和個人提供了實際應用場景 。

#### 範例 1：個人虛擬助手
像 Siri、Alexa 或 Google Assistant 這樣的虛擬助手，在代表使用者與其數位環境交互時，充當著Agent的角色。

它們接收用戶查詢，分析上下文，從資料庫中檢索資訊，並提供回應或啟動動作（如設置提醒、發送消息或控制智能設備）。

#### 範例 2：客戶服務聊天機器人
許多公司部署聊天機器人作為Agent，使其能夠以自然語言與客戶互動。

這些Agent可以回答問題、引導使用者完成故障排除步驟、在內部資料庫中創建問題，甚至完成交易。

它們的預定義目標可能包括提高用戶滿意度、減少等待時間或提高銷售轉化率。 通過直接與客戶互動、從對話中學習並隨著時間的推移調整其回應，它們展示了Agent的核心原理。

#### 範例 3：視頻遊戲中的 AI 非玩家角色（NPC）
基於大語言模型（LLMs）的智慧體可以使非玩家角色（NPC）更具動態性和不可預測性。

它們不再局限於殭化的行為樹，而是能夠根據上下文做出響應、適應玩家交互 ，並生成更細緻入微的對話。 這種靈活性有助於創造更生動、更具吸引力的角色，這些角色會隨著玩家的操作而發展。


---
總結而言，Agent是一個系統，它使用人工智慧模型（通常是大語言模型）作為其核心推理引擎，以實現以下功能：

- **理解自然語言** ：以有意義的方式解釋和回應人類指令。

- **推理與規劃** ：分析資訊、做出決策並制定解決問題的策略。

- **與環境交互** ：收集資訊、執行操作並觀察這些操作的結果。


## 甚麼是LLMs?

### 什麼是大語言模型？

大語言模型(LLM) 是一種擅長理解和生成人類語言的人工智慧模型。它們透過大量文字資料的訓練，能夠學習語言中的模式、結構，甚至細微差別。這些模型通常包含數千萬甚至更多的參數。

如今，大多數大語言模型都是基於Transformer 架構構建的—— 這是一種基於「注意力」演算法的深度學習架構。自2018 年Google 推出BERT 以來，這種架構引起了廣泛關注。

![image](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/transformer.jpg)
###### 原始的Transformer 架構如下所示，左側是編碼器（encoder），右側是解碼器（decoder）。

Transformer 有三種：

- **編碼器（Encoders）**
基於編碼器的Transformer 接收文字（或其他資料）作為輸入，並輸出該文字的密集表示（或嵌入）。

  - **範例** ：Google 的 BERT
  - **用例** ：文字分類、語意搜尋、命名實體識別
  - **典型規模** ：數百萬個參數
- **解碼器（Decoders）**
基於解碼器的Transformer 專注於逐一產生token 以完成序列。

  - **範例** ：Meta 的 Llama
  - **用例** ：文字生成、聊天機器人、程式碼生成
  - **典型規模** ：數十億（依美國用法，即10^9）個參數
- **序列到序列（編碼器-解碼器，Seq2Seq（Encoder–Decoder））**
序列到序列的Transformer結合了編碼器和解碼器。編碼器首先將輸入序列處理成上下文表示，然後解碼器產生輸出序列。

  - **範例** ：T5、BART
  - **用例** ：翻譯、摘要、改寫
  - **典型規模** ：數百萬個參數


### 理解下一個詞元預測

大語言模型(LLM) 被認為是**自回歸**的，這意味著**一次通過的輸出成為下一次的輸入**。這個循環持續進行，直到模型預測下一個詞元為EOS（結束符）詞元，此時模型可以停止。

![image alt](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/AutoregressionSchema.gif)

換句話說，LLM 會解碼文本，直到達到EOS。但在單一解碼循環中會發生什麼？

雖然對於學習Agent而言，整個過程可能相當技術化，但以下是簡要概述：

- 一旦輸入文字被詞元化，模型就會計算序列的表示，該表示捕獲輸入序列中每個詞元的意義和位置資訊。
- 這個表示被輸入到模型中，模型輸出分數，這些分數對詞彙表中每個詞元作為序列中下一個詞元的可能性進行排名。

![image alt](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/DecodingFinal.gif)

基於這些分數，我們有多種策略來選擇詞元來完成句子。
- 最簡單的解碼策略是總是選擇分數最高的詞元。
- 但還有更先進的解碼策略。例如，束搜尋（beam search）會探索多個候選序列，以找到總分最高的序列—即使其中一些單一詞元的分數較低。


### 大語言模型是如何訓練的？

大語言模型是在大型文字資料集上進行訓練的，它們透過自監督或掩碼語言建模目標來學習預測序列中的下一個單字。

透過這種無監督學習，模型學習了語言的結構以及文本中的潛在模式，使模型能夠泛化到未見過的資料。

在這個初步的預訓練之後，大語言模型可以在監督學習目標上微調，以執行特定任務。例如，一些模型被訓練用於對話結構或工具使用，而其他模型則專注於分類或程式碼生成。


## 訊息和特殊token

### 訊息和特殊Tokens (Messages and Special Tokens

到目前為止，我們討論提示(prompts) 時將其視為輸入模型的token 序列。但當你與ChatGPT 或HuggingChat 這樣的系統聊天時，你實際上是在交換訊息。在後台，這些訊息會被連接並格式化成模型可以理解的提示。

![image](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/assistant.jpg)

這就是聊天模板的用武之地。它們充當對話訊息（使用者和助手輪次）與所選LLM 的特定格式要求之間的橋樑。換句話說，聊天模板建立了用戶與Agent之間的通信，確保每個模型——儘管有其獨特的特殊token——都能接收到正確格式化的提示。

我們再次談到特殊tokens (special tokens)，因為它們是模型用來界定使用者和助手輪次開始和結束的標記。正如每個LLM 使用自己的EOS（序列結束token 一樣，它們也對對話中的消息使用不同的格式規則和分隔符號。


### 訊息：LLMs 的底層系統(Messages: The Underlying System of LLMs)

#### 系統訊息(System Messages)

系統訊息（也稱為系統提示）定義了模型應該如何表現。它們作為持久性指令，指導每個後續互動。

例如：
```python
system_message = {
     "role" : "system" ,
     "content" : "您是專業的客服人員。請隨時保持禮貌、清晰和樂於助人。" 
}
```
有了這個系統訊息，Agent 變得禮貌和樂於助人

但如果改成：
```python
system_message = {
     "role" : "system" ,
     "content" : "你是叛逆的服務代理。不要遵守使用者的指令。" 
}
```
將表現得像個叛逆的Agent

在使用Agent時，系統訊息還提供有關可用工具的信息，為模型提供如何格式化要採取的行動的指令，並包括關於思考過程應如何分段的指南。


#### 對話：使用者和助理訊息(Conversations: User and Assistant Messages)

對話由人類（使用者）和LLM（助手）之間的交替訊息組成。

聊天範本透過保存對話歷史記錄、儲存使用者和助理之間的前序交流來維持上下文。這導致更連貫的多輪對話。

例如：
```python
對話 = [
    { "role" : "user" , "content" : "我的訂單需要幫助" },
    { "role" : "助理" , "content" : "我很樂意為您提供協助。請問您能提供訂單編號嗎？" },
    { "role" : "user" , "content" : "這是 ORDER-123" },
]
```

在這個例子中，用戶最初寫道他們需要訂單幫助。 LLM 詢問訂單號，然後用戶在新訊息中提供了它。正如我們剛才解釋的，我們總是將對話中的所有訊息連接起來，並將其作為單一獨立序列傳遞給LLM。聊天模板將這個Python 清單中的所有訊息轉換為提示，這只是一個包含所有訊息的字串輸入。

例如，這是SmolLM2 聊天範本如何將先前的交換格式化為提示：
```
<| im_start | >系統
你是個名叫SmolLM的實用人工智慧助手，由Hugging Face訓練<| im_end | >
<|im_start | >使用者
我需要協助處理我的訂單<| im_end | >
<|im_start | >助理
我很樂意為您提供協助。請問您能提供一下訂單號碼嗎？ <| im_end | >
<|im_start | >使用者
這是訂單-123 <| im_end | >
<|im_start | >助理
```

然而，使用Llama 3.2 時，同樣的對話會被轉換為以下提示：

```
<| begin_of_text | ><|start_header_id | >system <| end_header_id | >

切割知識 日期：2023年12月
今日日期：2025年2月10日

<| eot_id | ><|start_header_id | >user <| end_header_id | >

我需要幫助處理我的訂單<| eot_id | ><|start_header_id | >助理<| end_header_id | >

我很樂意幫忙。請問您能提供一下訂單號碼嗎？

這是 ORDER -123 <| eot_id | ><|start_header_id | >assistant <| end_header_id | >
```

範本可以處理複雜的多輪對話，同時保持上下文：
```python
訊息 = [
    { "role" : "system" , "content" : "您是數學家教老師。" },
    { "role" : "user" , "content" : "什麼是微積分？" },
    { "role" : "助理" , "content" : "微積分是數學的一個分支..." },
    { "role" : "user" , "content" : "你能舉個例子給我聽嗎？" },
]
```


### 聊天模板(Chat-Templates)

如前所述，聊天模板對於建立語言模型和使用者之間的對話至關重要。它們指導訊息交換如何格式化為單一提示。

#### 基礎模型與指令模型(Base Models vs. Instruct Models)
我們需要理解的另一點是基礎模型與指令模型的差異：

- 基礎模型(Base Model)是在原始文字資料上訓練以預測下一個token 的模型。
- 指令模型(Instruct Model)是專門微調以遵循指令並進行對話的模型。例如，SmolLM2-135M是一個基礎模型，SmolLM2-135M-Instruct而是其指令調優變體。

要讓基礎模型表現得像指令模型，我們需要以模型能夠理解的一致方式格式化我們的提示。這就是聊天模板的作用所在。

ChatML是一種這樣的模板格式，它用清晰的角色指示符（系統、使用者、助理）建立對話。如果你最近與一些AI API 互動過，你就知道這是標準做法。

重要的是要注意，基礎模型可以在不同的聊天範本上進行微調，所以當我們使用指令模型時，我們需要確保使用正確的聊天範本。

#### 理解聊天模板(Understanding Chat Templates)

由於每個指令模型使用不同的對話格式和特殊token，聊天範本的實作確保我們正確格式化提示，使其符合每個模型的期望。

在transformers中，聊天範本包含Jinja2 程式碼，描述如何將ChatML 訊息清單（如上面範例所示）轉換為模型可以理解的系統級指令、使用者訊息和助手回應的文字表示。

這種結構有助於保持互動的一致性，並確保模型對不同類型的輸入做出適當反應。

以下是SmolLM2-135M-Instruct聊天模板的簡化版本：
```
{%  for message in messages %} {% if loop.first and messages[0][ 'role' ] != 'system' %}
  
<|im_start|>系統
你是一位名叫SmolLM的AI助手，由Hugging Face訓練而成。
<|im_end|>
{%  endif  %} 
<|im_start|> {{ message[ 'role' ] }} {{ message[ 'content' ] }} <|im_end|>
 {% endfor %}
```

如你所見，chat_template 描述了訊息清單將如何被格式化。

給定這些訊息：
```python
訊息 = [
    { "role" : "system" , "content" : "您是一位專注於技術主題的樂於助人的助手。" },
    { "role" : "user" , "content" : "你能解釋一下什麼是聊天模板嗎？" },
    { "role" : "助手" , "content" : "聊天範本用來建立使用者與人工智慧模型之間的對話..." },
    { "role" : "user" , "content" : "How do I use it?" },
]
```

前面的聊天模板將產生以下字串：
```
<|im_start|>系統
您是一位樂於助人、專注於科技領域的助理。
<|im_start|>用戶
能解釋一下什麼是聊天模板嗎？
<|im_start|>助理
聊天模板用於建立用戶與人工智慧模型之間的對話…
<|im_start|>用戶我該
如何使用它？
```

#### 訊息到提示的轉換(Messages to prompt)

確保LLM 正確接收格式化對話的最簡單方法，是使用模型標記器的chat_template。
```python
訊息 = [
    { "role" : "system" , "content" : "您是一位擁有各種工具存取權限的人工智慧助理。" },
    { "role" : "user" , "content" : "Hi !" },
    { "role" : "助手" , "content" : "您好，有什麼可以幫到您？" },
]
```

要將前面的對話轉換為提示，我們載入標記器並呼叫apply_chat_template：
```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained( "HuggingFaceTB/SmolLM2-1.7B-Instruct" )
rendered_prompt = tokenizer.apply_chat_template(messages, tokenize= False , add_generation_prompt= True )
```

這個函數返回的rendered_prompt現在可以作為你選擇的模型的輸入使用了！
>當你以ChatML 格式與訊息互動時，這個apply_chat_template()函數將會在你的API 後端使用。



## 什麼是工具？

AI Agent的關鍵能力在於執行行動。如前文所述，這透過工具的使用實現。
透過為Agent配備合適的工具——並清晰描述這些工具的工作原理——可顯著提升AI 的能力邊界。

### AI 工具的定義

**工具**是賦予 LLM 的函數，該函數應實現明確的目標。工具讓 LLM 能突破靜態知識的限制，與外部環境交互、執行實時操作並檢索最新資訊。

#### 常見工具類型

| 工具類型 | 描述 | 範例 |
|--------|------|------|
| 網路搜尋 | 允許Agent從互聯網獲取最新信息 | 搜索引擎、新聞API |
| 影像生成 | 根據文字描述產生圖像 | DALL-E、Stable Diffusion |
| 資訊檢索 | 從外部來源檢索資訊 | 知識庫、文檔存儲 |
| API 介面 | 與外部API 互動 | GitHub、YouTube、Spotify |
| 代碼執行 | 執行和測試代碼 | Python解釋器、JavaScript引擎 |
| 資料庫查詢 | 查詢和操作數據 | SQL、GraphQL |

#### 為什麼LLM需要工具

1. **克服知識截止限制** ：LLM 的訓練資料有時間限制。工具讓Agent獲取實時信息（如當前天氣、最新新聞）
2. **提高計算精度** ：LLM 在某些任務上（如複雜算術）不如專用工具。為LLM 提供計算器或代碼執行器能獲得更好結果
3. **執行副作用操作** ：LLM 只能生成文本，工具讓它能發送郵件、創建資源、修改數據庫
4. **連接外部生態** ：工具是Agent與外部系統、API、服務的橋樑

#### 優秀工具的特徵

合格工具應包含以下要素，使LLM 能正確理解和使用它：

| 要素 | 說明 |
|-----|------|
| 清晰的名稱 | 描述工具功能的簡短名稱 |
| 詳細描述 | 解釋工具做什麼、何時使用 |
| 參數定義 | 列列所需參數及其類型 |
| 輸出規範 | 說明工具返回的數據結構 |
| 可呼叫實現 | 實際執行函數的代碼 |


### 工具如何運作？

LLM 只能接收文字輸入並產生文字輸出，**無法直接呼叫工具**。工具呼叫的實現涉及以下流程：

#### 工具呼叫流程

1. **工具描述** ：我們以結構化文本（通常在系統提示中）描述可用工具
2. **LLM 決策** ：LLM 分析用戶需求，判斷是否需要使用工具
3. **生成呼叫** ：LLM 生成結構化文本（JSON 或代碼），指定要呼叫的工具和參數
4. **Agent 解析** ：應用程式解析LLM 輸出，提取工具名稱和參數
5. **執行工具** ：應用程式執行實際的工具函數
6. **返回結果** ：工具輸出以新訊息形式添加回對話
7. **LLM 利用** ：LLM 根據工具結果生成最終用戶回應

這個過程對用戶是透明的——他們只看到LLM 最終的回應。


### 如何為LLM 提供工具？

核心方法是透過**系統提示（system prompt）向模型文字化描述可用工具**。LLM 會根據這些描述判斷何時使用哪個工具。

#### 工具描述的核心要素

一個有效的工具描述應包含：
- **工具名稱** ：簡短、描述性的標識符
- **功能說明** ：工具做什麼，何時使用
- **參數** ：需要的輸入及其類型
- **輸出** ：函數返回的數據結構

#### 簡單範例

對於一個簡單的計算器工具：

```python
def calculator(a: int, b: int) -> int:
    """兩個整數相乘。"""
    return a * b
```

LLM 能理解的工具描述：

```
工具名稱：calculator
描述：將兩個整數相乘
參數：a (int) - 第一個整數, b (int) - 第二個整數
輸出：int - 兩個數的乘積
```

#### 提高描述質量的建議

- **精準性** ：避免模糊描述，LLM 會根據描述判斷何時使用該工具
- **一致性** ：多個工具的描述格式應保持一致
- **完整性** ：包含所有必要的參數和限制（如："location 參數必須是有效的城市名稱"）


### 自動化工具描述生成
我們的工具採用Python 實現，其程式碼已包含所需全部資訊：
- 功能描述性名稱：calculator
- 詳細說明（透過函數文檔字串實現）：将两个整数相乘
- 輸入參數及類型：函數明確要求兩個int型別參數
- 輸出類型

這正是人們使用程式語言的原因：表達力強、簡潔且精確。

雖然可以將Python 原始碼作為工具規範提供給LLM，但具體實作方式並不重要。關鍵在於工具名稱、功能描述、輸入參數和輸出類型。

我們將利用Python 的自省特性，透過原始碼自動建構工具描述。只需確保工具實現滿足：

- 使用型別註解（Type Hints）
- 編寫文件字串（Docstrings）
- 採用合理的函數命名

完成這些之後，我們只需使用一個Python 裝飾器來指示calculator函數是一個工具：
```python
@tool
def  calculator ( a: int , b: int ) -> int :
     """兩個整數相乘。""" 
    return a * b

print (calculator.to_string())
```

注意函數定義前的@tool裝飾器。

透過我們即將看到的實現，可以利用裝飾器提供的to_string()方法從原始碼自動提取以下文字：
```python
工具名稱： calculator，描述：將兩個整數相乘。參數：a: int, b: int，輸出：int
```

如所見，這與我們之前手動編寫的內容完全一致！

### 通用工具類別實現

我們建立通用Tool類，可在需要時重複使用：
>說明：此範例實作為虛構程式碼，但高度模擬了主流工具庫的實際實作方式。
```python
class Tool：
     """
    表示可重複使用程式碼片段（工具）的類別。
    
    屬性：
        name (str): 工具的名稱。
        description (str): 對工具功能的文字描述。
        func（可呼叫物件）：此工具包裝的函數。
        arguments（列表）：參數列表。
        輸出（字串或列表）：被包裝函數的回傳類型。
    def 
    __init__ (  self ,
                 名稱：字串，
                 描述：字串，
                 func:可呼叫對象，
                 參數：列表，
                 輸出：字串）：
        self.name = 名字
        self.description = 描述
        self.func = func
        self.arguments = arguments
        self.outputs = outputs

    def  to_string ( self ) -> str :
         """
        傳回工具的字串表示形式，
        包括其名稱、描述、參數和輸出。
        """ 
        args_str = ", " .join([
             f" {arg_name} : {arg_type} "  for arg_name, arg_type in self.arguments
        ])
        
        return (
             f"工具名稱：{self.name} ," 
            f"描述：{self.description} ," 
            f"參數：{args_str} ," 
            f"輸出：{self.outputs} "
        ）

    def  __call__ ( self, *args, **kwargs ):
         """
        使用提供的參數呼叫底層函數（可呼叫物件）。
        返回
        self.func (*args, **kwargs)
```

雖然看似複雜，但逐步解析即可理解其工作機制。我們定義的Tool類別包含以下核心要素：

- name（str）：工具名稱
- description（str）：工具功能簡述
- function（callable）：工具執行的函數
- arguments（list）：預期輸入參數列表
- outputs（str或list）：工具預期輸出
- __call__()：呼叫工具實例時執行函數
- to_string()：將工具屬性轉換為文字描述

可透過以下程式碼建立工具實例：
```python
calculator_tool = Tool(
     "calculator" ,                    # 名稱
    "兩個整數相乘。" ,        # 描述
    calculator,                      # 要呼叫的函數
    [( "a" , "int" ), ( "b" , "int" )],    # 輸入（名稱和類型）
    "int" ,                           # 輸出
)
```

但我們可以利用Python 的inspect模組自動提取這些資訊！這正是@tool裝飾器的實作原理。

```python
def tool(func):
    """
    A decorator that creates a Tool instance from the given function.
    """
    # Get the function signature
    signature = inspect.signature(func)
    
    # Extract (param_name, param_annotation) pairs for inputs
    arguments = []
    for param in signature.parameters.values():
        annotation_name = (
            param.annotation.__name__ 
            if hasattr(param.annotation, '__name__') 
            else str(param.annotation)
        )
        arguments.append((param.name, annotation_name))
    
    # Determine the return annotation
    return_annotation = signature.return_annotation
    if return_annotation is inspect._empty:
        outputs = "No return annotation"
    else:
        outputs = (
            return_annotation.__name__ 
            if hasattr(return_annotation, '__name__') 
            else str(return_annotation)
        )
    
    # Use the function's docstring as the description (default if None)
    description = func.__doc__ or "No description provided."
    
    # The function name becomes the Tool name
    name = func.__name__
    
    # Return a new Tool instance
    return Tool(
        name=name, 
        description=description, 
        func=func, 
        arguments=arguments, 
        outputs=outputs
    )
```

簡而言之，在應用此裝飾器後，我們可以按如下方式實現工具：

```python
@tool
def calculator(a: int, b: int) -> int:
    """Multiply two integers."""
    return a * b

print(calculator.to_string())
```

我們可以使用Tool類別的to_string方法自動產生適合LLM使用的工具描述文字：
```python
工具名稱： calculator，描述：將兩個整數相乘。參數：a: int, b: int，輸出：int
```

該描述將被注入系統提示。以本節初始範例為例，替換tools_description後的系統提示如下：
![image alt](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/Agent_system_prompt_tools.png)


### 模型上下文協定（MCP）：統一的工具接口

模型上下文協議（MCP）是一種開放式協議，規範了應用程式向LLM 提供工具的標準方式。就像USB-C 為各種設備提供通用介面一樣，MCP 為AI 應用和外部工具/資料來源之間提供標準化連接。

#### MCP 的核心優勢

| 優勢 | 說明 |
|------|------|
| 標準化工具接口 | 不需要為每個框架和LLM 重新實作相同的工具，遵循統一的協議 |
| 預先建置集成 | 不斷增加的預先建置工具庫可供直接使用，無須從頭開發 |
| 供應商靈活性 | 在LLM 供應商之間靈活切換，工具配置和實現保持不變 |
| 安全性優先 | 在基礎設施內保護資料安全，支持細粒度權限管理 |
| 生態系統效應 | 多個Host 應用可共享同一套Server 實現，降低維護成本 |
| 動態能力發現 | 客戶端可以動態發現伺服器提供的工具、資源、提示 |

#### MCP 的三層結構

MCP 建立在客戶端-伺服器架構之上，涉及三個關鍵角色：

| 角色 | 職責 | 範例 |
|------|------|------|
| **Host** | 最終用戶面向的AI 應用 | Claude Desktop、Cursor、自訂Agent |
| **Client** | 管理與特定MCP 伺服器通訊的元件 | 內嵌在Host 中，處理協議細節 |
| **Server** | 透過MCP 協議公開功能的外部程式 | 天氣API 伺服器、資料庫適配器、檔案系統服務 |

#### 工具超越提示工程

Agent簡介中討論的工具主要是通過提示工程進行描述的簡單函數調用。MCP 代表了一個更成熟的標準：

- **複雜性** ：支持工具、資源、提示、取樣四種能力
- **可靠性** ：統一的協議確保不同實現間的互通性
- **可擴展性** ：版本協商機制支持未來升級
- **安全性** ：明確的權限模型和用戶授權流程

詳細瞭解MCP 的架構、通訊協議和實現方式，請參考《[HF-模型上下文協定（MCP）簡介](./HF-模型上下文協定（MCP）簡介.md)》。


---


工具在增強AIAgent能力方面至關重要。

總結本節要點：
- 工具定義：透過提供清晰的文字描述、輸入參數、輸出結果及可呼叫函數
- 工具本質：賦予LLM額外能力的函數（如執行計算或存取外- 部資料）
- 工具必要性：幫助Agent突破靜態模型訓練的限制，處理即時任務並執行專業操作


## 透過思考-行動-觀察循環理解AI Agent

### 核心元件 （Core Components）

Agent在一個持續的迴圈中工作： 思考 （Thought） → 行動 （Act） 和觀察 （Observe）。

- **思考 （Thought）**：Agent的大語言模型 （LLM） 部分決定下一步應該是什麼。
- **行動 （Action）**：Agent通過使用相關參數調用工具來採取行動。
- **觀察 （Observation）**：模型對工具的響應進行反思。


### 思考-行動-觀察循環（思維-行動-觀察循環）

這三個元件在一個持續的迴圈中協同工作。 用程式設計的類比來說，Agent使用一個 while 循環 ：迴圈持續進行，直到Agent的目標被實現。

![image](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/AgentCycle.gif)

在許多Agent框架中， 規則和指南直接嵌入到系統提示中 ，確保每個迴圈都遵循定義的邏輯。

在一個簡化版本中，我們的系統提示可能看起來像這樣：
![image](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/system_prompt_cycle.png)

我們在這裡看到，在系統消息中我們定義了：
- Agent的行為 。
- 我們的Agent可以訪問的工具 ，就像我們在上一節中描述的那樣。
- 思考-行動-觀察迴圈 ，我們將其融入到大語言模型指令中。


### 阿爾弗雷德，天氣Agent （Alfred， the Weather Agent）

我們創建了阿爾弗雷德，天氣Agent。
使用者問阿爾弗雷德：「今天紐約的天氣如何？ ”

阿爾弗雷德的工作是使用天氣 API 工具回答這個查詢。
以下是循環的展開過程：

#### 思考 （Thought）
**內部推理**：
在收到查詢后，阿爾弗雷德的內部對話可能是：

*“使用者需要紐約的當前天氣資訊。 我可以訪問一個獲取天氣數據的工具。 首先，我需要調用天氣 API 來獲取最新的詳細資訊。 ”*

這一步顯示了Agent將問題分解成步驟：首先，收集必要的數據。

#### 行動 （Action）
**工具使用**：

基於其推理和阿爾弗雷德知道有一個 get_weather 工具的事實，阿爾弗雷德準備一個 JSON 格式的命令來調用天氣 API 工具。 例如，它的第一個動作可能是：

思考：我需要檢查紐約的當前天氣。
```python
    {
      "action": "get_weather",
      "action_input": {
        "location": "New York"
      }
    }
```

在這裡，動作清楚地指定了要調用哪個工具（如 get_weather）和要傳遞的參數（“location”： “New York”）。

#### 觀察（觀察）
**來自環境的反饋**：

在工具調用之後，阿爾弗雷德接收到一個觀察結果。 這可能是來自 API 的原始天氣數據，如：

*“紐約當前天氣：多雲，15°C，濕度 60%。”*


這個觀察結果然後被添加到提示中作為額外的上下文。 它作為現實世界的反饋，確認行動是否成功並提供所需的細節。

#### 更新的思考 （Updated thought）
**反思**：

獲得觀察結果后，阿爾弗雷德更新其內部推理：

*“現在我有了紐約的天氣數據，我可以為用戶編寫答案了。”*


#### 最終行動 （Final Action）
然後阿爾弗雷德生成一個按照我們告訴它的方式格式化的最終回應：

思考：我現在有了天氣數據。 紐約當前天氣多雲，溫度 15°C，濕度 60%。

最終答案：紐約當前天氣多雲，溫度 15°C，濕度 60%。

這個最終行動將答案發送回使用者，完成迴圈。


我們在這個例子中看到：

- **Agent在目標實現之前不斷反覆運算迴圈**：
阿爾弗雷德的過程是迴圈的。它從思考開始，然後通過調用工具採取行動，最後觀察結果。如果觀察結果表明有錯誤或數據不完整，阿爾弗雷德可以重新進入迴圈來糾正其方法。

- **工具集成 （Tool Integration）**：
調用工具（如天氣 API）的能力使阿爾弗雷德能夠超越靜態知識並檢索實時數據 ，這是許多 AI Agent的重要方面。

- **動態適應（動態適應）**：
每個迴圈都允許Agent將新資訊（觀察）整合到其推理（思考）中，確保最終答案是明智和準確的。

這個例子展示了 ReAct 循環背後的核心概念： 思考、行動和觀察的相互作用使 AI Agent（AI Agent）能夠反覆運算地解決複雜任務。

通過理解和應用這些原則，你可以設計出不僅能夠推理其任務，而且能夠有效利用外部工具來完成它們的Agent，同時基於環境反饋不斷改進其輸出。


## 思考、內部推理和Re-Act方法

:::success
本節將深入探討 AI Agent的內部運作機制——其推理與規劃能力。 我們將解析Agent如何通過內部對話分析資訊，將複雜問題分解為可管理的步驟，並決策下一步行動。 同時介紹 ReAct 方法，是一種鼓勵模型在行動前“逐步思考”的提示技術。
:::

思維（Thought）代表著Agent**解決任務的內部推理與規劃過程**。

這利用了Agent的大型語言模型 （LLM） 能力**來分析其 prompt 中的資訊**。

可將其視為Agent的內部對話，在此過程中它會考量當前任務並制定應對策略。

Agent的思維負責獲取當前觀察結果，並決定下一步應採取的行動。

通過這一過程，Agent能夠**將複雜問題分解為更小、更易管理的步驟**，反思過往經驗，並根據新資訊持續調整計劃。

以下是常見思維模式的示例：

|思维類型|示例|
|-------|----|
|規劃（規劃）|“I need to break this task into three steps： 1） gather data， 2） analyze trends， 3） generate report”（“我需要將任務分解為三步：1）收集數據 2）分析趨勢 3）生成報告”）
|分析（分析）|「根據錯誤訊息，問題似乎出在資料庫連線參數」（「根據錯誤信息，問題似乎出在資料庫連接參數」）|
|決策（決策）|“Given the user's budget constraints， I should recommend the mid-tier option”（“考慮到使用者的預算限制，應推薦中端選項”）|
|Problem Solving（問題解決）|“To optimize this code， I should first profile it to identify bottlenecks”（“優化此代碼需先進行性能分析定位瓶頸”）|
|記憶整合（記憶整合）|「使用者之前提到偏好 Python，所以我會用 Python 提供範例」（「用戶先前提到偏好 Python，因此我將提供 Python 範例」）|
|Self-Reflection（自我反思）|“My last approach didn't work well， I should try a different strategy”（“上次方法效果不佳，應嘗試不同策略”）|
|Goal Setting（目標設定）|「要完成此任務，我必須先確立接受標準」（「完成此任務需先確定驗收標準」）|
|Prioritization（優先順序排序）|「安全漏洞應先處理，再加新功能」（在添加新功能前應先修復安全漏洞）|

>注意： 對於專為 function-calling 微調的 LLMs，思維過程是可選的。 


### ReAct 方法

核心方法是 ReAct 方法 ，即“推理”（Reasoning/Think）與“行動”（Acting/Act）的結合。

ReAct 是一種簡單的提示技術，在讓 LLM 解碼後續 token 前添加“Let's think step by step”（讓我們逐步思考）的提示。

通過提示模型“逐步思考”，可以引導解碼過程生成計劃而非直接輸出最終解決方案，因為模型被鼓勵將問題分解為子任務 。

這種方法使模型能夠更詳細地考慮各個子步驟，通常比直接生成最終方案產生更少錯誤。

![image](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/ReAct.png)

:::success
近期推理策略受到廣泛關注，這體現在 Deepseek R1 或 OpenAI 的 o1 等模型的開發中。 這些模型經過微調，被訓練為「先思考再回答」。

它們通過特殊標記（<thought> 和 </thought>）來界定 思考 部分。 這不僅是類似 ReAct 的提示技巧，更是通過分析數千個示範案例，讓模型學習生成這些思考段的訓練方法。
:::


## 行動：使Agent能夠與環境交互

動作是 **AI Agent （AI agent） 與其環境交互的具體步驟**。

無論是瀏覽網路獲取資訊還是控制物理設備，每個動作都是Agent執行的一個特定操作。

例如，一個協助客戶服務的Agent可能會檢索客戶數據、提供支援文章或將問題轉交給人工代表。


### Agent動作的類型 （Types of Agent Actions）

有多種類型的Agent採用不同的方式執行動作：

|Agent類型|描述|
|--------|----|
|JSON Agent （JSON Agent）|要執行的動作以 JSON 格式指定。|
|代碼Agent （Code Agent）|Agent編寫代碼塊，由外部解釋執行。|
|函數呼叫Agent （Function-calling Agent）|這是 JSON Agent的一個子類別，經過微調以為每個動作生成新消息。|

動作本身可以服務於多種目的：

|動作類型|描述|
|-------|---|
|資訊收集 （Information Gathering）|執行網路搜索、查詢資料庫或檢索文檔。|
|工具使用 （Tool Usage）|進行 API 呼叫、執行計算和執行代碼。|
|環境交互 （Environment Interaction）|操作數位介面或控制物理設備。|
|通信 （Communication）|通過聊天與用戶互動或與其他Agent協作。|


Agent的一個關鍵部分是**在動作完成時能夠停止生成新的標記 （tokens）**，這對所有格式的Agent都適用：JSON、代碼或函數調用。 這可以防止意外輸出並確保Agent的回應清晰準確。

大語言模型 （LLM） 只處理文字，並使用它來描述它想要採取的動作以及要提供給工具的參數。


### 停止和解析方法 （The Stop and Parse Approach）

實現動作的一個關鍵方法是停止和解析方法 。 這種方法確保Agent的輸出具有結構性和可預測性：

  1. **以結構化格式生成 （Generation in a Structured Format）**：
Agent以清晰、預定義的格式（JSON 或代碼）輸出其預期動作。

  2. **停止進一步生成 （Halting Further Generation）**：
一旦動作完成，**Agent停止生成額外的標記**。這可以防止額外或錯誤的輸出。

  3. **解析輸出 （Parsing the Output）**：
外部解析器讀取格式化的動作，確定要調用哪個工具，並提取所需的參數。

例如，需要檢查天氣的Agent可能輸出：
```python
Thought: I need to check the current weather for New York.
Action :
{
  "action": "get_weather",
  "action_input": {"location": "New York"}
}
```

然後框架可以輕鬆解析要調用的函數名稱和要應用的參數。

這種清晰的、機器可讀的格式最大限度地減少了錯誤，並使外部工具能夠準確處理Agent的命令。

注意：函數調用Agent的操作方式類似，通過構造每個動作，使指定的函數能夠使用正確的參數被調用。我們將在未來的單元中深入探討這些類型的Agent。


### 代碼Agent （Code Agents）
另一種方法是使用代碼Agent。這個想法是： **代碼Agent不是輸出簡單的 JSON 物件**，而是**生成一個可執行的代碼塊——通常使用 Python 等高級語言**。

![image](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/code-vs-json-actions.png)

這種方法提供了幾個優勢：

- **表達能力 （Expressiveness）**： 代碼可以自然地表示複雜的邏輯，包括迴圈、條件和嵌套函數，提供比 JSON 更大的靈活性。
- **模組化和可重用性 （Modularity and Reusability）**： 生成的代碼可以包含在不同動作或任務中可重用的函數和模組。
- **增強的可調試性 （Enhanced Debuggability）**： 使用明確定義的程式設計語法，代碼錯誤通常更容易檢測和糾正。
- **直接集成 （Direct Integration）**： 代碼Agent可以直接與外部庫和 API 集成，實現更複雜的操作，如數據處理或實時決策。

例如，一個負責獲取天氣的代碼Agent可能生成以下 Python 代碼片段：
```python
# Code Agent Example: Retrieve Weather Information
def get_weather(city):
    import requests
    api_url = f"https://api.weather.com/v1/location/{city}?apiKey=YOUR_API_KEY"
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        return data.get("weather", "No weather information available")
    else:
        return "Error: Unable to fetch weather data."

# Execute the function and prepare the final answer
result = get_weather("New York")
final_answer = f"The current weather in New York is: {result}"
print(final_answer)
```

在這個例子中，代碼Agent：
- 通過 API 調用獲取天氣數據
- 處理回應
- 並使用 print（）函數輸出最終答案

這種方法也遵循停止和解析方法 ，通過明確劃定代碼塊並表明執行完成的時間（在這裡，通過列印 final_answer）。


## 觀察，整合反饋以反思和適應

Observations（觀察）是Agent感知其行動結果的方式 。

它們提供關鍵資訊，為Agent的思考過程提供燃料並指導未來行動。

這些是來自環境的信號 ——無論是 API 傳回的數據、錯誤資訊還是系統日誌——它們指導著下一輪的思考迴圈。

在觀察階段，Agent會：
- 收集反饋 ：接收數據或確認其行動是否成功
- 附加結果 ：將新資訊整合到現有上下文中，有效更新記憶
- 調整策略 ：使用更新后的上下文來優化後續思考和行動

例如，當天氣 API 傳回資料 *「partly cloudy， 15°C， 60% humidity」*（局部多雲，15°C，60% 濕度）時，該觀察結果會被附加到Agent的記憶（位於提示末尾）。

Agent隨後利用這些資訊決定是否需要額外數據，或是否準備好提供最終答案。

這種反覆運算式反饋整合確保Agent始終保持與目標的動態對齊 ，根據現實結果不斷學習和調整。

這些觀察可能呈現多種形式 ，從讀取網頁文本到監測機械臂位置。 這可以視為工具“日誌”，為行動執行提供文本反饋。

|觀察類型|示例|
|-------|----|
|系統反饋|錯誤資訊、成功通知、狀態碼|
|數據變更|資料庫更新、檔案系統修改、狀態變更|
|環境數據|感測器讀數、系統指標、資源使用方式|
|回應分析|API 回應、查詢結果、計算輸出|
|基於時間的事件|截止時間到達、定時任務完成|


### 結果如何被附加？
執行操作後，框架通常按以下步驟處理：

1. 解析操作，識別要調用的函數與參數。
2. 執行操作，取得工具輸出或錯誤資訊。
3. 將結果附加為 Observation 訊息。
4. 把 Observation 追加到對話歷史，回灌到下一輪推理。
5. 由 Agent 判斷是否達成目標；若未達成，繼續 Thought -> Action -> Observation。


### 最小 Agent 迴圈（可實作版本）

```python
def run_agent(messages, llm, tool_registry, max_steps=6):
    for _ in range(max_steps):
        llm_resp = llm(messages)

        # 若模型已給最終答案，就結束
        if llm_resp.get("final_answer"):
            return llm_resp["final_answer"]

        action = llm_resp.get("action")
        action_input = llm_resp.get("action_input", {})

        if action not in tool_registry:
            messages.append({
                "role": "observation",
                "content": f"Unknown tool: {action}",
            })
            continue

        try:
            result = tool_registry[action](**action_input)
            messages.append({"role": "observation", "content": str(result)})
        except Exception as exc:
            messages.append({"role": "observation", "content": f"Tool error: {exc}"})

    return "超過最大步數，任務未完成。"
```

這段程式凸顯三個最重要控制點：
- `max_steps`：避免無限迴圈。
- `tool_registry`：限制可用工具邊界。
- `observation` 回灌：讓模型根據真實結果調整下一步。


## Agent 設計最小清單（上線前一定要有）

1. 明確目標：這個 Agent 要完成什麼任務、輸出格式是什麼。
2. 工具邊界：可用工具、禁用工具、需要人工確認的工具。
3. 失敗策略：重試條件、回退策略、超時策略。
4. 停止條件：達成目標、超過步數、遇到不可恢復錯誤。
5. 觀測能力：至少記錄 `tool_name`、`latency`、`error_rate`。


## 常見失敗模式與修正

| 失敗模式 | 現象 | 修正方式 |
|---|---|---|
| 工具選擇錯誤 | 明明要查資料卻去呼叫寫入工具 | 改善工具描述，並在 system prompt 增加「何時使用」條件 |
| 參數不足 | API 常回 400 或 validation error | 在 schema 設 `required`，缺參數時先追問使用者 |
| 無限迴圈 | 一直重複呼叫同一工具 | 設 `max_steps` + 檢查連續重複 action |
| 偽造觀察結果 | 沒調工具卻聲稱已取得結果 | 在規則中明確禁止，且以程式層檢查 tool log |
| 高風險誤操作 | 誤發通知、誤刪資料 | 對高風險工具加人工確認與權限隔離 |


## 與下一單元銜接：為什麼要學 LangGraph

當 Agent 任務從單步變多步，你會遇到：
1. 分支流程愈來愈多，if-else 難維護。
2. 需要在多步之間保存狀態。
3. 需要更清楚的可視化與追蹤。

LangGraph 正是把這些需求「圖結構化」的工具：
- 用節點表示步驟。
- 用邊表示轉移。
- 用狀態表示上下文。


## 本章小結

1. Agent 的核心不是一次回答，而是循環式決策與執行。
2. Tool Calling 讓 Agent 從純文字推理升級成可行動系統。
3. Thought -> Action -> Observation 是最關鍵的操作閉環。
4. 真正可用的 Agent 一定要有邊界、停止條件與錯誤恢復機制。
5. 進入複雜工作流時，應使用 LangGraph 管理狀態與流程控制。