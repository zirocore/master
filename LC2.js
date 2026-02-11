// --- chat-widget.js ---
(function() {
    // KONFIGURASI URL (URL ANDA SUDAH BENAR)
    const GAS_URL = "https://script.google.com/macros/s/AKfycbynAxBBVvV0O7T0kSWnr2m1BwhUmWPKsEpEgGi_owXk0HaV7CBL3xwBx__-A4RxBoXz/exec"; 
    const ADMIN_ID = 'ziro_admin_support';

    // CSS INJECTED
    const css = `
        #ziro-chat-widget-container * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; }
        #ziro-chat-fab {
            position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px;
            background: #00a884; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999;
            transition: transform 0.3s;
        }
        #ziro-chat-fab:hover { transform: scale(1.1); }
        #ziro-chat-widget {
            position: fixed; bottom: 90px; right: 20px; width: 350px; height: 500px;
            background: white; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            display: flex; flex-direction: column; overflow: hidden; z-index: 9999;
            transform: translateY(20px); opacity: 0; visibility: hidden; transition: all 0.3s ease;
        }
        #ziro-chat-widget.open { transform: translateY(0); opacity: 1; visibility: visible; }
        .zcw-header { background: #008069; color: white; padding: 15px; display: flex; align-items: center; justify-content: space-between; }
        .zcw-close { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
        .zcw-body { flex: 1; background-color: #efe7dd; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); }
        .zcw-footer { padding: 10px; background: #f0f2f5; display: flex; align-items: center; gap: 10px; }
        .zcw-input { flex: 1; padding: 10px 15px; border-radius: 20px; border: none; outline: none; background: white; font-size: 14px; }
        .zcw-send-btn { background: #00a884; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .zcw-message { max-width: 80%; padding: 8px 12px; border-radius: 8px; font-size: 14px; line-height: 18px; word-wrap: break-word; }
        .zcw-msg-in { align-self: flex-start; background: white; border-top-left-radius: 0; }
        .zcw-msg-out { align-self: flex-end; background: #d9fdd3; border-top-right-radius: 0; }
        .zcw-led { width: 8px; height: 8px; border-radius: 50%; background: #ccc; display: inline-block; margin-right: 5px; box-shadow: 0 0 5px rgba(0,0,0,0.2); }
        .zcw-led.green { background: #2ecc71; box-shadow: 0 0 8px #2ecc71; }
        .zcw-led.orange { background: #ff9f43; animation: blink 1s infinite; }
        .zcw-led.red { background: #ff4d4d; }
        @keyframes blink { 50% { opacity: 0.5; } }
        footer#zirocore-footer {text-align: center;padding: 5px;font-size: 10px;}
        @media (max-width: 480px) {
            #ziro-chat-widget { width: 90%; right: 5%; bottom: 80px; height: 70vh; }
            #ziro-chat-fab { bottom: 20px; right: 20px; }
			footer#zirocore-footer {text-align: center;padding: 5px;font-size: 7px;}
        }
    `;

    // Inject CSS
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // Struktur HTML Widget
    const widgetHTML = `
        <div id="ziro-chat-fab">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            <div id="ziro-badge" style="position:absolute; top:0; right:0; background:red; color:white; font-size:10px; width:18px; height:18px; border-radius:50%; display:none; align-items:center; justify-content:center; border:2px solid white;">0</div>
        </div>
        
        <div id="ziro-chat-widget">
            <div class="zcw-header">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:35px; height:35px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#008069; font-weight:bold;">CS</div>
                    <div>
                        <div style="font-size:14px; font-weight:600;">Customer Service</div>
                        <div style="font-size:11px; opacity:0.8;"><span id="ziro-led-dot" class="zcw-led"></span><span id="ziro-status-text">Offline</span></div>
                    </div>
                </div>
                <button class="zcw-close" onclick="toggleZiroChat()">&times;</button>
            </div>
            <div class="zcw-body" id="ziro-messages"></div>
            <div class="zcw-footer">
                <input type="text" id="ziro-input" class="zcw-input" placeholder="Tulis pesan..." onkeypress="handleZiroKey(event)">
                <button class="zcw-send-btn" onclick="sendZiroMessage()">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>
		<footer id="zirocore-footer">
        <p>Power By © <a href="https://zirocore.blogspot.com" id="ziro-dev" target="_blank">Ziro Core Inc.</a></p>
       </footer>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = widgetHTML;
    document.body.appendChild(div);

    // --- LOGIC JAVASCRIPT ---
    let CURRENT_USER_ID = localStorage.getItem('ziro_chat_id');
    if (!CURRENT_USER_ID) {
        CURRENT_USER_ID = 'web_user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ziro_chat_id', CURRENT_USER_ID);
    }

    let state = { messages: [], isOpen: false };

    // API Functions
    async function fetchAPI(data) {
        try {
            const res = await fetch(GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // Penting untuk GAS
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) {
            updateLED('red', 'Error');
            console.error(e);
        }
    }

    async function getChats() {
        try {
            updateLED('orange', 'Connecting...');
            const res = await fetch(GAS_URL);
            const data = await res.json();
            updateLED('green', 'Online');
            return data;
        } catch (e) {
            updateLED('red', 'Offline');
            return null;
        }
    }

    function updateLED(color, text) {
        const led = document.getElementById('ziro-led-dot');
        const txt = document.getElementById('ziro-status-text');
        led.className = 'zcw-led ' + color;
        if(txt) txt.innerText = text;
    }

    // Init
    async function initZiroChat() {
        const db = await getChats();
        if (!db || !db[CURRENT_USER_ID]) {
            if(db) {
                // PERBAIKAN: Mengirim URL asli, bukan string teks
                await fetchAPI({
                    websiteUrl: window.location.href, 
                    action: 'create',
                    sessionId: CURRENT_USER_ID,
                    userName: 'Web User ' + CURRENT_USER_ID.substr(-4),
                    avatar: 'https://picsum.photos/50/50'
                });
            }
        }
        setInterval(syncZiroData, 3000);
        renderMessages();
    }

    async function syncZiroData() {
        const db = await getChats();
        if(!db || !db[CURRENT_USER_ID]) return;

        const mySession = db[CURRENT_USER_ID];
        const serverCount = mySession.messages ? mySession.messages.length : 0;

        if (state.messages.length !== serverCount) {
            state.messages = mySession.messages || [];
            renderMessages();
            const lastMsg = state.messages[state.messages.length - 1];
            if (lastMsg && lastMsg.sender === ADMIN_ID && !state.isOpen) {
                updateBadge(1);
            }
        }
    }

    function renderMessages() {
        const container = document.getElementById('ziro-messages');
        container.innerHTML = '';
        state.messages.forEach(msg => {
            const isMe = msg.sender === CURRENT_USER_ID;
            const div = document.createElement('div');
            div.className = `zcw-message ${isMe ? 'zcw-msg-out' : 'zcw-msg-in'}`;
            div.innerText = msg.text;
            container.appendChild(div);
        });
        if(state.isOpen) container.scrollTop = container.scrollHeight;
    }

    async function sendZiroMessage() {
        const input = document.getElementById('ziro-input');
        const text = input.value.trim();
        if(!text) return;

        state.messages.push({ sender: CURRENT_USER_ID, text: text, time: 'Now' });
        renderMessages();
        input.value = '';

        await fetchAPI({
            action: 'sendMessage',
            sessionId: CURRENT_USER_ID,
            sender: CURRENT_USER_ID,
            text: text
        });
    }

    function toggleZiroChat() {
        state.isOpen = !state.isOpen;
        const widget = document.getElementById('ziro-chat-widget');
        const badge = document.getElementById('ziro-badge');
        if (state.isOpen) {
            widget.classList.add('open');
            badge.style.display = 'none';
            badge.innerText = '0';
            document.getElementById('ziro-messages').scrollTop = document.getElementById('ziro-messages').scrollHeight;
        } else {
            widget.classList.remove('open');
        }
    }

    function updateBadge(count) {
        const badge = document.getElementById('ziro-badge');
        badge.style.display = 'flex';
        badge.innerText = count;
    }

    function handleZiroKey(e) {
        if(e.key === 'Enter') sendZiroMessage();
    }

    // --- PERBAIKAN UTAMA: EKSPOR FUNGSI KE WINDOW ---
    // Agar onclick="..." di HTML string bisa menemukan fungsi ini
    window.toggleZiroChat = toggleZiroChat;
    window.sendZiroMessage = sendZiroMessage;
    window.handleZiroKey = handleZiroKey;

    // Jalankan
    document.getElementById('ziro-chat-fab').onclick = toggleZiroChat;
    initZiroChat();

})();
