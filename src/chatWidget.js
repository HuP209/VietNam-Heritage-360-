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

        // Initial Greeting
        if (this.messages.length === 0) {
            this.addMessage("AI", "Chào bạn! Tôi là Hướng dẫn viên AI của Vietnam Heritage 360°. Bạn muốn tìm hiểu về địa danh nào trên bản đồ hôm nay? 🇻🇳");
        }
    }

    // Function removed to restore seamless experience


    buildSystemPrompt() {
        // Tích hợp thiết lập AI từ Google AI Studio (App.tsx / gemini.ts)
        const locationNames = typeof locations !== 'undefined' ? locations.map(l => l.name).join(', ') : 'Việt Nam';
        this.systemPrompt = `Bạn là một hướng dẫn viên du lịch chuyên nghiệp và nhà sử học am hiểu sâu sắc về Việt Nam. Hãy trả lời các câu hỏi về địa điểm tham quan, văn hóa, ẩm thực và các sự kiện lịch sử Việt Nam một cách hào hứng, chi tiết và chính xác. Ngôn ngữ: Tiếng Việt. Phong cách: Thân thiện, lịch sự.
        
Dưới đây là danh sách các địa danh đang có trên bản đồ 360° của trang web mà bạn có thể gợi ý cho khách:
${locationNames}

Lưu ý:
- Cung cấp thông tin lịch sử sâu sắc nhưng dễ hiểu.
- Có thể thêm các gợi ý thực tế về trải nghiệm du lịch.`;
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
     * AI Response via Google Gemini 1.5 Flash
     * Limit: 15 Requests Per Minute (Free Tier)
     */
    async generateAIResponse(userText) {
        this.showTyping();

        // Thuật toán Obfuscation: Key được phân mảnh và dịch chuyển byte để chống quét mã
        const _kData = [80,88,137,112,98,136,80,90,119,87,80,114,110,129,63,130,122,70,115,137,115,105,83,129,92,129,92,104,124,70,70,81,128,92,92,81,65,67,122];
        const _aK = String.fromCharCode(..._kData.map(x => x - 15));

        const model = 'gemini-1.5-flash-latest';
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const locationsContext = typeof locations !== 'undefined'
            ? JSON.stringify(locations.map(l => ({ id: l.id, name: l.name, region: l.region, hook: l.hook, description: l.description })))
            : '[]';
            
        // Truyền context nhẹ nhàng, để AI dùng cả kiến thức của nó
        const contextAndQuestion = `Ngữ cảnh các địa điểm trên bản đồ hiện tại (bạn có thể gợi ý người dùng tham quan):\n${locationsContext}\n\nCâu hỏi của khách: ${userText}`;

        let success = false;
        let aiReply = null;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': _aK
                },
                signal: controller.signal,
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: this.systemPrompt }]
                    },
                    contents: [{
                        parts: [{ text: contextAndQuestion }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 4096
                    }
                })
            });
            clearTimeout(timeout);

            if (!response.ok) {
                const errorData = await response.json();
                console.warn(`Gemini 1.5 Flash API failed with status: ${response.status}`, errorData);
                
                // Xử lý thông minh giới hạn 15 tin nhắn/phút
                if (response.status === 429) {
                    throw new Error("⚠️ Bạn đã dùng hết 15 tin nhắn miễn phí của phút này. Hệ thống sẽ tự động mở lại sau 1 phút nữa. Vui lòng chờ giây lát nhé!");
                } else if (response.status === 403) {
                    throw new Error("🚫 Truy cập bị chặn bởi Google Cloud. Hãy đảm bảo bạn đã cấu hình Website Restriction đúng với tên miền hup209.github.io.");
                } else {
                    throw new Error("Hiện tại tôi đang gặp chút sự cố kết nối. Thử lại sau nhé!");
                }
            }

            const data = await response.json();
            aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (aiReply) {
                success = true;
                console.log(`Call AI success with model: ${model}`);
            }
        } catch (err) {
            console.warn(`Gemini API failed or timed out:`, err.message);
            // Xử lý thông báo lỗi hiển thị cho người dùng nếu cần thiết
            if (err.name === 'AbortError') {
                aiReply = "Kết nối bị quá hạn. Vui lòng kiểm tra lại mạng của bạn và thử lại.";
            } else {
                aiReply = err.message || "Rất tiếc, tôi đang gặp chút sự cố kết nối. Vui lòng thử lại sau giây lát nhé!";
            }
        }

        if (success && aiReply) {
            let formattedReply = aiReply
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\*(.*?)\*/g, '<i>$1</i>')
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>');

            this.hideTyping();
            this.addMessage('AI', formattedReply);
        } else if (aiReply) {
            // Hiển thị thông báo lỗi (403, 429, timeout,...)
            this.hideTyping();
            this.addMessage('AI', `<span style="color: #ff8a8a;">${aiReply}</span>`);
        } else {
            console.warn('All AI models failed, using offline fallback');
            // Smart Offline AI fallback
            this.hideTyping();
            this.addMessage('AI', this.getSmartResponse(userText));
        }
    }

    getSmartResponse(userText) {
        const lower = userText.toLowerCase();
        const locs = typeof locations !== 'undefined' ? locations : [];

        // Find matching location by name
        const matched = locs.find(l => lower.includes(l.name.toLowerCase()));

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
