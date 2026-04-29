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
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
        // Auto-resize textarea as user types
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
        this.inputField.style.height = 'auto';

        // Trigger AI
        this.generateAIResponse(text);
    }

    /**
     * Smart Offline AI - Trả lời từ dữ liệu địa danh thực
     */
    async generateAIResponse(userText) {
        this.showTyping();

        // Try Gemini API first, fall back to smart local AI
        const apiKey = 'AIzaSyCCrp1yIHYo1MG5vU0Opf9Coazr27mSI94';
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        const locationsContext = typeof locations !== 'undefined' 
            ? JSON.stringify(locations.map(l => ({ id: l.id, name: l.name, region: l.region, hook: l.hook, description: l.description }))) 
            : '[]';
        const contextAndQuestion = `Ngữ cảnh địa điểm:\n${locationsContext}\n\nCâu hỏi: ${userText}`;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: this.systemPrompt + '\n\n' + contextAndQuestion }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
                })
            });
            clearTimeout(timeout);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!aiReply) throw new Error('Empty response');

            let formattedReply = aiReply
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>');

            this.hideTyping();
            this.addMessage('AI', formattedReply);

        } catch (err) {
            // Smart Offline AI fallback
            this.hideTyping();
            this.addMessage('AI', this.getSmartResponse(userText));
        }
    }

    getSmartResponse(userText) {
        const lower = userText.toLowerCase();
        const locs = typeof locations !== 'undefined' ? locations : [];

        // Find matching location by name
        const matched = locs.find(l => lower.includes(l.name.toLowerCase().split(' ').pop()) 
            || lower.includes(l.name.toLowerCase()));

        // Greeting
        if (/^(xin chào|chào|hello|hi|hey|alo)/.test(lower)) {
            return `🌿 Chào bạn! Tôi là Hướng dẫn viên AI của <b>Vietnam Heritage 360°</b>.<br><br>Tôi có thể giúp bạn tìm hiểu về <b>${locs.length} địa danh</b> nổi bật trên bản đồ di sản:<br><br>${locs.slice(0,5).map(l => `• ${l.name}`).join('<br>')}<br>...và nhiều địa danh khác!<br><br>Bạn muốn khám phá địa danh nào? 🗺️`;
        }

        // List all locations
        if (/danh sách|tất cả|có những|địa điểm nào|bao nhiêu/.test(lower)) {
            const byRegion = { 'Miền Bắc': [], 'Miền Trung': [], 'Miền Nam': [] };
            locs.forEach(l => { if (l.region && byRegion[l.region]) byRegion[l.region].push(l.name); });
            return `🗺️ <b>Danh sách ${locs.length} địa danh trên bản đồ:</b><br><br>
                🔵 <b>Miền Bắc:</b> ${byRegion['Miền Bắc'].join(', ') || 'N/A'}<br><br>
                🟡 <b>Miền Trung:</b> ${byRegion['Miền Trung'].join(', ') || 'N/A'}<br><br>
                🟠 <b>Miền Nam:</b> ${byRegion['Miền Nam'].join(', ') || 'N/A'}<br><br>
                Nhấp vào địa danh trên bản đồ hoặc hỏi tôi để biết thêm chi tiết! ✨`;
        }

        // Matched specific location
        if (matched) {
            return `🏛️ <b>${matched.name}</b><br><br>
                💬 <i>"${matched.hook}"</i><br><br>
                📖 ${matched.description}<br><br>
                ${matched.region ? `📍 Khu vực: <b>${matched.region}</b>` : ''}<br><br>
                👆 Nhấp vào điểm trên bản đồ để <b>bắt đầu hành trình VR 360°</b> ngay!`;
        }

        // Travel tips
        if (/kinh nghiệm|tips|lưu ý|nên đi|thời điểm|mùa/.test(lower)) {
            return `🌟 <b>Kinh nghiệm du lịch di sản Việt Nam:</b><br><br>
                🗓️ <b>Thời điểm tốt nhất:</b> Tháng 10 – 4 (tránh mùa mưa miền Trung)<br>
                🎒 <b>Gợi ý hành trình:</b> Hà Nội → Ninh Bình → Huế → Hội An → TP.HCM<br>
                📸 <b>Mẹo:</b> Dùng tính năng VR 360° để "đến thăm" trước khi đặt vé!<br>
                🏛️ <b>Di sản UNESCO:</b> Vịnh Hạ Long, Hội An, Mỹ Sơn, Huế đều có trong bản đồ<br><br>
                Bạn muốn tìm hiểu địa danh nào cụ thể hơn? 🗺️`;
        }

        // Default response
        const randomLocs = locs.sort(() => 0.5 - Math.random()).slice(0, 3);
        return `🌿 Tôi chưa tìm thấy thông tin chính xác cho câu hỏi này.<br><br>
            Bạn có thể hỏi về các địa danh như:<br>
            ${randomLocs.map(l => `• <b>${l.name}</b> – ${l.hook}`).join('<br>')}<br><br>
            Hoặc hỏi: "Danh sách tất cả địa điểm", "Kinh nghiệm du lịch"... 🗺️`;
    }
}

// Khởi tạo Chat Widget sau khi load xong DOM
document.addEventListener('DOMContentLoaded', () => {
    // Đảm bảo khởi tạo sau khi data.js đã map locations
    setTimeout(() => {
        window.vrChatWidget = new AIChatWidget();
    }, 200);
});
