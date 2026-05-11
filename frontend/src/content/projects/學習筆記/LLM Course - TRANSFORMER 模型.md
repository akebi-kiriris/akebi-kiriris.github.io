---
title: LLM Course - TRANSFORMER 模型
date: 2026-05-11
tags: [AI, 學習筆記]
summary: 整理「LLM Course - TRANSFORMER 模型」主題，重點包含：> 來源: https://huggingface.co/learn/llm-course/zh-TW/ 1. 自然語言處理
status: 草稿
---

# LLM Course - TRANSFORMER 模型
> 來源: https://huggingface.co/learn/llm-course/zh-TW/

## 大綱

1. 自然語言處理
2. Transformers 能做什麼?
3. Transformers 是如何運作的?
4. 編碼器模型
5. 解碼器模型
6. 序列到序列模型
7. 偏見和侷限性
8. 總結



## 自然語言處理

### 什麼是自然語言處理?

NLP 是語言學和機器學習交叉領域，專注於理解與人類語言相關的一切。 NLP 任務的目標不僅是單獨理解單個單詞，而且是能夠理解這些單詞的上下文。

以下是常見 NLP 任務的列表，每個任務都有一些示例：

- 對整個句子進行分類: 獲取評論的情緒，檢測電子郵件是否為垃圾郵件，確定句子在語法上是否正確或兩個句子在邏輯上是否相關
- 對句子中的每個詞進行分類: 識別句子的語法成分（名詞、動詞、形容詞）或命名實體（人、地點、組織）
- 生成文本內容: 用自動生成的文本完成提示，用屏蔽詞填充文本中的空白
- 從文本中提取答案: 給定問題和上下文，根據上下文中提供的信息提取問題的答案
- 從輸入文本生成新句子: 將文本翻譯成另一種語言，總結文本


NLP 不僅限於書面文本。它還解決了語音識別和計算機視覺中的複雜挑戰，例如生成音頻樣本的轉錄或圖像描述。

### 為什麼具有挑戰性？
計算機處理信息的方式與人類不同。例如，當我們讀到「我餓了」這句話時，我們很容易理解它的意思。同樣，給定兩個句子，例如「我很餓」和「我很傷心」，我們可以輕鬆確定它們的相似程度。對於機器學習 (ML) 模型，此類任務更加困難。文本需要以一種使模型能夠從中學習的方式進行處理。而且由於語言很複雜，我們需要仔細考慮必須如何進行這種處理。


## TRANSFORMER 能做什麼?

Transformers 庫中最基本的對象是 **pipeline()** 函數。它將模型與其必要的預處理和後處理步驟連接起來，使我們能夠通過直接輸入任何文本並獲得最終的答案：

```python
# 代碼
from transformers import pipeline

classifier = pipeline("sentiment-analysis")
classifier("I've been waiting for a HuggingFace course my whole life.")


# 輸出
[{'label': 'POSITIVE', 'score': 0.9598047137260437}]
```

將一些文本傳遞到pipeline時涉及三個主要步驟：
- 文本被預處理為模型可以理解的格式。
- 預處理的輸入被傳遞給模型。
- 模型處理後輸出最終人類可以理解的結果。

目前可用的一些pipeline是：

- feature-extraction（獲取文本的向量表示）
- fill-mask
- ner（命名實體識別）
- question-answering
- sentiment-analysis
- summarization
- text-generation
- translation
- zero-shot-classification

### 零樣本分類

對於這項任務，**zero-shot-classification pipeline** 非常強大：它允許直接指定用於分類的標籤，因此不必依賴預訓練模型既有的標籤。下面的範例展示如何使用自訂標籤對文本進行分類。

```python 
# 代碼
from transformers import pipeline

classifier = pipeline("zero-shot-classification")
classifier(
    "This is a course about the Transformers library",
    candidate_labels=["education", "politics", "business"],
)


# 輸出
{'sequence': 'This is a course about the Transformers library',
 'labels': ['education', 'business', 'politics'],
 'scores': [0.8445963859558105, 0.111976258456707, 0.043427448719739914]}

```

此pipeline稱為zero-shot，因為不需要對數據上的模型進行微調即可使用它。它可以直接返回想要的任何標籤列表的概率分數！


