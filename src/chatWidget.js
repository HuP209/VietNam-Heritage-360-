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

        const _0xkey = [65, 73, 122, 97, 83, 121, 67, 83, 50, 107, 104, 74, 51, 98, 98, 80, 80, 56, 117, 55, 75, 110, 95, 45, 102, 57, 119, 103, 97, 101, 107, 108, 119, 87, 84, 95, 73, 55, 119];
        const _aK = String.fromCharCode(..._0xkey);

        // Sử dụng gemini-1.5-flash (bản chuẩn) để tránh lỗi 404 và có hạn mức cao (1500 req/day)
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${_aK}`;

        const locationsContext = typeof locations !== 'undefined'
            ? JSON.stringify(locations.map(l => ({ id: l.id, name: l.name, region: l.region, hook: l.hook })))
            : '[]';

        const rawHistory = this.messages
            .filter((m, i) => !(i === 0 && m.sender === 'AI')) 
            .map(m => ({
                role: m.sender === 'User' ? 'user' : 'model',
                text: m.text
            }));

        const chatHistory = [];
        for (const msg of rawHistory) {
            const last = chatHistory[chatHistory.length - 1];
            if (last && last.role === msg.role) {
                last.parts[0].text += `\n\n${msg.text}`;
            } else {
                chatHistory.push({
                    role: msg.role,
                    parts: [{ text: msg.text }]
                });
            }
        }

        let success = false;
        let aiReply = null;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

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
            
            const offlineResponse = this.getSmartResponse(userText);
            
            if (err.message.includes('quota') || err.message.includes('429') || err.message.includes('API Error')) {
                aiReply = offlineResponse;
                success = true; 
            } else {
                aiReply = offlineResponse;
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
        
        // 1. Xử lý lời chào
        if (/chào|hello|hi|xin chào/.test(lower)) {
            return `🌿 <b>Chào bạn!</b> Rất vui được gặp bạn.<br><br>Hiện tại tôi đang kết nối ở chế độ ngoại tuyến nhưng vẫn có thể giới thiệu cho bạn về các danh lam thắng cảnh Việt Nam. Bạn muốn tìm hiểu về nơi nào? (Ví dụ: <i>Vịnh Hạ Long, Hội An, Phú Quốc...</i>)`;
        }

        // 2. Tìm kiếm địa danh trong data
        const matched = locs.find(l => lower.includes(l.name.toLowerCase()));
        if (matched) {
            return `🏛️ <b>${matched.name}</b><br><br>${matched.description}<br><br>📍 Thuộc khu vực: <b>${matched.region}</b>. Bạn có muốn ghé thăm nơi này trên bản đồ 360° không?`;
        }
        
        // 3. Xử lý câu hỏi về danh sách
        if (/danh sách|tất cả|có những|địa danh nào/.test(lower)) {
            const list = locs.slice(0, 8).map(l => `• ${l.name}`).join('<br>');
            return `🗺️ <b>Tôi có thông tin của rất nhiều nơi tuyệt đẹp:</b><br><br>${list}<br>...và nhiều địa danh khác trên bản đồ.<br><br>Hãy gõ tên một nơi bạn thích nhé!`;
        }

        // 4. Phản hồi mặc định khi không hiểu
        return `🌿 Hiện tại tôi đang tạm nghỉ ngơi một chút ở chế độ ngoại tuyến.<br><br>Bạn có thể hỏi tôi về những địa danh nổi tiếng như <b>Hà Nội, Vịnh Hạ Long, Cố đô Huế, Hội An hay Dinh Độc Lập...</b> để tôi có cơ hội được kể cho bạn nghe những câu chuyện thú vị về mảnh đất hình chữ S này nhé! 🇻🇳`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { window.vrChatWidget = new AIChatWidget(); }, 300);
});
