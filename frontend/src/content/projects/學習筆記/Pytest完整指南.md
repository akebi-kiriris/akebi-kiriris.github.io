---
title: Pytest完整指南
date: 2026-03-29
tags: [部署, 後端, 除錯, 工程流程]
summary: 整理「Pytest完整指南」主題，重點包含：**本專案使用 pytest 進行後端單元測試。本文件涵蓋 pytest 基礎、fixtures、斷言、例外處理、以及在 Learnlink 專案中的實際應用。** 1. [pyt...
status: 草稿
---

# Pytest 完整示南

**本專案使用 pytest 進行後端單元測試。本文件涵蓋 pytest 基礎、fixtures、斷言、例外處理、以及在 Learnlink 專案中的實際應用。**

---

## 目錄

### Part A. 核心概念
1. [pytest 是什麼？](#pytest-是什麼)
2. [為什麼用 pytest？](#為什麼用-pytest)
3. [基本測試結構](#基本測試結構)
4. [測試命令與發現機制](#測試命令與發現機制)

### Part B. 關鍵特性
5. [Fixtures 系統](#fixtures-系統)
6. [Assertions 與測試驗證](#assertions-與測試驗證)
7. [例外處理：pytest.raises()](#例外處理pytestaises)
8. [Conftest.py 的角色](#conftestpy-的角色)

### Part C. 實務應用
9. [Learnlink 專案的測試結構](#learnlink-專案的測試結構)
10. [模型層測試解析](#模型層測試解析)
11. [Blueprint 層測試](#blueprint-層測試)
12. [Service 層測試](#service-層測試)

### Part D. 最佳實踐與進階
13. [測試最佳實踐](#測試最佳實踐)
14. [常見問題與除錯](#常見問題與除錯)
15. [完整測試執行指南](#完整測試執行指南)

---

## Part A. 核心概念

### pytest 是什麼？

**pytest** 是 Python 生態中最流行的測試框架。它允許你用簡潔的 Python 代碼編寫、組織和執行單元測試。

```python
def test_addition():
    assert 1 + 1 == 2  # 使用 assert 陳述來驗證結果
```

就這麼簡單。

#### 與其他框架的比較

| 框架 | 語法 | 複雜度 | 使用度 |
|-----|------|--------|--------|
| **pytest** | `assert` | 低 | 最高 ⭐⭐⭐⭐⭐ |
| unittest | `self.assertEqual()` | 中 | 中 |
| nose | 類似 pytest | 中 | 較低 |

### 為什麼用 pytest？

1. **簡潔** —— 用原生 `assert` 而不是冗長的 assertion 方法
2. **自動發現** —— 自動找到並執行所有 `test_*.py` 檔案和 `test_*()` 函數
3. **Fixtures** —— 強大的依賴注入系統，便於測試設置和清理
4. **詳细報告** —— 失敗時提供清晰的診斷訊息
5. **外掛豐富** —— pytest-cov（覆蓋率）、pytest-flask、pytest-mock 等等

### 基本測試結構

```
project/
├── backend/
│   ├── app.py
│   ├── models/
│   │   ├── user.py
│   │   └── task.py
│   ├── blueprints/
│   │   └── auth.py
│   ├── services/
│   │   └── auth_service.py
│   └── tests/               ← 測試目錄
│       ├── conftest.py      ← pytest 設定檔
│       ├── models/
│       │   └── test_models.py
│       ├── blueprints/
│       │   └── test_auth.py
│       └── services/
│           └── test_auth_service.py
```

#### 檔案命名慣例

- **測試檔案**：`test_*.py` 或 `*_test.py`
- **測試函數**：`test_*` 開頭
- **測試類別**：`Test*` 開頭（可選）

```python
# ✅ 會被發現
def test_user_creation():
    pass

class TestUserModel:
    def test_user_email_unique(self):
        pass

# ❌ 不會被發現
def user_creation():
    pass

def verify_user():
    pass
```

### 測試命令與發現機制

#### 基本命令

```bash
# 執行所有測試
pytest

# 執行特定目錄
pytest tests/models/

# 執行特定檔案
pytest tests/models/test_models.py

# 執行特定測試函數
pytest tests/models/test_models.py::test_user_email_must_be_unique

# 執行包含 "auth" 名稱的所有測試
pytest -k auth

# 顯示詳細輸出（-v 或 --verbose）
pytest -v

# 只顯示摘要（-q 或 --quiet）
pytest -q

# 顯示測試覆蓋率
pytest --cov=backend tests/
```

#### 執行流程

```
$ pytest tests/models/test_models.py
                       ↓
        pytest 掃描檔案找 test_ 函數
                       ↓
        載入 conftest.py（全域 fixtures）
                       ↓
            對每個 test_ 函數：
      1. 準備 fixtures（if 需要）
      2. 執行測試
      3. 清理 fixtures
                       ↓
            報告結果
      ✓ 9 passed, 49 warnings in 0.21s
```

---

## Part B. 關鍵特性

### Fixtures 系統

Fixtures 是 pytest 最強大的特性。它是一種依賴注入機制，讓你能夠：
- 準備測試環境
- 提供測試資料
- 執行測試後的清理

#### 基本 Fixture 示例

```python
import pytest

@pytest.fixture()
def sample_user():
    """提供一個測試用的使用者物件"""
    user = {
        "id": 1,
        "name": "Test User",
        "email": "test@example.com"
    }
    return user

def test_user_has_email(sample_user):
    # sample_user 被自動注入
    assert sample_user["email"] == "test@example.com"

def test_user_has_name(sample_user):
    assert sample_user["name"] == "Test User"
```

**注意**：`test_user_has_email(sample_user)` 函數的參數 `sample_user` 就是 fixture。pytest 自動將其值傳入。

#### Fixture 的生命周期：Setup 與 Teardown

```python
@pytest.fixture()
def app():
    # ========== SETUP ==========
    print("準備測試環境")
    app = create_app()
    
    yield app  ← 執行測試，然後返回這裡
    
    # ========== TEARDOWN ==========
    print("清理測試環境")
    app.teardown()
```

**流程**：
1. Setup（yield 之前）—— 建立資料庫連接、初始化 app
2. Test execution（yield 時）—— 執行測試函數
3. Teardown（yield 之後）—— 刪除資料、關閉連接

#### Learnlink 中的 app Fixture

```python
# backend/tests/conftest.py
@pytest.fixture()
def app():
    """建立測試用 Flask 應用，使用記憶中的 SQLite"""
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    # ↑ 記憶中的資料庫：超快、不污染真實 DB、自動隔離
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()  # ← SETUP：建立所有表
        yield app        # ← 把 app 交給測試
        db.session.remove()  # ← TEARDOWN：清理
        db.drop_all()    # ← TEARDOWN：刪除表
```

**為什麼用記憶中的資料庫？**
- ✅ 速度快（沒有磁碟 I/O）
- ✅ 隔離良好（每個測試都是乾淨狀態）
- ✅ 不污染開發/生產 PostgreSQL
- ✅ 自動化清理（yield 後自動刪除）

#### Fixture 的作用域

```python
@pytest.fixture(scope="function")  # 預設：每個測試函數執行一次
def fixture_func():
    pass

@pytest.fixture(scope="module")  # 整個測試模組執行一次（效率高，但共享資料）
def fixture_module():
    pass

@pytest.fixture(scope="session")  # 整個測試工作階段（最多共享）
def fixture_session():
    pass
```

**作用域比較**

| 作用域 | 何時建立/銷毀 | 用途 |
|-------|--------|------|
| `function` | 每個測試前後 | 隔離好，保證乾淨（預設、推薦） |
| `module` | 每個 .py 檔前後 | 提高效率，但測試間共享資料 |
| `session` | 整個測試工作階段前後 | 串連多個測試，容易出現汙染 |

在 Learnlink 專案中，我們用 `function` 作用域確保隔離。

#### 參數化 Fixture（同一測試多組資料）

```python
@pytest.fixture(params=["user@gmail.com", "admin@gmail.com", "test@yahoo.com"])
def various_emails(request):
    return request.param

def test_email_validation(various_emails):
    # 這個測試會跑 3 次，每次用不同的 email
    assert "@" in various_emails
```

執行結果：
```
test_email_validation[user@gmail.com] PASSED
test_email_validation[admin@gmail.com] PASSED
test_email_validation[test@yahoo.com] PASSED
```

### Assertions 與測試驗證

**Assertion** 是測試的核心 —— 它檢查「預期情況是否為真」。

#### 基本 Assertion

```python
def test_basic_assertions():
    # 相等
    assert 1 + 1 == 2
    assert "Hello" == "Hello"
    
    # 不相等
    assert 1 != 2
    assert "a" != "b"
    
    # 真假
    assert True
    assert not False
    
    # 成員關係
    assert "a" in "abc"
    assert 1 in [1, 2, 3]
    
    # 類型檢查
    assert isinstance(42, int)
    assert isinstance("hello", str)
```

#### 帶自訂訊息的 Assertion

```python
def test_with_message():
    user_count = 0
    assert user_count > 0, f"期望至少 1 個使用者，但實際有 {user_count} 個"
    # 失敗時輸出：
    # AssertionError: 期望至少 1 個使用者，但實際有 0 個
```

#### 物件與複雜資料的比較

```python
def test_dict_assertion():
    user = {"name": "John", "age": 30}
    
    # 整體比較
    assert user == {"name": "John", "age": 30}
    
    # 個別欄位
    assert user["name"] == "John"
    assert user["age"] == 30
    
    # 鍵值存在
    assert "name" in user
    assert "email" not in user

def test_list_assertion():
    tasks = [
        {"id": 1, "name": "Task 1"},
        {"id": 2, "name": "Task 2"}
    ]
    
    assert len(tasks) == 2
    assert tasks[0]["name"] == "Task 1"
    assert any(t["id"] == 2 for t in tasks)
```

#### Pytest 的智能診斷

```python
def test_smart_diagnosis():
    expected = [1, 2, 3]
    actual = [1, 2, 4]
    
    assert expected == actual
    
# 失敗輸出（pytest 會顯示差異）：
# AssertionError: assert [1, 2, 3] == [1, 2, 4]
#   Full diff:
#     - [1, 2, 4]
#     + [1, 2, 3]
#     ?       ^^  ← pytest 標出不同的部分
```

這是 pytest 相比其他框架的優勢之一 —— 詳細的診斷訊息。

### 例外處理：pytest.raises()

當你想測試「這個操作應該拋出錯誤」時，用 `pytest.raises()`。

#### 基本用法

```python
import pytest
from sqlalchemy.exc import IntegrityError

def test_user_requires_name(app):
    """驗證：建立沒有名字的使用者會失敗"""
    user = User(
        email="missing@example.com",
        password="hashed",
        # ❌ 缺少 name
    )
    db.session.add(user)
    
    with pytest.raises(IntegrityError):
        # 期望這裡拋出 IntegrityError
        db.session.commit()
    
    db.session.rollback()
```

**流程**：
1. 執行可能失敗的操作
2. `pytest.raises()` 捕捉預期的例外
3. 如果拋出預期的例外 → 測試通過 ✓
4. 如果沒有拋出例外 → 測試失敗 ✗

#### 檢查例外訊息

```python
def test_exception_message():
    with pytest.raises(ValueError, match="invalid value"):
        # match 檢查例外訊息是否包含此字串
        raise ValueError("The input has invalid value")
    
    # ✓ 測試通過（訊息包含 "invalid value"）
```

#### 多個可能的例外

```python
from sqlalchemy.exc import IntegrityError, DatabaseError

def test_user_email_unique(app):
    _create_user("unique@example.com")
    
    duplicate = User(
        name="Another",
        email="unique@example.com",
        password="hashed"
    )
    db.session.add(duplicate)
    
    with pytest.raises((IntegrityError, DatabaseError)):
        # 允許多個例外類型
        db.session.commit()
```

### Conftest.py 的角色

**conftest.py** 是 pytest 的「全域設定檔」。所有同目錄及下層目錄的測試都能使用它裡面的 fixtures。

#### Learnlink 的 conftest.py 結構

```python
# backend/tests/conftest.py
import pytest
from flask import Flask
from models import db

@pytest.fixture()
def app():
    """測試用 Flask 應用"""
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

# 未來可以加入：
# @pytest.fixture()
# def client(app):
#     """API 客戶端"""
#     return app.test_client()
#
# @pytest.fixture()
# def sample_user(app):
#     """預建範例使用者"""
#     user = User(...)
#     db.session.add(user)
#     db.session.commit()
#     return user
```

#### 多層 conftest.py

```
backend/tests/
├── conftest.py           ← 全域 fixtures（app）
├── models/
│   ├── conftest.py       ← 模型層 fixtures（可選）
│   └── test_models.py
├── blueprints/
│   ├── conftest.py       ← Blueprint 層 fixtures（client、token）
│   └── test_auth.py
└── services/
    ├── conftest.py       ← Service 層 fixtures
    └── test_auth_service.py
```

每層可以定義自己的 fixtures，下層會繼承上層的。

---

## Part C. 實務應用

### Learnlink 專案的測試結構

Learnlink 使用分層測試架構，按 MVC/分層模式組織：

```
backend/tests/
├── conftest.py                    ← 全域 Flask app fixture
│
├── models/
│   ├── conftest.py                ← 模型層設定（暫無特殊 fixtures）
│   └── test_models.py             ← 測試 ORM 模型
│       ├── User 約束測試
│       ├── Task 預設值測試
│       ├── 唯一性約束測試
│       ├── 級聯刪除測試
│       └── 序列化測試
│
├── blueprints/                   ← API 端點測試（未來進展）
│   ├── conftest.py                ← API client fixture、認證 token
│   ├── test_auth.py               ← POST /auth/login, POST /auth/register
│   ├── test_tasks.py              ← GET/POST /api/tasks
│   ├── test_timelines.py          ← GET/POST /api/timelines
│   └── ...
│
└── services/                     ← 業務邏輯測試（未來進展）
    ├── conftest.py                ← Mock 資料庫、外部服務
    ├── test_auth_service.py       ← 登入、註冊、密碼驗證
    ├── test_task_service.py       ← 搜尋、篩選、通知
    └── ...
```

#### 分層測試的優勢

| 層級 | 測試對象 | 速度 | 成本 | 用途 |
|------|---------|------|------|------|
| **模型** | ORM 約束、值型別、序列化 | 超快 | 低 | 捕捉資料結構錯誤 |
| **Blueprint** | API 端點、HTTP 狀態碼、JSON 格式 | 快 | 中 | 驗證 API 契約 |
| **Service** | 商業邏輯、複雜流程、邊界案例 | 中 | 中 | 驗證核心功能 |
| **整合** | 多層協作、E2E | 慢 | 高 | 發現系統級問題 |

### 模型層測試解析

我們已實現的 9 個測試覆蓋模型約束和行為。

#### 測試 1：必填欄位

```python
def test_user_requires_name(app):
    """驗證 User.name 是必填的"""
    user = User(
        email="test@example.com",
        password="hashed"
        # ❌ 沒有 name
    )
    db.session.add(user)
    
    with pytest.raises(IntegrityError):
        db.session.commit()
    
    db.session.rollback()
```

**測試邏輯**：
1. 建立不完整的 User
2. 嘗試存入資料庫
3. 驗證資料庫拒絕（拋出 IntegrityError）

在 ORM 模型中，`name` 欄位被標記為 `nullable=False`，所以違反時會拋出例外。

#### 測試 2：唯一性約束

```python
def test_user_email_must_be_unique(app):
    """驗證 email 全局唯一"""
    _create_user("unique@example.com", username="u1")
    
    duplicate = User(
        name="Another",
        username="u2",
        email="unique@example.com",  # ❌ 重複 email
        password="hashed"
    )
    db.session.add(duplicate)
    
    with pytest.raises(IntegrityError):
        db.session.commit()
    
    db.session.rollback()
```

**資料庫約束原理**：
```python
# 模型定義
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    # ↑ unique=True 在資料庫層面建立唯一約束
```

#### 測試 3：預設值

```python
def test_task_default_values(app):
    """驗證 Task 的預設值"""
    owner = _create_user("owner@example.com", username="owner")
    
    task = Task(user_id=owner.id, name="New Task")
    # 只提供必填欄位，其他用預設值
    
    db.session.add(task)
    db.session.commit()
    
    # 驗證預設值
    assert task.completed is False       # 預設未完成
    assert task.priority == 2             # 預設中等優先級
    assert task.status == "pending"       # 預設待定
    assert task.created_at is not None    # 自動設置建立時間
    assert repr(task) == "<Task New Task>"  # __repr__ 格式
```

**模型定義**：
```python
class Task(db.Model):
    task_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)      # ← 預設
    priority = db.Column(db.Integer, default=2)           # ← 預設
    status = db.Column(db.String(50), default="pending")  # ← 預設
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # ← 預設
```

#### 測試 4：級聯刪除

```python
def test_delete_task_cascades_related_records(app):
    """驗證刪除 Task 時，所有相關記錄也被刪除"""
    owner = _create_user("owner@example.com")
    member = _create_user("member@example.com")
    
    # 建立主記錄
    task = Task(user_id=owner.id, name="Task")
    db.session.add(task)
    db.session.commit()
    
    # 建立相關記錄
    db.session.add_all([
        TaskUser(task_id=task.task_id, user_id=owner.id, role=0),
        TaskUser(task_id=task.task_id, user_id=member.id, role=1),
        TaskComment(task_id=task.task_id, user_id=owner.id, task_message="hello"),
        Subtask(task_id=task.task_id, name="subtask"),
        TaskFile(task_id=task.task_id, filename="file.bin", ...)
    ])
    db.session.commit()
    
    # 刪除主記錄
    db.session.delete(task)
    db.session.commit()
    
    # 驗證相關記錄都被刪除
    assert TaskUser.query.filter_by(task_id=task.task_id).count() == 0
    assert TaskComment.query.filter_by(task_id=task.task_id).count() == 0
    assert Subtask.query.filter_by(task_id=task.task_id).count() == 0
    assert TaskFile.query.filter_by(task_id=task.task_id).count() == 0
```

**ORM 級聯定義**：
```python
class Task(db.Model):
    task_id = db.Column(db.Integer, primary_key=True)
    
    # 定義與 TaskUser 的關係，刪除時級聯
    task_users = db.relationship('TaskUser', cascade='all, delete-orphan')
    task_comments = db.relationship('TaskComment', cascade='all, delete-orphan')
    subtasks = db.relationship('Subtask', cascade='all, delete-orphan')
    # ↑ cascade='all, delete-orphan' 表示：
    #   1. 刪除 Task 時，刪除所有相關 TaskUser
    #   2. 沒有父記錄的孤立記錄也被刪除
```

#### 測試 5：序列化格式

```python
def test_subtask_to_dict_has_iso_utc_suffix(app):
    """驗證 Subtask 序列化時，時間戳符合 ISO 8601 UTC 格式"""
    owner = _create_user("owner@example.com")
    task = Task(user_id=owner.id, name="Task")
    db.session.add(task)
    db.session.commit()
    
    subtask = Subtask(task_id=task.task_id, name="child")
    db.session.add(subtask)
    db.session.commit()
    
    # 序列化為字典（準備 JSON 回應）
    payload = subtask.to_dict()
    
    # 驗證格式
    assert payload["id"] == subtask.id
    assert payload["task_id"] == task.task_id
    assert payload["name"] == "child"
    assert payload["created_at"].endswith("Z")  # ← ISO 8601 UTC 尾綴
```

**模型的 to_dict() 方法**：
```python
class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey("task.task_id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """序列化為 JSON-ready 字典"""
        return {
            "id": self.id,
            "task_id": self.task_id,
            "name": self.name,
            "created_at": self.created_at.isoformat() + "Z"
            # ↑ 時間轉為 ISO 8601 UTC 格式：2026-03-29T12:30:45Z
        }
```

### Blueprint 層測試

**Blueprint 層** 測試 API 端點。（未來實現）

示例框架：

```python
# backend/tests/blueprints/conftest.py
import pytest
from flask import json

@pytest.fixture()
def client(app):
    """API 測試客戶端"""
    return app.test_client()

@pytest.fixture()
def auth_headers(client, app):
    """已認證的請求頭"""
    # 模擬登入獲得 JWT token
    response = client.post("/api/auth/login", json={
        "email": "user@example.com",
        "password": "password123"
    })
    token = response.json["token"]
    return {"Authorization": f"Bearer {token}"}

# backend/tests/blueprints/test_auth.py
def test_register_user(client):
    """POST /api/auth/register —— 新用戶註冊"""
    response = client.post("/api/auth/register", json={
        "name": "John",
        "email": "john@example.com",
        "username": "john123",
        "password": "password123"
    })
    
    assert response.status_code == 201  # 建立成功
    data = response.json
    assert data["id"] > 0
    assert data["email"] == "john@example.com"

def test_login_user(client):
    """POST /api/auth/login —— 用戶登入"""
    # 前置：建立使用者
    user = _create_test_user()
    
    response = client.post("/api/auth/login", json={
        "email": user.email,
        "password": "password123"
    })
    
    assert response.status_code == 200
    assert "token" in response.json
    assert response.json["user"]["id"] == user.id

def test_get_tasks_requires_auth(client):
    """GET /api/tasks —— 需要認證"""
    response = client.get("/api/tasks")
    
    assert response.status_code == 401  # 未認證
    assert "missing authorization" in response.json["error"].lower()

def test_get_tasks_with_auth(client, auth_headers):
    """GET /api/tasks —— 已認證可讀取"""
    response = client.get("/api/tasks", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json
    assert isinstance(data, list)
```

**Blueprint 測試的關鍵概念**：

| 測試對象 | 驗證項目 |
|---------|---------|
| **狀態碼** | 200 (OK)、201 (Created)、400 (Bad Request)、401 (Unauthorized)、404 (Not Found)、500 (Error) |
| **JSON 結構** | 回應是否有預期的欄位 |
| **認證** | 驗證端點是否正確檢查權限 |
| **422/400** | 驗證端點對無效輸入的處理 |

### Service 層測試

**Service 層** 測試商業邏輯。（未來實現）

示例框架：

```python
# backend/tests/services/conftest.py
import pytest
from unittest.mock import Mock, patch

@pytest.fixture()
def mock_email_service():
    """Mock 郵件服務（避免實際發送郵件）"""
    with patch("services.email_service.send_email") as mock:
        mock.return_value = True
        yield mock

@pytest.fixture()
def mock_notification_service():
    """Mock 通知服務"""
    with patch("services.notification_service.notify") as mock:
        mock.return_value = {"status": "sent"}
        yield mock

# backend/tests/services/test_auth_service.py
def test_user_registration_sends_welcome_email(app, mock_email_service):
    """驗證：新用戶註冊時，發送歡迎郵件"""
    from services.auth_service import register_user
    
    user = register_user(
        name="Alice",
        email="alice@example.com",
        username="alice",
        password="password123"
    )
    
    assert user.id > 0
    mock_email_service.assert_called_once()
    call_args = mock_email_service.call_args
    assert call_args[1]["to"] == "alice@example.com"
    assert "welcome" in call_args[1]["subject"].lower()

def test_password_strength_validation(app):
    """驗證：密碼強度檢查"""
    from services.auth_service import validate_password
    
    # 弱密碼
    assert not validate_password("123")
    assert not validate_password("abcdef")
    
    # 強密碼
    assert validate_password("SecurePass123!@#")

def test_duplicate_email_registration_fails(app):
    """驗證：重複 email 無法註冊"""
    from services.auth_service import register_user
    from sqlalchemy.exc import IntegrityError
    
    register_user(
        name="Alice",
        email="alice@example.com",
        username="alice1",
        password="password123"
    )
    
    with pytest.raises(IntegrityError):
        register_user(
            name="Alice2",
            email="alice@example.com",  # ← 重複
            username="alice2",
            password="password123"
        )

def test_task_search_with_filters(app):
    """驗證：工作搜尋與篩選"""
    from services.task_service import search_tasks
    
    owner = _create_test_user()
    
    # 建立多個工作
    task1 = Task(user_id=owner.id, name="Buy groceries", priority=1)
    task2 = Task(user_id=owner.id, name="Finish project", priority=3)
    task3 = Task(user_id=owner.id, name="Call mom", priority=2)
    
    for task in [task1, task2, task3]:
        db.session.add(task)
    db.session.commit()
    
    # 搜尋：名稱包含 "project"
    results = search_tasks(owner.id, query="project")
    assert len(results) == 1
    assert results[0].name == "Finish project"
    
    # 篩選：優先級 >= 2
    results = search_tasks(owner.id, min_priority=2)
    assert len(results) == 2
    assert all(t.priority >= 2 for t in results)
```

**Service 層測試的特點**：
- 使用 **Mock** 隔離外部依賴（郵件、API、通知）
- 測試複雜邏輯（搜尋、篩選、驗證）
- 通常較慢，但覆蓋面
更廣

---

## Part D. 最佳實踐與進階

### 測試最佳實踐

#### 1. 命名清晰

```python
# ✅ 好的命名
def test_user_email_must_be_unique():
    """清晰的功能描述"""
    pass

def test_delete_task_cascades_to_subtasks():
    pass

# ❌ 不好的命名
def test_1():
    pass

def test_user():
    pass

def verify_it_works():
    pass
```

#### 2. 一個測試驗證一件事

```python
# ✅ 好的：單一責任
def test_task_has_default_priority():
    task = Task(user_id=1, name="Task")
    assert task.priority == 2

def test_task_has_default_status():
    task = Task(user_id=1, name="Task")
    assert task.status == "pending"

# ❌ 不好的：混雜多個驗證
def test_task_defaults():
    task = Task(user_id=1, name="Task")
    assert task.priority == 2
    assert task.status == "pending"
    assert task.completed is False
    assert task.created_at is not None
    # ↑ 如果其中一個失敗，後面不會執行，難以診斷
```

#### 3. 使用 Fixtures 避免重複

```python
# ❌ 重複代碼
def test_user_email_unique_1():
    user = User(name="U1", email="test@ex.com", password="hashed")
    db.session.add(user)
    db.session.commit()
    ...

def test_user_email_unique_2():
    user = User(name="U1", email="test@ex.com", password="hashed")
    db.session.add(user)
    db.session.commit()
    ...

# ✅ 使用 Fixture
@pytest.fixture()
def sample_user(app):
    user = User(name="U1", email="test@ex.com", password="hashed")
    db.session.add(user)
    db.session.commit()
    return user

def test_user_email_unique_1(sample_user):
    ...

def test_user_email_unique_2(sample_user):
    ...
```

#### 4. 測試異常情況（邊界案例）

```python
# ✅ 測試正常情況和異常情況
def test_user_creation_valid():
    """正常情況：有效的使用者可以建立"""
    user = User(name="John", email="john@ex.com", password="hashed")
    db.session.add(user)
    db.session.commit()
    assert user.id > 0

def test_user_creation_missing_email():
    """異常情況：缺少 email 應該失敗"""
    user = User(name="John", password="hashed")
    db.session.add(user)
    with pytest.raises(IntegrityError):
        db.session.commit()

def test_user_creation_duplicate_email():
    """邊界情況：重複 email 應該失敗"""
    _create_user("john@ex.com")
    duplicate = User(name="Another", email="john@ex.com", password="hashed")
    db.session.add(duplicate)
    with pytest.raises(IntegrityError):
        db.session.commit()
```

#### 5. 避免測試間的相互依賴

```python
# ❌ 不好的：測試 B 依賴於測試 A
def test_a_create_user():
    global user_id
    user = User(...)
    db.session.add(user)
    db.session.commit()
    user_id = user.id

def test_b_use_user():
    # ❌ 依賴於測試 A 的執行順序和結果
    user = User.query.get(user_id)
    assert user is not None

# ✅ 好的：每個測試獨立
def test_create_user(app):
    user = User(...)
    db.session.add(user)
    db.session.commit()
    assert user.id > 0

def test_find_user(app):
    user = _create_test_user()  # 自己建立
    found = User.query.get(user.id)
    assert found is not None
```

#### 6. 文件化測試意圖

```python
# ✅ 好的：清晰的文件
def test_delete_task_cascades_related_records(app):
    """
    驗證刪除 Task 時的級聯行為。
    
    當刪除一個 Task 時，應該自動刪除：
    - 所有 TaskUser（任務成員）
    - 所有 TaskComment（任務評論）
    - 所有 Subtask（子工作）
    - 所有 TaskFile（任務附件）
    
    This prevents orphaned records in the database.
    """
    ...
```

### 常見問題與除錯

#### Q1：測試失敗，但不知道原因

```bash
# 使用 -v 顯示詳細輸出
pytest tests/models/ -v

# 標記特定測試為「失敗停止」
pytest tests/models/ -x  # 第一個失敗後停止

# 顯示 print 輸出
pytest tests/models/ -s

# 結合所有：詳細 + 停止 + print
pytest tests/models/ -vxs
```

#### Q2：資料庫在測試之間沒有被清理

**原因**：fixtures 的作用域或 teardown 邏輯問題。

```python
# ✅ 確保 conftest.py 使用 function 作用域
@pytest.fixture(scope="function")  # ← 重要
def app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()  # ← 確保 teardown 被執行
```

#### Q3：测试很慢

**原因**：
1. 使用真實資料庫（改用記憶中的 SQLite ✓）
2. fixtures 作用域設置不當（改用 `session` 或 `module`，但注意隔離）
3. 每個測試建立重型物件（改用 Mock、Fixture）

```python
# ✅ 優化：使用模組級作用域（注意隔離）
@pytest.fixture(scope="module")
def app():
    # 建立一次，多個測試共享
    ...

# ✅ 優化：Mock 外部服務
@pytest.fixture()
def mock_external_api():
    with patch("requests.get") as mock:
        mock.return_value.json.return_value = {"status": "ok"}
        yield mock
```

#### Q4：ImportError 或模組找不到

**原因**：pytest 的工作目錄可能不對。

```bash
# ✅ 確保在專案根目錄執行
cd /path/to/Learnlink
pytest backend/tests/

# 或指定 Python 路徑
pytest --pythonpath=backend backend/tests/

# 或在 conftest.py 中加入
import sys
sys.path.insert(0, '/path/to/Learnlink/backend')
```

#### Q5：無法刪除資料庫行（級聯刪除沒有工作）

**原因**：ORM 模型的 `cascade` 選項沒有設置。

```python
# ❌ 沒有級聯
class Task(db.Model):
    subtasks = db.relationship('Subtask')

# ✅ 有級聯
class Task(db.Model):
    subtasks = db.relationship('Subtask', cascade='all, delete-orphan')
    # ↑ delete-orphan：自動刪除沒有父記錄的孤立兒童
```

### 完整測試執行指南

#### 步驟 1：配置環境

```bash
# 進入專案目錄
cd /path/to/Learnlink

# 確認 Python 虛擬環境已啟動
# Windows
.\backend\venv\Scripts\activate

# macOS/Linux
source backend/venv/bin/activate

# 安裝測試依賴（如果未安裝）
pip install pytest pytest-flask pytest-cov
```

#### 步驟 2：執行測試

```bash
# 全部測試
pytest backend/tests/ -v

# 模型層測試
pytest backend/tests/models/ -v

# 特定測試
pytest backend/tests/models/test_models.py::test_user_email_must_be_unique -v

# 生成覆蓋率報告
pytest backend/tests/ --cov=backend --cov-report=html
# 報告在 htmlcov/index.html
```

#### 步驟 3：查看報告

```bash
# 摘要
pytest backend/tests/ -q

# 詳細
pytest backend/tests/ -v

# 失敗細節
pytest backend/tests/ -vvv

# 顯示最慢的測試
pytest backend/tests/ --durations=10
```

#### 步驟 4：持續整合（CI）

```yaml
# .github/workflows/pytest.yml（GitHub Actions 示例）
name: backend-tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: 3.11
      - run: pip install -r backend/requirements.txt pytest pytest-flask pytest-cov
      - run: pytest backend/tests/ --cov=backend
      - uses: codecov/codecov-action@v3
```

---

## 總結

| 概念 | 使用場景 |
|------|---------|
| **Fixtures** | 準備/清理測試環境，提供測試資料 |
| **Assert** | 驗證預期結果 |
| **pytest.raises()** | 驗證預期例外 |
| **Mock** | 隔離外部依賴 |
| **Conftest.py** | 定義全域 fixtures |
| **分層測試** | 模型 → Blueprint → Service 層層遞進 |

Learnlink 的測試框架已經在模型層就位。下一步：
1. 擴展 Blueprint 層測試（API 端點）
2. 實現 Service 層測試（商業邏輯）
3. 建立 CI/CD 集成（自動執行測試）

---

**記住**：好的測試是好代碼的基礎。從小開始，逐步擴展。