### 文本生成

這裡的主要使用方法是您提供一個提示，模型將通過生成剩餘的文本來自動完成整段話。這類似於許多手機上的預測文本功能。文本生成涉及隨機性。

可以使用參數 **num_return_sequences** 控制生成多少個不同的序列，並使用參數 **max_length** 控制輸出文本的總長度。

```python
from transformers import pipeline

generator = pipeline("text-generation")
generator("In this course, we will teach you how to")
```

```python
[{'generated_text': 'In this course, we will teach you how to understand and use '
                    'data flow and data interchange when handling user data. We '
                    'will be working with one or more of the most commonly used '
                    'data flows — data flows of various types, as seen by the '
                    'HTTP'}]
```
### Mask filling

下一個pipeline是 fill-mask。此任務的想法是填充給定文本中的空白。

```python
from transformers import pipeline

unmasker = pipeline("fill-mask")
unmasker("This course will teach you all about <mask> models.", top_k=2)
```

```python
[{'sequence': 'This course will teach you all about mathematical models.',
  'score': 0.19619831442832947,
  'token': 30412,
  'token_str': ' mathematical'},
 {'sequence': 'This course will teach you all about computational models.',
  'score': 0.04052725434303284,
  'token': 38163,
  'token_str': ' computational'}]
```

**top_k** 參數控制要顯示多少個候選結果。請注意，這裡模型填入的是特殊的 **<mask>** 標記。不同掩碼填充模型可能使用不同的掩碼標記，因此在探索其他模型時要先確認正確的掩碼字。


### 命名實體識別

命名實體識別 (NER) 是一項任務，其中模型必須找到輸入文本的哪些部分對應於諸如人員、位置或組織之類的實體。

```python
from transformers import pipeline

ner = pipeline("ner", grouped_entities=True)
ner("My name is Sylvain and I work at Hugging Face in Brooklyn.")
```


```python
[{'entity_group': 'PER', 'score': 0.99816, 'word': 'Sylvain', 'start': 11, 'end': 18}, 
 {'entity_group': 'ORG', 'score': 0.97960, 'word': 'Hugging Face', 'start': 33, 'end': 45}, 
 {'entity_group': 'LOC', 'score': 0.99321, 'word': 'Brooklyn', 'start': 49, 'end': 57}
]
```
在這裡，模型正確地識別出 Sylvain 是一個人 (PER)，Hugging Face 是一個組織 (ORG)，而布魯克林是一個位置 (LOC)。

我們在pipeline創建函數中傳遞選項 **grouped_entities=True** 以告訴pipeline將對應於同一實體的句子部分重新組合在一起：這裡模型正確地將「Hugging」和「Face」分組為一個組織，即使名稱由多個詞組成。事實上，正如我們即將在下一章看到的，預處理甚至會將一些單詞分成更小的部分。例如，**Sylvain** 分割為了四部分：**S**、**##yl**、**##va** 和 **##in**。在後處理步驟中，pipeline成功地重新組合了這些部分。


### 問答系統

問答pipeline使用來自給定上下文的信息回答問題：

```python
from transformers import pipeline

question_answerer = pipeline("question-answering")
question_answerer(
    question="Where do I work?",
    context="My name is Sylvain and I work at Hugging Face in Brooklyn",
)
```

```python
{'score': 0.6385916471481323, 'start': 33, 'end': 45, 'answer': 'Hugging Face'}
```

此pipeline通過從提供的上下文中提取信息來工作；它不會憑空生成答案。

### 文本摘要

文本摘要是將文本縮減為較短文本的任務，同時保留文本中的主要（重要）信息。

```python
from transformers import pipeline

summarizer = pipeline("summarization")
summarizer(
    """
    America has changed dramatically during recent years. Not only has the number of 
    graduates in traditional engineering disciplines such as mechanical, civil, 
    electrical, chemical, and aeronautical engineering declined, but in most of 
    the premier American universities engineering curricula now concentrate on 
    and encourage largely the study of engineering science. As a result, there 
    are declining offerings in engineering subjects dealing with infrastructure, 
    the environment, and related issues, and greater concentration on high 
    technology subjects, largely supporting increasingly complex scientific 
    developments. While the latter is important, it should not be at the expense 
    of more traditional engineering.

    Rapidly developing economies such as China and India, as well as other 
    industrial countries in Europe and Asia, continue to encourage and advance 
    the teaching of engineering. Both China and India, respectively, graduate 
    six and eight times as many traditional engineers as does the United States. 
    Other industrial countries at minimum maintain their output, while America 
    suffers an increasingly serious decline in the number of engineering graduates 
    and a lack of well-educated engineers.
"""
)
```


