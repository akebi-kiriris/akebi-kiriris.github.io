---
title: SQL_ORM學習大綱
date: 2026-05-11
tags: [規劃, 部署, 後端]
summary: 整理「SQL_ORM學習大綱」主題，重點包含：> 目標：理解 SQL 查詢語法、SQLAlchemy ORM 用法、兩者關係與取捨   > 參考專案：PrAjeKt（`backend/blueprints/tasks.py`、...
status: 草稿
---

# SQL + ORM 學習筆記

> 目標：理解 SQL 查詢語法、SQLAlchemy ORM 用法、兩者關係與取捨  
> 參考專案：PrAjeKt（`backend/blueprints/tasks.py`、`timelines.py`、`models/`）

---

## 目錄

- [一、SQL 基礎](#一sql-基礎)
  - [1. 資料庫基本概念](#1-資料庫基本概念)
  - [2. 基本 CRUD](#2-基本-crud)
  - [3. 條件與排序](#3-條件與排序)
  - [4. JOIN（多表查詢）](#4-join多表查詢)
  - [5. 聚合與分組](#5-聚合與分組)
  - [6. 子查詢（Subquery）](#6-子查詢subquery) ⏭️
  - [7. 外鍵 Cascade 與軟刪除設計 🔥](#7-外鍵-cascade-與軟刪除設計-)
- [二、SQLAlchemy ORM](#二sqlalchemy-orm)
  - [1. 什麼是 ORM](#1-什麼是-orm)
  - [2. Model 定義](#2-model-定義)
  - [3. 查詢方法（最重要）](#3-查詢方法最重要)
  - [4. 關聯（Relationship）](#4-關聯relationship)
  - [5. Session 操作（寫入資料庫）](#5-session-操作寫入資料庫)
  - [6. Migration（Flask-Migrate / Alembic）](#6-migrationflask-migrate--alembic)
- [三、兩者的關係與取捨](#三兩者的關係與取捨)
  - [1. ORM 的本質就是幫你生 SQL](#1-orm-的本質就是幫你生-sql)
  - [2. 什麼時候 ORM 夠用](#2-什麼時候-orm-夠用)
  - [3. 什麼時候需要原生 SQL](#3-什麼時候需要原生-sql)
  - [4. N+1 問題是什麼](#4-n1-問題是什麼)
  - [5. 在 SQLAlchemy 執行原生 SQL](#5-在-sqlalchemy-執行原生-sql)
  - [6. 這個專案的演進對照](#6-這個專案的演進對照)
- [附錄：快速對照表](#附錄快速對照表)
- [練習建議](#練習建議)

---

## 閱讀優先度

> 目標是「能做留言 + 附件 + 垃圾桶」，不是 DBA 等級。

**🔥 現在就要讀**
- 一.1 資料庫基本概念（外鍵那段）
- 一.2 基本 CRUD
- 一.3 條件與排序（WHERE / ORDER BY / LIMIT）
- 一.4 **JOIN ← 最重要，一定要熟**
- 一.5 聚合（COUNT / GROUP BY）
- 一.7 外鍵 Cascade 與軟刪除設計 ← 新增，直接影響附件 + 垃圾桶
- 二.1 什麼是 ORM
- 二.2 Model 定義
- 二.3 查詢方法
- 二.4 **關聯 Relationship ← 包含 cascade ORM + 多對多**
- 二.5 Session 操作
- 三.4 N+1 問題

**⏭️ 之後再說（現在跳過）**
- 一.6 子查詢（很少用，遇到再看）
- 二.6 Migration 深入原理（會用指令就好）
- 三.3 什麼時候需要原生 SQL
- 三.5 在 SQLAlchemy 執行原生 SQL

---

## 一、SQL 基礎

### 1. 資料庫基本概念

資料庫就是一堆有結構的表格，概念跟 Excel 很像：

```
表（Table）  = 一張工作表
欄位（Column）= 每一列的標題（name、status、created_at 這種）
列（Row）    = 每一筆資料
```

**主鍵（Primary Key）**  
每張表必須有一個唯一識別每一列的欄位，通常是自動遞增的整數 `id`：
```
task_id = 1  → 只有這筆任務是 1，不會重複
task_id = 2  → 下一筆
```

**外鍵（Foreign Key）**  
用來關聯另一張表的主鍵，表示「這個欄位的值一定存在於另一張表」：
```
task_user.task_id = 3  → 這筆記錄屬於 tasks.task_id = 3 的任務
task_user.user_id = 5  → 成員是 users.id = 5 的使用者
```

**常用資料型別**

| 型別 | 說明 | 例子 |
|------|------|------|
| `INTEGER` | 整數 | `task_id`、`user_id` |
| `VARCHAR(n)` | 最多 n 字元的字串 | `name VARCHAR(200)` |
| `TEXT` | 不限長度的字串 | `description`、`remark` |
| `BOOLEAN` | 真/假（SQLite 存 1/0） | `completed`、`deleted` |
| `FLOAT` | 浮點數 | `estimated_hours` |
| `DATETIME` | 日期時間 | `created_at`、`end_date` |

---

### 2. 基本 CRUD

**SELECT — 查詢**
```sql
-- 查全部欄位
SELECT * FROM tasks;

-- 查特定欄位
SELECT task_id, name, status FROM tasks;

-- 加條件（AND 兩者都要成立，OR 任一成立）
SELECT * FROM tasks WHERE user_id = 1;
SELECT * FROM tasks WHERE user_id = 1 AND deleted = 0;
SELECT * FROM tasks WHERE status = 'pending' OR status = 'in_progress';
```

**INSERT — 新增**
```sql
-- 指定欄位（推薦，不怕表結構改動）
INSERT INTO tasks (user_id, name, status, end_date)
VALUES (1, '寫報告', 'pending', '2026-03-01');

-- ⚠️ 不指定欄位的話，值的順序必須跟建表時的欄位順序完全一致（很危險，不推薦）
```

**UPDATE — 更新**
```sql
UPDATE tasks SET status = 'completed' WHERE task_id = 5;

-- 同時改多個欄位
UPDATE tasks SET status = 'completed', completed = 1 WHERE task_id = 5;

-- ⚠️ 沒有 WHERE 的話會更新所有列！
UPDATE tasks SET status = 'completed';  -- 全部任務都改掉了！
```

**DELETE — 刪除**
```sql
DELETE FROM tasks WHERE task_id = 5;

-- ⚠️ 同樣，沒有 WHERE 會刪掉整張表的資料！
DELETE FROM tasks;  -- 全清空！
```

---

### 3. 條件與排序

**WHERE 常用運算子**
```sql
WHERE status = 'pending'           -- 等於
WHERE status != 'completed'        -- 不等於（也可寫 <>）
WHERE priority < 3                 -- 小於
WHERE priority <= 3                -- 小於等於
WHERE created_at >= '2026-01-01'   -- 大於等於
WHERE end_date IS NULL             -- 為 NULL（空）
WHERE end_date IS NOT NULL         -- 不為 NULL
WHERE user_id IN (1, 2, 3)         -- 在列表內
WHERE user_id NOT IN (1, 2, 3)     -- 不在列表內
WHERE name LIKE '%報告%'           -- 包含「報告」（% = 任意長度任意字元）
WHERE name LIKE '報告%'            -- 以「報告」開頭
WHERE name LIKE '%報告'            -- 以「報告」結尾
```

**BETWEEN — 範圍**
```sql
WHERE priority BETWEEN 1 AND 3     -- 等同 priority >= 1 AND priority <= 3
WHERE created_at BETWEEN '2026-01-01' AND '2026-03-01'
```

**ORDER BY — 排序**
```sql
ORDER BY end_date ASC              -- 升冪（預設，小→大，舊→新）
ORDER BY end_date DESC             -- 降冪（大→小，新→舊）
ORDER BY completed ASC, end_date ASC  -- 先按 completed 排，再按 end_date 排
-- 未完成的（completed=0）排前面，已完成的（completed=1）排後面，每組內再按日期排
```

**LIMIT / OFFSET — 分頁**
```sql
LIMIT 10                           -- 只取 10 筆
LIMIT 10 OFFSET 0                  -- 第 1~10 筆（第 1 頁）
LIMIT 10 OFFSET 10                 -- 第 11~20 筆（第 2 頁）
LIMIT 10 OFFSET 20                 -- 第 21~30 筆（第 3 頁）
-- 規律：OFFSET = (page - 1) * limit
```

---

### 4. JOIN（多表查詢）

JOIN 是 SQL 最重要也最常考的概念。當你需要同時從不同表取資料時使用。

**為什麼要 JOIN？**

PrAjeKt 的任務成員是存在 `task_user` 表的，但 `task_user` 只存 `user_id`，名字和 email 在 `users` 表。要一次查出「任務成員的名字」就需要 JOIN。

**INNER JOIN — 兩邊都有才返回**
```sql
SELECT tasks.name AS task_name, users.name AS member_name, task_user.role
FROM task_user
INNER JOIN tasks ON task_user.task_id = tasks.task_id
INNER JOIN users ON task_user.user_id = users.id
WHERE tasks.task_id = 1;

-- 結果：只有在 task_user、tasks、users 都有對應記錄才會出現
-- 如果某 task_user.user_id 在 users 表裡已被刪除，這列就消失
```

**LEFT JOIN — 左邊全返回，右邊沒有填 NULL**
```sql
SELECT timelines.id, timelines.name, timeline_users.role
FROM timelines
LEFT JOIN timeline_users
  ON timelines.id = timeline_users.timeline_id
  AND timeline_users.user_id = 1;

-- 就算 timeline 沒有 timeline_users 記錄，timeline 還是會回來（role 為 NULL）
-- 常用於「查所有 A，順便看看 B 有沒有跟 A 配對的記錄」
```

**直覺記法：**

```
Table A  INNER JOIN  Table B  →  只有 A ∩ B（交集，兩邊都有才留）
Table A  LEFT JOIN   Table B  →  A 全部 + B 有配到的（A 為主，B 可以是 NULL）
Table A  RIGHT JOIN  Table B  →  B 全部 + A 有配到的（很少用，通常改寫成 LEFT JOIN）
```

**⚠️ LEFT JOIN 的常見陷阱：ON 和 WHERE 的差別**
```sql
-- ✅ 正確：過濾條件放 ON，沒有 timeline_users 的 timeline 還是會返回（role=NULL）
SELECT * FROM timelines
LEFT JOIN timeline_users
  ON timelines.id = timeline_users.timeline_id
  AND timeline_users.user_id = 1;

-- ❌ 陷阱：過濾條件放 WHERE，NULL 的列會被過濾掉，效果跟 INNER JOIN 一樣
SELECT * FROM timelines
LEFT JOIN timeline_users ON timelines.id = timeline_users.timeline_id
WHERE timeline_users.user_id = 1;  -- 沒有 timeline_users 記錄的 timeline 不見了！
```

---

### 5. 聚合與分組

**聚合函數（對多列計算出一個值）**
```sql
SELECT COUNT(*) FROM tasks;                            -- 總筆數
SELECT COUNT(*) FROM tasks WHERE completed = 1;        -- 已完成任務數
SELECT COUNT(DISTINCT user_id) FROM task_user;         -- 有任務的不重複使用者數
SELECT SUM(estimated_hours) FROM tasks WHERE user_id = 1;  -- 預估工時加總
SELECT AVG(estimated_hours) FROM tasks;                -- 平均工時
SELECT MAX(end_date) FROM tasks WHERE user_id = 1;     -- 最晚截止日
SELECT MIN(end_date) FROM tasks WHERE completed = 0;   -- 最近截止日（未完成）
```

**GROUP BY — 分組聚合**

把資料依某個欄位分組，再對每組做聚合：
```sql
-- 每個使用者有幾個任務
SELECT user_id, COUNT(*) AS task_count
FROM tasks
GROUP BY user_id;
-- 結果長這樣：
-- user_id | task_count
--       1 |         8
--       2 |         3

-- 按任務狀態統計數量
SELECT status, COUNT(*) AS count
FROM tasks
WHERE deleted = 0
GROUP BY status;
-- status     | count
-- pending    | 12
-- in_progress|  5
-- completed  | 20
```

**HAVING — GROUP BY 之後的 WHERE**

`WHERE` 在分組前過濾，`HAVING` 在分組後過濾：
```sql
-- 任務數超過 5 個的使用者
SELECT user_id, COUNT(*) AS task_count
FROM tasks
WHERE deleted = 0                -- 先過濾（分組前）
GROUP BY user_id
HAVING COUNT(*) > 5;             -- 再過濾（分組後）

-- 記憶法：
-- WHERE  → 過濾原始資料列（在 GROUP BY 之前）
-- HAVING → 過濾分組後的結果（在 GROUP BY 之後）
```

---

### 6. 子查詢（Subquery）

> ⏭️ **之後再說** — 熟悉 JOIN 之後再回來看，現在可以跳過。JOIN 幾乎都能替代子查詢。

把一個查詢結果當作另一個查詢的條件或來源：

```sql
-- 有參與任務的使用者（用子查詢）
SELECT * FROM users
WHERE id IN (
    SELECT DISTINCT user_id FROM task_user
);

-- 等效的 JOIN 寫法（通常效能更好，推薦）
SELECT DISTINCT users.*
FROM users
INNER JOIN task_user ON users.id = task_user.user_id;
```

**FROM 子查詢**（把查詢結果當暫時表）
```sql
-- 取得每個 user 的任務數，再只留任務數最多的前 3 名
SELECT * FROM (
    SELECT user_id, COUNT(*) AS task_count
    FROM tasks
    GROUP BY user_id
) AS user_task_counts
ORDER BY task_count DESC
LIMIT 3;
```

**子查詢 vs JOIN 的取捨**
- 子查詢：邏輯讀起來較清楚（先想內層再想外層）
- JOIN：效能通常較好（資料庫可以優化），適合大資料量
- 小資料：用哪個都行，可讀性優先

---
### 7. 外鍵 Cascade 與軟刪除設計 🔥

這兩個概念直接影響你的**附件**和**垃圾桶**功能設計，一定要懂。

#### ON DELETE CASCADE（SQL 層連鎖刪除）

外鍵預設行為：如果刪了父表的記錄，子表有外鍵指向它的記錄會怏樣？

```sql
-- 預設（RESTRICT）：直接報錯，不讓你刪
DELETE FROM tasks WHERE task_id = 5;
-- → FOREIGN KEY constraint failed！（attachments 还有 task_id=5 的記錄）

-- ON DELETE CASCADE：刪任務時，附件一起刪
CREATE TABLE attachments (
    id       INTEGER PRIMARY KEY,
    task_id  INTEGER NOT NULL,
    filename TEXT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
    --                                               ↑ 刪 tasks 的記錄時，相關的 attachments 一起刪
);

-- 後來刪任務
DELETE FROM tasks WHERE task_id = 5;
-- → OK！attachments 裡所有 task_id = 5 的附件也自動刪掉
-- → 不用手動先刪附件再刪任務
```

**三種 ON DELETE 行為比較：**

| 行為 | 說明 | 適合場景 |
|------|------|----------|
| `CASCADE` | 父刪 → 子也刪 | 附件、留言（任務刪了不需要了） |
| `SET NULL` | 父刪 → 子的外鍵設為 NULL | 可選關聯（如任務的 timeline 刪了，任務本身保留） |
| `RESTRICT`（預設） | 父有子記錄就不讓刪 | 需要明確先處理子記錄的情況 |

#### 軟刪除（Soft Delete）— deleted_at 設計

**硬刪除**：直接 `DELETE`，資料消失，無法復原  
**軟刪除**：加一個欄位標記「已刪除」，資料還在，可以復原 → 這就是**垃圾桶機制**

**boolean `deleted` vs timestamp `deleted_at` 怏比較好？**

```sql
-- 方案 A：boolean deleted（PrAjeKt 目前的做法）
deleted = 0   -- 正常
deleted = 1   -- 已刪除

-- 方案 B：timestamp deleted_at（更好的做法）
deleted_at = NULL               -- 正常（NULL 表示沒刪）
deleted_at = '2026-02-27 14:30' -- 已刪除，而且知道什麼時候刪的
```

`deleted_at` 優於 `deleted` 的原因：
- 知道刪除時間（可以顯示「刪除於 3 天前」）
- 垃圾桶可以做「30 天自動清除」
- `deleted_at IS NULL` 語意比 `deleted = 0` 直覺

**查詢範例：**
```sql
-- 正常資料（軟刪除後不顯示）
SELECT * FROM tasks WHERE deleted_at IS NULL;

-- 垃圾桶（已刪除的資料）
SELECT * FROM tasks WHERE deleted_at IS NOT NULL;

-- 30 天內可復原的資料
SELECT * FROM tasks
WHERE deleted_at IS NOT NULL
  AND deleted_at >= DATE('now', '-30 days');
```

**PrAjeKt 垃圾桶功能的設計方向：**
```
刪除任務 → SET deleted_at = NOW()（不是真的 DELETE）
垃圾桶頁面 → 查 deleted_at IS NOT NULL
復原     → SET deleted_at = NULL
永久刪除 → 真正的 DELETE（30 天後自動清）
```

---
## 二、SQLAlchemy ORM

### 1. 什麼是 ORM

ORM（Object-Relational Mapping）把 Python class 對應到資料庫 table：

```
Python Class    ←→  資料庫 Table
attribute (欄位) ←→  Column
instance (物件)  ←→  一列資料（Row）
```

為什麼用 ORM：
- **安全**：不用拼 SQL 字串，自動防止 SQL Injection
- **方便**：Python 寫法，IDE 有自動補全和型別提示
- **可攜**：切換資料庫（SQLite → PostgreSQL）只需改設定，不用改查詢邏輯

---

### 2. Model 定義

```python
from models import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = 'tasks'          # 對應的資料表名稱（不寫預設是 class 名轉小寫）

    # 主鍵，自動遞增
    task_id    = db.Column(db.Integer, primary_key=True)

    # 外鍵，關聯到 users 表的 id 欄位
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # 普通欄位
    name       = db.Column(db.String(200), nullable=False)
    status     = db.Column(db.String(20), default='pending')
    priority   = db.Column(db.Integer, default=2)
    deleted    = db.Column(db.Boolean, default=False, nullable=False)

    # 時間欄位
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    #            注意：default/onupdate 傳 function 本身（不加括號），讓 SQLAlchemy 在需要時呼叫
```

**常用 Column 參數說明**

| 參數 | 說明 |
|------|------|
| `primary_key=True` | 主鍵（自動設 NOT NULL + UNIQUE + AUTO INCREMENT） |
| `nullable=False` | 不能是 NULL（必填），預設 `True`（允許 NULL） |
| `default=值` | INSERT 時的預設值（Python 層，不是 DB 層） |
| `onupdate=值` | UPDATE 時自動設定的值（常用於 `updated_at`） |
| `unique=True` | 值不能重複（如 email、username） |
| `index=True` | 建索引，加速以這個欄位為條件的查詢 |

---

### 3. 查詢方法（最重要）

#### 取得結果的終結方法

```python
# .all() → 回傳 List，沒有資料回傳空 list []（不是 None！）
tasks = Task.query.all()
tasks = Task.query.filter_by(user_id=1).all()

# .first() → 回傳第一筆，沒有資料回傳 None
task = Task.query.filter_by(user_id=1).first()
if task is None:
    # 沒找到

# .get(pk) → 用主鍵查，找不到回傳 None
task = Task.query.get(task_id)

# .get_or_404(pk) → 找不到直接回 404 給前端（Flask route 常用）
task = Task.query.get_or_404(task_id)
# 等同：task = Task.query.get(task_id) or abort(404)

# .count() → 回傳符合條件的筆數（整數）
count = Task.query.filter_by(user_id=1, deleted=False).count()

# .scalar() → 聚合查詢時拿單一值（詳見聚合章節）
from sqlalchemy import func
max_order = db.session.query(func.max(Subtask.sort_order)).filter_by(task_id=1).scalar()
# scalar() 回傳值本身（如 5 或 None），而不是包著值的 Row 物件
```

#### filter_by vs filter — 怎麼選？

```python
# filter_by：只能用等號，語法簡潔，適合簡單條件
Task.query.filter_by(user_id=1, deleted=False).all()
# 等同 WHERE user_id = 1 AND deleted = 0

# filter：支援所有比較運算子，必須用 Model.欄位 寫法
Task.query.filter(Task.status != 'completed').all()     # 不等於
Task.query.filter(Task.priority <= 2).all()             # 小於等於
Task.query.filter(Task.end_date >= datetime.now()).all() # 大於等於
Task.query.filter(Task.end_date == None).all()          # IS NULL（用 == None）
Task.query.filter(Task.end_date != None).all()          # IS NOT NULL
Task.query.filter(Task.task_id.in_([1, 2, 3])).all()   # IN
Task.query.filter(~Task.task_id.in_([1, 2, 3])).all()  # NOT IN（用 ~ 反轉）
Task.query.filter(Task.name.like('%報告%')).all()       # LIKE

# or_：任一條件成立（需要 import）
from sqlalchemy import or_
Task.query.filter(
    or_(Task.status == 'pending', Task.status == 'in_progress')
).all()

# 鏈式 filter = AND（多個 filter 連鎖）
Task.query.filter(Task.user_id == 1).filter(Task.deleted == False).all()
# 等同 WHERE user_id = 1 AND deleted = 0
```

**簡單記法：**
- 只有 `=` → 用 `filter_by`，語法乾淨
- 有 `!=`、`>=`、`in_`、`or_` → 用 `filter`

#### 排序與分頁

```python
Task.query.order_by(Task.end_date.asc()).all()    # 升冪（小→大）
Task.query.order_by(Task.end_date.desc()).all()   # 降冪（大→小）
# 多欄位排序：未完成的排前面，同組的按日期排
Task.query.order_by(Task.completed.asc(), Task.end_date.asc()).all()

# 分頁
Task.query.limit(10).all()                  # 前 10 筆
Task.query.limit(10).offset(20).all()       # 第 21~30 筆（第 3 頁）
```

#### 鏈式調用（Chain）

ORM 查詢可以一直串下去，最後才呼叫終結方法，這讓動態條件很好寫：
```python
# 動態篩選（只在有值時才加條件）
query = Task.query.filter_by(user_id=user_id, deleted=False)

if filter_status:
    query = query.filter(Task.status == filter_status)
if filter_priority:
    query = query.filter(Task.priority == filter_priority)

tasks = query.order_by(Task.end_date.asc()).all()
```

#### 聚合函數

```python
from sqlalchemy import func

# 計數（簡單版）
Task.query.filter_by(user_id=1).count()

# 複雜聚合要用 db.session.query
db.session.query(func.count(Task.task_id)).scalar()
db.session.query(func.count(Task.task_id)).filter_by(user_id=1).scalar()
db.session.query(func.max(Subtask.sort_order)).filter_by(task_id=1).scalar()
db.session.query(func.sum(Task.estimated_hours)).filter_by(user_id=1).scalar()
db.session.query(func.avg(Task.estimated_hours)).scalar()

# scalar() 直接回傳值（如 5 或 None），不需要 .all()[0][0] 這種醜法
```

---

### 4. 關聯（Relationship）

```python
class Timeline(db.Model):
    id    = db.Column(db.Integer, primary_key=True)
    name  = db.Column(db.String(200))

    # relationship：定義關聯，不是真正的資料庫欄位，只是 Python 層的捷徑
    tasks = db.relationship('Task', backref='timeline', lazy=True)
    #                        ↑ 關聯的 Model 名稱（字串，避免循環 import）
    #                                   ↑ 從 Task 反向存取 Timeline 的屬性名
    #                                              ↑ lazy 模式（見下方說明）
```

**lazy 模式的差別**

```python
# lazy=True（預設，懶載入）：只在第一次存取 .tasks 時才發查詢
timeline = Timeline.query.get(1)    # ← 只查 timelines 表，1 次查詢
print(timeline.tasks)               # ← 這時才查 tasks 表，又 1 次查詢

# 缺點：在迴圈裡會造成 N+1 問題（見後面的章節）

# joinedload（積極載入）：一次 JOIN 查出來，2 張表 1 次搞定
from sqlalchemy.orm import joinedload
timeline = Timeline.query.options(joinedload(Timeline.tasks)).get(1)
# 1 次查詢同時取出 timeline + 所有相關 tasks
```

**backref：反向存取**
```python
# 定義了 backref='timeline' 之後，可以從 Task 反向找 Timeline：
task = Task.query.get(1)
task.timeline   # → 自動查出對應的 Timeline 物件（不用再手動 filter）
```

**多對多（以 task_user 為例）**

多對多有兩種寫法：

**方式 A：`secondary=` 純中間表**（沒有額外欄位時用這個，最簡潔）
```python
# 先定義中間表（只有兩個外鍵）
task_user_table = db.Table(
    'task_user',
    db.Column('task_id', db.Integer, db.ForeignKey('tasks.task_id')),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'))
)

class Task(db.Model):
    members = db.relationship('User', secondary=task_user_table, backref='tasks')
    #                                  ↑ 指定中間表

# 使用：
task.members              # → List[User]（自動 JOIN task_user）
user.tasks               # → List[Task]（backref 反向）
task.members.append(user) # 直接操作，SQLAlchemy 幫你插 task_user
```

**方式 B：Association Object**（有額外欄位時，PrAjeKt 用這個）
```python
# 因為 task_user 有 role 欄位，所以要用 Model
class TaskUser(db.Model):
    __tablename__ = 'task_user'
    task_id  = db.Column(db.Integer, db.ForeignKey('tasks.task_id'), primary_key=True)
    user_id  = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    role     = db.Column(db.Integer, default=1)
    # 兩個欄位合起來是複合主鍵（同一任務的同一使用者只有一筆）

# 查詢：
members = TaskUser.query.filter_by(task_id=task_id).all()
for m in members:
    print(m.role, m.user_id)
```

**`secondary=` vs Association Object 怏麼選：**
- 中間表**沒有**額外欄位 → 用 `secondary=`，操作最簡單
- 中間表**有**額外欄位（如 `role`、`joined_at`）→ 用 Association Object

#### cascade — ORM 層的連鎖刪除 🔥

```python
class Task(db.Model):
    # ...
    comments = db.relationship(
        'Comment',
        backref='task',
        cascade='all, delete-orphan'
        #        ↑ 刪任務時，相關留言也一起刪（ORM 層）
    )
    attachments = db.relationship(
        'Attachment',
        backref='task',
        cascade='all, delete-orphan'
    )

# 效果：
task = Task.query.get(task_id)
db.session.delete(task)
db.session.commit()
# → comments + attachments 全部跨著刪，不用手動一筆一筆刪
```

**SQL cascade 和 ORM cascade 的差別：**

| | SQL `ON DELETE CASCADE` | ORM `cascade='all, delete-orphan'` |
|---|---|---|
| 執行位置 | 資料庫層（DB 直接處理） | Python 層（SQLAlchemy 發多個 DELETE） |
| 觸發時機 | 任何方式刪父記錄 | 只有透過 SQLAlchemy 刪才有效 |
| 建議 | 重要的關聯都加 | 都加，兩層保筷最安全 |

---

### 5. Session 操作（寫入資料庫）

**新增（INSERT）**
```python
new_task = Task(
    user_id=1,
    name='學 SQL',
    status='pending'
)
db.session.add(new_task)
db.session.commit()
# commit 之後資料才真正寫入資料庫（在此之前都在記憶體裡）
```

**flush vs commit — 什麼差別？**

```python
# commit：完成整個 transaction，資料永久寫入，不可回滾
# flush：把變更送給資料庫「執行」，但還在 transaction 內（可以 rollback）

# 實際使用情境：需要取得 INSERT 後自動產生的 ID
db.session.add(new_task)
db.session.flush()
# 執行完 flush 後，new_task.task_id 已經有值（DB 幫你分配的）
# 但這筆資料還未 commit，還可以 rollback

db.session.add(TaskUser(task_id=new_task.task_id, user_id=user_id, role=0))
db.session.commit()
# 現在兩筆資料都永久寫入了
```

**更新（UPDATE）**
```python
task = Task.query.get(task_id)
task.name = '新名稱'         # 直接改屬性
task.status = 'in_progress'
db.session.commit()
# 不需要再 add，SQLAlchemy 會自動追蹤已查出的 Model 物件的變動
```

**刪除（DELETE）**
```python
# 刪除單筆（需要先查出來）
task = Task.query.get(task_id)
db.session.delete(task)
db.session.commit()

# 批次刪除（不需要先 query，直接刪）
TaskUser.query.filter_by(task_id=task_id).delete()
db.session.commit()
# 等同 DELETE FROM task_user WHERE task_id = task_id
```

**rollback — 出錯時一定要加！**
```python
try:
    new_task = Task(user_id=1, name='新任務')
    db.session.add(new_task)
    db.session.commit()
except Exception as e:
    db.session.rollback()   # ⚠️ 沒有 rollback，session 會卡在錯誤狀態
    # 之後所有 DB 操作都會繼續失敗，直到 rollback
    return jsonify({'error': str(e)}), 500
```

---

### 6. Migration（Flask-Migrate / Alembic）

> ⏭️ **之後再說** — 會用 `flask db migrate` 和 `flask db upgrade` 兩個指令就夠了，深入原理先跳過。

Migration 是用來同步 Python Model 和實際資料庫結構的工具。你改了 Model，資料庫不會自動跟著變，需要 migration。

**完整流程**
```bash
# 1. 修改 models/xxx.py（加欄位、刪欄位、改型別）

# 2. 自動偵測 model 的變化，生成 migration 腳本（只是生成，還沒執行）
flask db migrate -m "add_role_to_task_user"
# 在 migrations/versions/ 生成一個像 6a15da3a4025_add_role_to_task_user.py 的檔

# 3. ⚠️ 開啟剛生成的腳本檢查（重要！自動偵測有時不準）
# 確認 upgrade() 和 downgrade() 的內容是否符合預期

# 4. 套用到資料庫
flask db upgrade

# 其他指令
flask db downgrade          # 回滾到上一個版本（執行 downgrade()）
flask db history            # 查看所有 migration 歷史（版本列表）
flask db current            # 查看目前資料庫套用到哪個版本
```

**生成的腳本長什麼樣**
```python
# migrations/versions/6a15da3a4025_remove_assistant_field.py

def upgrade():
    # 新增欄位
    op.add_column('tasks', sa.Column('priority', sa.Integer(), nullable=True))
    # 刪除欄位
    op.drop_column('tasks', 'assistant')
    # 新增表
    op.create_table('task_user', ...)
    # 改欄位型別（SQLite 支援有限）
    op.alter_column('tasks', 'status', type_=sa.String(50))

def downgrade():
    # upgrade 的完全相反操作（讓你可以回滾）
    op.add_column('tasks', sa.Column('assistant', sa.String(255), nullable=True))
    op.drop_column('tasks', 'priority')
```

**常見問題**

| 狀況 | 原因 | 解法 |
|------|------|------|
| `No changes detected` | Model 改了但沒存，或 import 路徑不對 | 確認 model 有被 `app.py` 載入 |
| SQLite 刪欄位看起來有問題 | SQLite 不支援部分 ALTER，Alembic 用建新表方式迂迴 | 通常自動 OK，不用管 |
| migration 衝突 | 兩個 migration 都以同一個版本為 base | 手動修改其中一個的 `down_revision` |
| `Target database is not up to date` | 有 migration 沒跑 | 先 `flask db upgrade` |

---

## 三、兩者的關係與取捨

### 1. ORM 的本質就是幫你生 SQL

```python
# 這行 ORM：
Task.query.filter_by(user_id=1).order_by(Task.end_date).all()

# 實際執行的 SQL：
# SELECT * FROM tasks WHERE user_id = 1 ORDER BY end_date ASC

# 想知道 ORM 生成了什麼 SQL，可以印出來（debug 用）
print(Task.query.filter_by(user_id=1).statement.compile(compile_kwargs={"literal_binds": True}))
```

### 2. 什麼時候 ORM 夠用

- 單表 CRUD（大多數情況）
- 簡單條件查詢（`filter_by`、`filter`）
- 透過 relationship 存取關聯資料

### 3. 什麼時候需要原生 SQL

> ⏭️ **之後再說** — 目前開發用 ORM 就夠了，先跳過。

- **複雜 JOIN + 聚合**：ORM 語法會變很醜，不如直接寫 SQL
- **效能優化**：ORM 有 N+1 查詢問題（下一節說明）
- **資料庫特有語法**：如 PostgreSQL 的 `json_extract`、`UNNEST`、`WITH` 子句

### 4. N+1 問題是什麼

```python
# ❌ 有問題：1 次查 tasks，N 個 task 各查 1 次 members = 共 N+1 次查詢
tasks = Task.query.all()        # Query 1
for t in tasks:
    members = TaskUser.query.filter_by(task_id=t.task_id).all()  # Query 2, 3, 4...

# ✅ 較好：先拿所有 task_ids，一次查所有 members = 共 2 次查詢
tasks = Task.query.all()        # Query 1
task_ids = [t.task_id for t in tasks]
all_members = TaskUser.query.filter(
    TaskUser.task_id.in_(task_ids)
).all()                          # Query 2（一次取出所有成員）
# 然後在 Python 層用 dict 按 task_id 分組
```

這正是 PrAjeKt 的 `get_tasks` 做的事 — 不對每個 task 分開查 members，而是一次查完再 Python 層分組。

### 5. 在 SQLAlchemy 執行原生 SQL

> ⏭️ **之後再說** — 現在用 ORM 就夠了，先跳過。

```python
from sqlalchemy import text

# :param 是防 SQL Injection 的佔位符（不要用 f-string 拼 SQL！）
result = db.session.execute(
    text("SELECT * FROM tasks WHERE user_id = :uid AND deleted = 0 ORDER BY end_date"),
    {"uid": user_id}
).fetchall()

# fetchall() → list of Row 物件（每列像 tuple 一樣可以 row[0]，也可以 row.name）
# fetchone() → 單筆 Row 或 None
# scalar()   → 單一值（如 COUNT(*)）
```

### 6. 這個專案的演進對照

`timelines.py` 重構前後的例子：
```python
# ❌ 舊：raw SQL（危險 — SQL Injection）
user_id = request.form.get('user_id')   # 使用者輸入
sql = f"SELECT * FROM timelines WHERE user_id = {user_id}"
# 如果 user_id 是 "1 OR 1=1" → 全部資料都漏出去了

# ✅ 新：ORM（安全，可讀）
timelines = Timeline.query.filter_by(user_id=user_id, deleted=False).all()
# SQLAlchemy 自動處理參數化，注入攻擊無效
```

---

## 附錄：快速對照表

| SQL | SQLAlchemy ORM |
|-----|----------------|
| `SELECT * FROM tasks` | `Task.query.all()` |
| `SELECT * WHERE task_id = 1` | `Task.query.get(1)` |
| `SELECT * WHERE task_id = 1` | `Task.query.filter_by(task_id=1).first()` |
| `SELECT * WHERE user_id = 1` | `Task.query.filter_by(user_id=1).all()` |
| `SELECT * WHERE status != 'done'` | `Task.query.filter(Task.status != 'done').all()` |
| `SELECT * WHERE id IN (1,2,3)` | `Task.query.filter(Task.task_id.in_([1,2,3])).all()` |
| `SELECT * WHERE a=1 OR b=2` | `Task.query.filter(or_(Task.a == 1, Task.b == 2)).all()` |
| `SELECT * WHERE name LIKE '%x%'` | `Task.query.filter(Task.name.like('%x%')).all()` |
| `SELECT * ORDER BY end_date DESC` | `Task.query.order_by(Task.end_date.desc()).all()` |
| `SELECT * LIMIT 10 OFFSET 20` | `Task.query.limit(10).offset(20).all()` |
| `SELECT COUNT(*)` | `Task.query.count()` |
| `SELECT MAX(sort_order)` | `db.session.query(func.max(Subtask.sort_order)).scalar()` |
| `INSERT INTO ...` | `db.session.add(Task(...)); db.session.commit()` |
| `UPDATE ... SET name='新'` | `task.name = '新'; db.session.commit()` |
| `DELETE WHERE id = 1` | `db.session.delete(task); db.session.commit()` |
| `DELETE WHERE task_id = 1` | `TaskUser.query.filter_by(task_id=1).delete(); db.session.commit()` |

---

## 練習建議

學完後可以讓 Copilot 出以下類型的題目來練習：

**SQL 練習方向**
- 給幾張表的結構（students、courses、enrollments），寫出各種 SELECT 查詢
- LEFT JOIN vs INNER JOIN 的結果差異（搭配 NULL 資料驗證理解）
- GROUP BY + HAVING 的過濾邏輯
- 子查詢 vs JOIN 的等效改寫

**ORM 練習方向**
- 把 SQL 語句翻譯成 SQLAlchemy 語法（對照練習）
- 用 `filter` 寫帶 `or_`、`in_`、`like` 的複合條件
- 找出 N+1 查詢並用 `in_` 優化

**實作練習（直接用 PrAjeKt）**
- 修改 `backfill_task_users.py`，加上「每個任務有幾個成員」的統計輸出
- 在 `backend/` 目錄下寫 `.py` 腳本，用 `create_app()` + app_context 練習各種查詢
- 用 `flask shell` 互動式練習（直接在終端輸入 ORM 查詢，看結果）
