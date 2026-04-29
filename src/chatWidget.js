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
        
        // Build Prompt System based on map data
        this.buildSystemPrompt();

        // Load Session History
        this.loadHistory();
        
        this.bindEvents();

        // Ẩn mặc định khi ở màn hình Hero ban đầu
        document.getElementById('ai-chat-widget').style.display = 'none';

        // Initial Greeting if empty
        if (this.messages.length === 0) {
            this.addMessage("AI", "Chào bạn! Tôi là Hướng dẫn viên AI của Vietnam Heritage 360°. Bạn muốn tìm hiểu về địa danh nào trên bản đồ hôm nay? 🇻🇳");
        }
    }

    buildSystemPrompt() {
        // Automatically extract locations exactly as requested
        const locationNames = typeof locations !== 'undefined' ? locations.map(l => l.name).join(', ') : 'Việt Nam';
        this.systemPrompt = `You are "Vietnam Heritage AI Guide" – a highly intelligent, natural, and insightful AI tour guide.

You are NOT a scripted bot. You must think, understand, and respond naturally like a real human tour guide.

GOAL:
Help users explore Vietnam's destinations, culture, history, and travel experiences in a vivid, engaging, and useful way.

LANGUAGE:
- Default: Vietnamese
- If user uses English → respond in English
- Use natural spoken tone, not robotic, not textbook

RESPONSE STYLE:
- Do NOT give generic or shallow answers
- Write like a real guide talking to a traveler
- Combine: Explanation, Context (history/culture), Real experience, Practical advice

STRUCTURE (flexible, not rigid):
- Start naturally (like talking, not listing)
- Then explain deeper
- Add travel tips if relevant
- End with a suggestion or follow-up idea

DEPTH REQUIREMENT:
For any location, try to include: why it matters, what makes it unique, what visitors experience, and at least 1 useful tip.

AVAILABLE LOCATIONS ON MAP (You can recommend these):
${locationNames}

BAD BEHAVIOR (AVOID):
- Bullet list only
- Too short answers
- Wikipedia-style dry explanation

PERSONALITY:
- Friendly, insightful, slightly storytelling
- Like a local guide who knows hidden things
- Uses light emojis (🌿🏯🌊) but not too many. Always include at least one cultural insight and one practical travel tip in your answer.`;
    }

    bindEvents() {
        if (!this.toggleBtn) return;
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat(false));
        
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
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

    loadHistory() {
        // Đã tắt tính năng lưu lịch sử theo yêu cầu, mỗi lần vào web sẽ reset mới hoàn toàn
    }

    saveHistory() {
        // Đã tắt tính năng lưu lịch sử
    }

    addMessage(sender, text) {
        this.messages.push({ sender, text });
        this.renderMessage(sender, text, true);
        this.saveHistory();
    }

    renderMessage(sender, text, animate = true) {
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
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        this.isTyping = false;
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 50);
    }

    handleSend() {
        const text = this.inputField.value.trim();
        if (!text || this.isTyping) return;

        // User message
        this.addMessage('User', text);
        this.inputField.value = '';

        // Trigger AI
        this.generateAIResponse(text);
    }

    /**
     * Tích hợp API thật của Gemini
     */
    async generateAIResponse(userText) {
        this.showTyping();
        
        // Sử dụng API Key người dùng cung cấp
        const apiKey = 'AIzaSyCjOGTCVpRcxldbPdxC3wYXPh5c0_-H3FE';

        // Lấy dữ liệu dạng chuỗi của tất cả địa danh đưa vào Prompt
        const locationsContext = typeof locations !== 'undefined' ? JSON.stringify(locations) : 'Không có dữ liệu';
        const contextAndQuestion = `Lưu ý ngữ cảnh JSON các địa điểm của ứng dụng (để đối chiếu thông tin và hướng dẫn):\n${locationsContext}\n\nCâu hỏi của người dùng:\n${userText}`;

        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: this.systemPrompt }]
                    },
                    contents: [{ role: "user", parts: [{ text: contextAndQuestion }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800,
                    }
                })
            });

            if (!response.ok) {
                throw new Error("Lỗi API hoặc Key không hợp lệ");
            }
            
            const data = await response.json();
            const aiReply = data.candidates[0].content.parts[0].text;
            
            // Format markdown (bold, lists) and line breaks to semantic html
            let formattedReply = aiReply.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
            formattedReply = formattedReply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

            this.hideTyping();
            this.addMessage('AI', formattedReply);

        } catch (err) {
            console.error(err);
            this.hideTyping();
            this.addMessage('AI', "😢 Xin lỗi, đã có lỗi kết nối với máy chủ AI. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau!");
        }
    }
}

// Khởi tạo Chat Widget sau khi load xong DOM
document.addEventListener('DOMContentLoaded', () => {
    // Đảm bảo khởi tạo sau khi data.js đã map locations
    setTimeout(() => {
        window.vrChatWidget = new AIChatWidget();
    }, 200);
});
