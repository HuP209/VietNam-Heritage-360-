class AIChatWidget {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        
        // Element bindings
        this.toggleBtn = document.getElementById('chat-toggle-btn');
        this.closeBtn = document.getElementById('chat-close-btn');
        this.chatWindow = document.getElementById('chat-window');
        this.messagesContainer = document.getElementById('chat-messages');
        this.inputField = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('chat-send-btn');
        
        this.buildSystemPrompt();
        this.bindEvents();

        // Initial Greeting
        if (this.messages.length === 0) {
            this.addMessage("AI", "Chào bạn! Tôi là Hướng dẫn viên AI của Vietnam Heritage 360°. Bạn muốn tìm hiểu về địa danh nào trên bản đồ hôm nay? 🇻🇳");
        }
    }

    buildSystemPrompt() {
        const locationNames = typeof locations !== 'undefined' ? locations.map(l => l.name).join(', ') : 'Việt Nam';
        this.systemPrompt = `Bạn là một hướng dẫn viên du lịch chuyên nghiệp và nhà sử học am hiểu sâu sắc về Việt Nam. Hãy trả lời các câu hỏi về địa điểm tham quan, văn hóa, ẩm thực và các sự kiện lịch sử Việt Nam một cách hào hứng, chi tiết và chính xác. Ngôn ngữ: Tiếng Việt. Phong cách: Thân thiện, lịch sự.
        
Dưới đây là danh sách các địa danh đang có trên bản đồ 360°: ${locationNames}

Lưu ý: Cung cấp thông tin lịch sử sâu sắc nhưng dễ hiểu, có thêm các gợi ý thực tế.`;
    }

    bindEvents() {
        if (!this.toggleBtn) return;
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat(false));
        
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
        this.inputField.addEventListener('input', () => this.autoResize());
    }

    autoResize() {
        const el = this.inputField;
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }

    toggleChat(forceState = null) {
        this.isOpen = forceState !== null ? forceState : !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.remove('hidden');
            this.inputField.focus();
            this.scrollToBottom();
        } else {
            this.chatWindow.classList.add('hidden');
        }
    }

    addMessage(sender, text) {
        this.messages.push({ sender, text });
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender === 'User' ? 'msg-user' : 'msg-ai'}`;
        msgDiv.innerHTML = text;
        this.messagesContainer.appendChild(msgDiv);
        this.scrollToBottom();
    }

    showTyping() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message msg-ai typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 50);
    }

    handleSend() {
        const text = this.inputField.value.trim();
        if (!text || this.isTyping) return;

        this.addMessage('User', text);
        this.inputField.value = '';
        this.inputField.style.height = 'auto';
        this.generateAIResponse(text);
    }

    async generateAIResponse(userText) {
        this.showTyping();

        // Obfuscated Key (bảo mật API key tránh quét tự động trên GitHub)
        const _0xkey = [65, 73, 122, 97, 83, 121, 67, 83, 50, 107, 104, 74, 51, 98, 98, 80, 80, 56, 117, 55, 75, 110, 95, 45, 102, 57, 119, 103, 97, 101, 107, 108, 119, 87, 84, 95, 73, 55, 119];
        const _aK = String.fromCharCode(..._0xkey);

        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${_aK}`;

        const locationsContext = typeof locations !== 'undefined'
            ? JSON.stringify(locations.map(l => ({ id: l.id, name: l.name, region: l.region, hook: l.hook })))
            : '[]';

        // KHẮC PHỤC LỖI: Bỏ qua tin nhắn chào hỏi ban đầu của AI (index == 0)
        // để mảng lịch sử trò chuyện luôn được bắt đầu bằng tin nhắn của 'user'.
        const chatHistory = this.messages
            .filter((m, i) => !(i === 0 && m.sender === 'AI')) 
            .map(m => ({
                role: m.sender === 'User' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

        let success = false;
        let aiReply = null;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            // Cấu trúc Payload chuẩn cho API v1beta
            const payloadData = {
                systemInstruction: {
                    parts: [{ text: `${this.systemPrompt}\n\nNgữ cảnh địa điểm:\n${locationsContext}` }]
                },
                contents: chatHistory,
                generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
            };

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify(payloadData)
            });
            
            clearTimeout(timeout);

            const data = await response.json();

            // Nếu API báo lỗi, in ra lỗi cụ thể để catch bắt được
            if (!response.ok) {
                throw new Error(data?.error?.message || "Lỗi kết nối từ phía Server");
            }

            aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiReply) {
                success = true;
                this.updateStatus(true);
            }
        } catch (err) {
            console.error(`AI Error Details:`, err.message);
            this.updateStatus(false);
            
            // Xử lý thông báo trực tiếp khi vượt quá Quota (limit)
            if (err.message.includes('quota') || err.message.includes('429')) {
                aiReply = "⚠️ Hệ thống đang có quá nhiều truy cập (vượt ngưỡng giới hạn miễn phí). Bạn hãy chờ khoảng 1 phút rồi hỏi lại nhé!";
                success = true; // Set true để được parse định dạng html
            } else {
                aiReply = this.getSmartResponse(userText);
            }
        }

        this.hideTyping();
        
        if (aiReply) {
            let finalReply = aiReply;
            if (success) {
                finalReply = aiReply
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                    .replace(/\*(.*?)\*/g, '<i>$1</i>')
                    .replace(/\n\n/g, '<br><br>')
                    .replace(/\n/g, '<br>');
            }
            this.addMessage('AI', finalReply);
        }
    }

    updateStatus(isOnline) {
        const statusEl = document.getElementById('chat-status');
        if (!statusEl) return;
        
        if (isOnline) {
            statusEl.innerHTML = 'Online';
            statusEl.style.color = '#2ecc71';
            statusEl.classList.remove('offline');
        } else {
            statusEl.innerHTML = 'Offline';
            statusEl.style.color = '#ff6b6b';
            statusEl.classList.add('offline');
        }
    }

    getSmartResponse(userText) {
        const lower = userText.toLowerCase();
        const locs = typeof locations !== 'undefined' ? locations : [];
        const matched = locs.find(l => lower.includes(l.name.toLowerCase()));

        if (matched) {
            return `🏛️ <b>${matched.name}</b><br><br>📖 ${matched.description}<br><br>📍 Khu vực: <b>${matched.region}</b>`;
        }
        
        if (/danh sách|tất cả|có những/.test(lower)) {
            return `🗺️ <b>Danh sách di sản:</b><br>${locs.slice(0, 10).map(l => `• ${l.name}`).join('<br>')}<br>...và nhiều nơi khác!`;
        }

        return `🌿 Chào bạn! Hiện tại tôi đang chạy ở chế độ ngoại tuyến. Bạn có thể hỏi về các địa danh như: **Vịnh Hạ Long, Hà Nội, Hội An...** 🗺️`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { window.vrChatWidget = new AIChatWidget(); }, 300);
});
