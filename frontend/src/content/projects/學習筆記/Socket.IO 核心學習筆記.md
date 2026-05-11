---
title: Socket.IO 核心學習筆記
date: 2026-05-11
tags: [全端, 除錯, 學習筆記]
summary: 整理「Socket.IO 核心學習筆記」主題，重點包含：- WebSocket 是持久連線，所以「誰是誰」是在連線那一刻就決定的。 握手 (Handshake)：Socket.IO 預設會先用 HTTP Long Polling 嘗試連...
status: 草稿
---

# 📖 Socket.IO 核心學習筆記



## 第一章：連線與身份識別 (Connection & Identity)
- WebSocket 是持久連線，所以「誰是誰」是在連線那一刻就決定的。
握手 (Handshake)：Socket.IO 預設會先用 HTTP Long Polling 嘗試連線，穩定後再自動升級（Upgrade）到 WebSocket 協議。
- 身份驗證 (Auth)：
  - 不要在每個事件都傳 Token。
  - 在建立連線時傳遞：io(url, { auth: { token: '...' } })。
- 房間 (Rooms)：這是 Socket.IO 最強大的功能。
  - join_room(room_name)：將某個連線歸類。
  - 應用場景：每個使用者登入後自動加入 user_{id} 房間。這樣你要推播通知時，只需 to='user_123'，不需要管他的 Socket ID 是什麼。


## 第二章：通訊模式 (Communication Patterns)
理解這三種模式，就能覆蓋 99% 的功能：
|模式|指令 (Flask-SocketIO)|應用場景|
|---|---|---|
|**單一回覆**|emit('event', data)|回應發送者「我收到你的訊息了」。|
|**定向推送**|emit('event', data, to=room_id)|私訊、個人通知。|
|**全體廣播**|emit('event', data, broadcast=True)|系統公告、線上人數更新。|

**筆記重點**：emit 是「推」，on 是「聽」。


## 第三章：穩定性與例外處理 (Stability)
這是手刻最難、但 Socket.IO 幫你做好的部分：
- 心跳機制 (Heartbeat)：內部會自動定時發送小封包，確認對方還活著。如果斷線，前端會自動嘗試重連（Reconnection）。
- 離線處理：WebSocket 斷線期間產生的訊息，不會自動補發。
  - 解決方案：前端重連成功後（監聽 reconnect 事件），主動打一次 API 抓取「斷線期間的歷史訊息」。
- CORS 跨域：因為 Vue (8080) 和 Flask (5000) 埠號不同，初始化必須設定 cors_allowed_origins="*"。




## 還未整理
📖 Socket.IO 深度實戰筆記 (Vue 3 + Flask)
第一章：初始化與跨域設定 (The Setup)
在 threading 模式下，後端初始化必須確保 cors_allowed_origins 正確，否則 Vue 請求會被擋掉。

後端 (Flask)
Python
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
# threading 模式下的基本設定
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

if __name__ == '__main__':
    # 必須使用 socketio.run 而非 app.run
    socketio.run(app, port=5000, debug=True)
代碼解釋：async_mode='threading' 明確告訴伺服器使用多執行緒處理連線，適合開發環境與小規模專案。

第二章：身份識別與房間管理 (Identity & Rooms)
這是即時通知的核心：讓每個連線都有歸屬。

後端 (事件監聽)
Python
from flask_socketio import join_room, leave_room

@socketio.on('register_user')
def handle_register(data):
    user_id = data.get('user_id')
    if user_id:
        room = f"user_{user_id}"
        join_room(room)
        print(f"User {user_id} joined room: {room}")
代碼解釋：join_room 是邏輯上的分組。當後端想推播給特定人時，只需指定 to="user_123"。

第三章：混合模式推播實作 (The Hybrid Flow)
這是你目前的重點：用 REST 存資料，用 Socket 通知。

後端 (API Controller)
Python
@app.route('/api/send_message', methods=['POST'])
def send_message():
    # 1. 正常處理 REST API 邏輯 (存入資料庫)
    msg_data = save_to_db(request.json) 
    
    # 2. 存檔成功後，即時推播給接收者
    target_room = f"user_{msg_data['receiver_id']}"
    socketio.emit('new_message', msg_data, to=target_room)
    
    return {"status": "success", "data": msg_data}
代碼解釋：這種做法保證了資料一定先進入資料庫（持久化），即使 Socket 推播失敗，使用者重新整理頁面也能看到訊息。

第四章：Vue 3 組件生命週期集成 (Frontend Integration)
利用 onMounted 建立連線，onUnmounted 清理資源。

前端 (ChatComponent.vue)
JavaScript
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

export default {
  setup() {
    const socket = ref(null);
    const messages = ref([]);

    onMounted(() => {
      // 1. 建立連線
      socket.value = io('http://localhost:5000');

      // 2. 註冊身份（讓後端把你放進房間）
      socket.value.emit('register_user', { user_id: 123 });

      // 3. 監聽新訊息事件
      socket.value.on('new_message', (data) => {
        messages.value.push(data); // 響應式更新 UI
      });
    });

    onUnmounted(() => {
      // 4. 重要：卸載時中斷連線，避免記憶體洩漏
      if (socket.value) {
        socket.value.disconnect();
      }
    });

    return { messages };
  }
}
第五章：錯誤處理與自動重連 (Error Handling)
Socket.IO 內建自動重連，但你需要在 UI 上給予反饋。

監聽內建事件：

connect_error: 連線失敗（可能是伺服器掛了）。

disconnect: 失去連線。

reconnect_attempt: 正在嘗試重新連線。

💡 額外建議擴張的章節：「全域狀態管理 (Pinia Integration)」
如果你希望在「導覽列」看到全域通知（不論在哪個頁面），把 Socket 放在單一組件就不夠了。

為什麼要學？：這樣你只需建立一次連線，切換頁面時連線不會斷開，通知也能持續接收。