```python
[{'summary_text': ' America has changed dramatically during recent years . The '
                  'number of engineering graduates in the U.S. has declined in '
                  'traditional engineering disciplines such as mechanical, civil '
                  ', electrical, chemical, and aeronautical engineering . Rapidly '
                  'developing economies such as China and India, as well as other '
                  'industrial countries in Europe and Asia, continue to encourage '
                  'and advance engineering .'}]
```
與文本生成一樣，您指定結果的 **max_length** 或 **min_length**。


### 翻譯
對於翻譯，如果您在任務名稱中提供語言對（例如「translation_en_to_fr」），則可以使用默認模型，但最簡單的方法是在模型中心（hub）選擇要使用的模型。

```python
from transformers import pipeline

translator = pipeline("translation", model="Helsinki-NLP/opus-mt-fr-en")
translator("Ce cours est produit par Hugging Face.")
```

```python
[{'translation_text': 'This course is produced by Hugging Face.'}]
```

## Transformers 是如何運作的?

### 一點Transformers的發展歷史
![image](https://hackmd.io/_uploads/S1M31lD5-x.svg)


### Transformers是語言模型
上面提到的所有 Transformer 模型（GPT、BERT、BART、T5 等）都被訓練爲語言模型。這意味着他們已經以無監督學習的方式接受了大量原始文本的訓練。無監督學習是一種訓練類型，其中目標是根據模型的輸入自動計算的。這意味着不需要人工來標記數據！

這種類型的模型可以對其訓練過的語言進行統計理解，但對於特定的實際任務並不是很有用。因此，一般的預訓練模型會經歷一個稱爲遷移學習的過程。在此過程中，模型在給定任務上以監督方式（即使用人工註釋標籤）進行微調。

任務的一個例子是閱讀 n 個單詞的句子，預測下一個單詞。這被稱爲因果語言建模，因爲輸出取決於過去和現在的輸入。
![causal_modeling](https://hackmd.io/_uploads/By_z3eP9Wx.svg)


另一個例子是遮罩語言建模，該模型預測句子中的遮住的詞。
![masked_modeling](https://hackmd.io/_uploads/HkCE3eP9Wg.svg)


#### 補充
|特性|監督式學習 (Supervised)|無監督式學習 (Unsupervised)|自監督式學習 (Self-supervised)|
|---|---|---|---|
|資料要求|資料 + 人工標籤|純資料 (無標籤)|純資料 (模型自動產生標籤)|
|核心目標|學習 x 到 y 的映射|發現資料的內在結構|學習資料的代表性 (Representation)|
|標籤來源|人類標註|無|資料的一部分作為另一部分的標籤|
|常見任務|分類、回歸|分群、降維|預訓練 (Pre-training)|

### Transformer 與大模型
Transformers 並不是單一模型，而是一整類模型架構與生態。透過共享預訓練權重，可以減少每個團隊都從零開始訓練的成本。

想象一下，如果每次一個研究團隊、一個學生組織或一家公司想要訓練一個模型，都從頭開始訓練的。這將導致巨大的、不必要的浪費！

這就是爲什麼共享語言模型至關重要：當遇見新的需求時，在既有預訓練權重之上進行微調，可以降低算力與時間消耗，也能降低整體計算成本和碳排放。


### 遷移學習

預訓練是訓練模型前的一個操作：隨機初始化權重，在沒有任何先驗知識的情況下開始訓練。

![pretraining](https://hackmd.io/_uploads/HyJThxwqbl.svg)

這種預訓練通常是在非常大量的數據上進行的。因此，它需要大量的數據，而且訓練可能需要幾周的時間。

另一方面，微調是在模型經過預訓練後完成的訓練。要執行微調，首先需要獲取一個經過預訓練的語言模型，然後使用特定於任務的數據集執行額外的訓練。等等，爲什麼不直接爲最後的任務而訓練呢？有幾個原因：
- 預訓練模型已經在與微調數據集有一些相似之處的數據集上進行了訓練。因此，微調過程能夠利用模型在預訓練期間獲得的知識（例如，對於NLP問題，預訓練模型將對您在任務中使用的語言有某種統計規律上的理解）。
- 由於預訓練模型已經在大量數據上進行了訓練，因此微調需要更少的數據來獲得不錯的結果。
- 出於同樣的原因，獲得好結果所需的時間和資源要少得多

例如，可以利用英語的預訓練過的模型，然後在arXiv語料庫上對其進行微調，從而形成一個基於科學/研究的模型。微調只需要有限的數據量：預訓練模型獲得的知識可以“遷移”到目標任務上，因此被稱爲遷移學習。

![finetuning](https://hackmd.io/_uploads/rkL-TlDcZe.svg)

因此，微調模型具有較低的時間、數據、財務和環境成本。迭代不同的微調方案也更快、更容易，因爲與完整的預訓練相比，訓練的約束更少。

這個過程也會比從頭開始的訓練（除非你有很多數據）取得更好的效果，這就是爲什麼你應該總是嘗試利用一個預訓練的模型—一個儘可能接近你手頭的任務的模型—並對其進行微調。

### 一般的體系結構

該模型主要由兩個塊組成：

**Encoder (左側)**: 編碼器接收輸入並構建其表示（其特徵）。這意味着對模型進行了優化，以從輸入中獲得理解。
**Decoder (右側)**: 解碼器使用編碼器的表示（特徵）以及其他輸入來生成目標序列。這意味着該模型已針對生成輸出進行了優化。
![transformers_blocks](https://hackmd.io/_uploads/BkChpeD5We.svg)

這些部件中的每一個都可以獨立使用，具體取決於任務：
- **Encoder-only models**: 適用於需要理解輸入的任務，如句子分類和命名實體識別。
- **Decoder-only models**: 適用於生成任務，如文本生成。
- **Encoder-decoder models** 或者 **sequence-to-sequence models**: 適用於需要根據輸入進行生成的任務，如翻譯或摘要。

### 注意力層
Transformer模型的一個關鍵特性是注意力層。這一層將告訴模型在處理每個單詞的表示時，要特別重視您傳遞給它的句子中的某些單詞（並且或多或少地忽略其他單詞）。

與自然語言相關的任何任務：一個詞本身有一個含義，但這個含義受語境的影響很大，語境可以是研究該詞之前或之後的任何其他詞（或多個詞）。

### 原始的結構

Transformer架構最初是爲翻譯而設計的。在訓練期間，編碼器接收特定語言的輸入（句子），而解碼器需要輸出對應語言的翻譯。在編碼器中，注意力層可以使用一個句子中的所有單詞。
然而，解碼器是按順序工作的，並且只能注意它已經翻譯過的句子中的單詞。例如，當我們預測了翻譯目標的前三個單詞時，我們將它們提供給解碼器，然後解碼器使用編碼器的所有輸入來嘗試預測第四個單詞。

爲了在訓練過程中加快速度（當模型可以訪問目標句子時），解碼器會被輸入整個目標，但不允許獲取到要翻譯的單詞（如果它在嘗試預測位置2的單詞時可以訪問位置2的單詞，解碼器就會偷懶，直接輸出那個單詞，從而無法學習到正確的語言關係！）。例如，當試圖預測第4個單詞時，注意力層只能獲取位置1到3的單詞。

最初的Transformer架構如下所示，編碼器位於左側，解碼器位於右側：
![transformers](https://hackmd.io/_uploads/SJl21ZDqZx.svg)

注意，解碼器塊中的第一個注意力層關聯到解碼器的所有（過去的）輸入，但是第二注意力層使用編碼器的輸出。因此，它可以訪問整個輸入句子，以最好地預測當前單詞。這是非常有用的，因爲不同的語言可以有語法規則將單詞按不同的順序排列，或者句子後面提供的一些上下文可能有助於確定給定單詞的最佳翻譯。

也可以在編碼器/解碼器中使用注意力遮罩層，以防止模型注意某些特殊單詞。例如，在批處理句子時，填充特殊詞使所有句子的長度一致。

### 架構與參數
在本課程中，當我們深入探討Transformers模型時，您將看到 架構、參數和模型 。 這些術語的含義略有不同：

- 架構: 這是模型的骨架，包含每個層的定義以及模型中發生的運算。
- Checkpoints: 這些是會被載入到架構中的權重。
- 模型: 這是一個籠統的術語，沒有「架構」或「參數」那麼精確，可能同時指兩者。為了避免歧義，建議分開使用「架構」與「參數」。

例如，BERT 是一個架構，而 bert-base-cased 是一組訓練好的權重參數。我們可以說「BERT 模型」或「bert-base-cased 權重」。


## 編碼器模型
「編碼器」模型指僅使用編碼器的 Transformer 模型。在每個階段，注意力層都可以獲取初始句子中的所有單詞。這些模型通常具有“雙向”注意力，被稱爲自編碼模型。

這些模型的預訓練通常圍繞着以某種方式破壞給定的句子（例如：通過隨機遮蓋其中的單詞），並讓模型尋找或重建給定的句子。

“編碼器”模型最適合於需要理解完整句子的任務，例如：句子分類、命名實體識別（以及更普遍的單詞分類）和閱讀理解後回答問題。

該系列模型的典型代表有：
- ALBERT
- BERT
- DistilBERT
- ELECTRA
- RoBERTa

## 解碼器模型
「解碼器」模型通常指僅使用解碼器的 Transformer 模型。
在每個階段，對於給定的單詞，注意力層只能獲取到句子中位於將要預測單詞前面的單詞。這些模型通常被稱爲自迴歸模型。

「解碼器」模型的預訓練通常圍繞預測句子中的下一個單詞進行。

這些模型最適合於涉及文本生成的任務。

該系列模型的典型代表有：
- CTRL
- GPT
- GPT-2
- Transformer XL

## 序列到序列模型
編碼器-解碼器模型（也稱爲序列到序列模型)同時使用 Transformer 架構的編碼器和解碼器兩個部分。在每個階段，編碼器的注意力層可以訪問初始句子中的所有單詞，而解碼器的注意力層只能訪問位於輸入中將要預測單詞前面的單詞。

這些模型的預訓練可以使用訓練編碼器或解碼器模型的方式來完成，但通常涉及更復雜的內容。例如，T5通過將文本的隨機跨度（可以包含多個單詞）替換爲單個特殊單詞來進行預訓練，然後目標是預測該掩碼單詞替換的文本。

序列到序列模型最適合於圍繞根據給定輸入生成新句子的任務，如摘要、翻譯或生成性問答。

該系列模型的典型代表有：
- BART
- mBART
- Marian
- T5

## 偏見和侷限性
如果打算在正式的項目中使用經過預訓練或經過微調的模型。
請注意：雖然這些模型是很強大，但它們也有侷限性。其中最大的一個問題是，爲了對大量數據進行預訓練，研究人員通常會蒐集所有他們能找到的內容，中間可能夾帶一些意識形態或者價值觀的刻板印象。

為了快速解釋清楚這個問題，讓我們回到一個使用 BERT 模型的 pipeline 的例子：
```python
from transformers import pipeline

unmasker = pipeline("fill-mask", model="bert-base-uncased")
result = unmasker("This man works as a [MASK].")
print([r["token_str"] for r in result])

result = unmasker("This woman works as a [MASK].")
print([r["token_str"] for r in result])
```

```python
['lawyer', 'carpenter', 'doctor', 'waiter', 'mechanic']
['nurse', 'waitress', 'teacher', 'maid', 'prostitute']
```

當要求模型填寫這兩句話中缺少的單詞時，模型給出的答案中，只有一個與性別無關（服務生/女服務生）。其他職業通常與某一特定性別相關，妓女最終進入了模型中與「女人」和「工作」相關的前五位。儘管 BERT 是使用經過篩選和清洗後，明顯中立的數據集上建立的的 Transformer 模型，而不是通過從互聯網上搜集數據（它是在Wikipedia 英文和BookCorpus數據集）。

因此，當您使用這些工具時需要記住：原始模型可能生成性別歧視、種族偏見或恐同內容。這種固有偏見也不會隨著微調而自動消失。

#### 補充

|模型|示例|任務|
|---|---|---|
|編碼器|ALBERT, BERT, DistilBERT, ELECTRA, RoBERTa|句子分類、命名實體識別、從文本中提取答案|
|解碼器|CTRL, GPT, GPT-2, Transformer XL|文本生成|
|編碼器-解碼器|BART, T5, Marian, mBART|文本摘要、翻譯、生成式問答|

## 本章重點整理

### 章節一頁結論

|主題|一句話記憶|
|---|---|
|NLP 是什麼|讓機器理解與生成人類語言的技術總稱。|
|Transformer 在做什麼|用注意力機制建模上下文關係，取代 RNN 的序列瓶頸。|
|為什麼要預訓練+微調|先學通用語言規律，再用少量任務資料快速適配。|
|Encoder/Decoder 差異|Encoder 偏理解，Decoder 偏生成，Encoder-Decoder 做輸入到輸出的轉換。|
|偏見風險|模型會繼承語料偏見，微調不代表偏見自然消失。|

### NLP、ML、LLM 的關係

|名詞|範圍|和其他概念的關係|例子|
|---|---|---|---|
|AI|最大範圍|包含 ML、規則系統、搜尋等|專家系統、機器人|
|ML|AI 子集合|用資料學規則|分類器、回歸模型|
|DL|ML 子集合|多層神經網路方法|CNN、RNN、Transformer|
|NLP|AI/ML 的應用領域|處理文字與語言任務|情感分析、NER、翻譯|
|LLM|NLP 中的大型語言模型|通常以 Transformer 為核心|GPT、Llama、Qwen|

### MLM、CLM、Seq2Seq 一次分清

|訓練目標|全名|看見的上下文|典型架構|代表模型|常見任務|
|---|---|---|---|---|---|
|MLM|Masked Language Modeling|看左右文，猜被遮住詞|Encoder-only|BERT、RoBERTa|分類、NER、抽取式 QA|
|CLM|Causal Language Modeling|只看左邊歷史詞，預測下一詞|Decoder-only|GPT 系列|文本生成、對話|
|Seq2Seq|Sequence-to-Sequence Learning|Encoder 看完整輸入，Decoder 逐步生成|Encoder-Decoder|T5、BART|翻譯、摘要、生成式 QA|

### pipeline 任務速查表

|pipeline|輸入|輸出|最適模型方向|容易搞錯的點|
|---|---|---|---|---|
|sentiment-analysis|一句或多句文本|情緒標籤+分數|Encoder|分數是信心，不等於真實機率|
|zero-shot-classification|文本+候選標籤|每個標籤分數|NLI 類模型|候選標籤文字本身會影響結果|
|fill-mask|含 `<mask>` 文本|候選填空|Encoder (MLM)|不同模型的 mask token 可能不同|
|ner|文本|實體片段+類型|Encoder|子詞切分會影響實體邊界|
|question-answering|問題+上下文|答案片段|Encoder|是抽取式，不是自由生成式|
|text-generation|提示詞|續寫文本|Decoder|長度與隨機參數強烈影響品質|
|summarization|長文本|摘要|Encoder-Decoder|摘要可能遺漏細節或有幻覺|
|translation|來源語句|目標語句|Encoder-Decoder|要確認語言方向與模型匹配|

### 快問快答

|題目|標準短答|
|---|---|
|為何 BERT 常用於分類而非長文生成？|因為 BERT 是 Encoder+MLM，擅長理解，不是自迴歸生成。|
|GPT 為何適合生成？|因為採 CLM，自左到右預測下一詞。|
|T5/BART 和 GPT 最大差異？|T5/BART 是 Encoder-Decoder，特別適合輸入到輸出轉換任務。|
|微調為何比從零訓練省資源？|已繼承預訓練知識，只需在任務資料上做較小更新。|
|模型偏見能靠一次微調完全消除嗎？|通常不能，只能緩解，仍需資料治理與安全評估。|