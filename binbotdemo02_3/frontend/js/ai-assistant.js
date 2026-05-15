(function initAIAssistant() {
  if (document.getElementById('ai-chat-window')) return; 

  // HTML Structure - Settings and Key input removed
  const aiWidgetHtml = `
    <button id="ai-chat-toggle" aria-label="Toggle AI Assistant" class="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 hover:-translate-y-1 transition-all duration-300 ring-1 ring-white/10 group">
      <div class="relative w-full h-full flex items-center justify-center">
        <i data-lucide="bot" class="w-6 h-6 text-black transition-transform duration-300 group-hover:rotate-6"></i>
        <span class="absolute top-0 right-0 -mt-1 -mr-1 flex h-3.5 w-3.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.8)] border-2 border-black"></span>
        </span>
      </div>
    </button>

    <div id="ai-chat-window" class="fixed z-[9999] bg-black/95 sm:bg-black/80 backdrop-blur-2xl border-0 sm:border sm:border-white/10 sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-300 transform scale-95 opacity-0 origin-bottom-right hidden
      inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[380px] sm:h-[550px] sm:max-h-[calc(100vh-160px)]">
      
      <div class="relative px-4 sm:px-5 py-3.5 sm:py-4 border-b border-white/10 bg-[#1A1A1A]/80 flex items-center justify-between shrink-0 safe-area-top">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent blur-xl pointer-events-none"></div>
        <div class="relative flex items-center gap-3 z-10">
          <div class="relative h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg">
            <i data-lucide="sparkles" class="w-4 h-4 sm:w-5 sm:h-5 text-black"></i>
          </div>
          <div>
            <h3 class="text-white font-bold text-sm tracking-wide flex items-center gap-2">Wasti AI</h3>
            <p class="text-[10px] text-[#86868B] uppercase tracking-wider font-bold flex items-center gap-1.5 mt-0.5">
              <span class="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.6)] animate-pulse"></span> Active
            </p>
          </div>
        </div>
        <div class="relative z-10 flex items-center gap-2">
          <button id="ai-chat-fullscreen" class="text-[#86868B] hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10 hidden sm:block">
            <i data-lucide="maximize" id="fullscreen-icon" class="w-5 h-5"></i>
          </button>
          <button id="ai-chat-close" class="text-[#86868B] hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        
      </div>

      <div id="ai-chat-messages" class="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col gap-4 scroll-smooth bg-transparent scrollbar-hide overscroll-contain">
        <div class="flex gap-3 items-end max-w-[90%] fade-in-up">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-white/20 mt-auto shadow-md relative pb-[1px]">
             <i data-lucide="bot" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black"></i>
          </div>
          <div class="bg-[#1A1A1A]/90 text-white text-[13px] sm:text-[13.5px] leading-relaxed py-3 px-4 rounded-2xl rounded-bl-sm border border-white/10 shadow-md transform-gpu">
            Hi! I'm <strong>Wasti AI</strong>. I can answer <em>any</em> questions you have. 🤖<br><br>You can ask me anything—whether it's about recycling, or anything else! How can I assist you today?
          </div>
        </div>
      </div>

      <div class="p-3 border-t border-white/10 bg-black/80 backdrop-blur-md shrink-0 safe-area-bottom">
        <form id="ai-chat-form" class="relative flex items-center gap-2">
          <input type="text" id="ai-chat-input" placeholder="Ask me anything..." class="flex-1 bg-[#1A1A1A] text-white text-sm placeholder-[#86868B] font-medium rounded-xl pl-4 pr-4 py-3.5 border border-white/10 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all shadow-inner" autocomplete="off" enterkeyhint="send" />
          <button type="submit" class="bg-white text-black p-3 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 shrink-0 shadow-md">
            <i data-lucide="send" class="w-4 h-4"></i>
          </button>
        </form>
      </div>
    </div>

    <style>
      #ai-chat-messages::-webkit-scrollbar { width: 3px; }
      #ai-chat-messages::-webkit-scrollbar-track { background: transparent; }
      #ai-chat-messages::-webkit-scrollbar-thumb { background: #333333; border-radius: 4px; }
      #ai-chat-messages::-webkit-scrollbar-thumb:hover { background: #555555; }
      @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
      .safe-area-top { padding-top: max(0.875rem, env(safe-area-inset-top)); }
      .safe-area-bottom { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }
      @media (max-width: 639px) {
        #ai-chat-window:not(.hidden) ~ #ai-chat-toggle, body.ai-chat-open #ai-chat-toggle { display: none !important; }
        body.ai-chat-open { overflow: hidden !important; position: fixed; width: 100%; }
      }
      /* Bulletproof Fullscreen Class */
      .wasti-fullscreen {
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
        border: none !important;
        margin: 0 !important;
        transform: scale(1) translate(0px, 0px) !important;
        inset: 0 !important;
        z-index: 999999 !important;
      }
    </style>
  `;

  // Smart URL detection
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.protocol === 'file:'; // File protocol allow kiya

  const API_BASE = isLocal 
    ? 'http://127.0.0.1:8000'  // Local Python Server 
    : 'https://binbot-82ef.onrender.com'; // Production Server

  const container = document.createElement('div');
  container.className = "font-sans";
  container.innerHTML = aiWidgetHtml;
  document.body.appendChild(container);

  if (window.lucide) window.lucide.createIcons();

  const toggleBtn = document.getElementById('ai-chat-toggle');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('ai-chat-close');
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-input');
  const messagesContainer = document.getElementById('ai-chat-messages');

  let isOpen = false;
  let savedScrollY = 0;

  const isMobile = () => window.innerWidth < 640;

  const lockBodyScroll = () => {
    if (!isMobile()) return;
    savedScrollY = window.scrollY;
    document.body.classList.add('ai-chat-open');
    document.body.style.top = `-${savedScrollY}px`;
  };

  const unlockBodyScroll = () => {
    const top = document.body.style.top;
    document.body.classList.remove('ai-chat-open');
    document.body.style.top = '';
    if (top) {
      const restored = Number.parseInt(top || '0', 10) * -1;
      window.scrollTo(0, Number.isFinite(restored) ? restored : savedScrollY);
    }
  };

  const toggleChat = () => {
    isOpen = !isOpen;
    if (isOpen) {
      lockBodyScroll();
      chatWindow.classList.remove('hidden');
      setTimeout(() => {
        chatWindow.classList.remove('scale-95', 'opacity-0');
        chatWindow.classList.add('scale-100', 'opacity-100');
        const pingIndicator = toggleBtn.querySelector('.animate-ping');
        if(pingIndicator) pingIndicator.parentElement.style.display = 'none';
        setTimeout(() => chatInput.focus(), isMobile() ? 300 : 50);
      }, 10);
    } else {
      chatWindow.classList.remove('scale-100', 'opacity-100');
      chatWindow.classList.add('scale-95', 'opacity-0');
      unlockBodyScroll();
      setTimeout(() => chatWindow.classList.add('hidden'), 300);
    }
  };

  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  const fullscreenBtn = document.getElementById('ai-chat-fullscreen');
  const fullscreenIcon = document.getElementById('fullscreen-icon');
  let isFullscreenDesktop = false;

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
      e.preventDefault();      // Default action roko
      e.stopPropagation();     // Click ko close button tak jane se roko! (Crash Fix)
      
      isFullscreenDesktop = !isFullscreenDesktop;
      
      if (isFullscreenDesktop) {
        // Sirf ek class add karni hai (No Tailwind conflicts)
        chatWindow.classList.add('wasti-fullscreen');
        fullscreenIcon.setAttribute('data-lucide', 'minimize');
        document.body.style.overflow = 'hidden'; 
      } else {
        // Wahi class hata do, wapas normal ho jayega
        chatWindow.classList.remove('wasti-fullscreen');
        fullscreenIcon.setAttribute('data-lucide', 'maximize');
        document.body.style.overflow = '';
      }
      
      if (window.lucide) window.lucide.createIcons();
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) toggleChat();
  });

  if ('visualViewport' in window) {
    window.visualViewport.addEventListener('resize', () => {
      if (isOpen && isMobile()) chatWindow.style.height = `${window.visualViewport.height}px`;
      else chatWindow.style.height = '';
    });
    window.visualViewport.addEventListener('scroll', () => {
      if (isOpen && isMobile()) chatWindow.style.top = `${window.visualViewport.offsetTop}px`;
      else chatWindow.style.top = '';
    });
  }

  window.addEventListener('resize', () => {
    if (!isMobile()) { unlockBodyScroll(); chatWindow.style.height = ''; chatWindow.style.top = ''; }
  }, { passive: true });

  window.addEventListener('pagehide', unlockBodyScroll, { passive: true });

  const formatText = (text) => {
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/```([^]+?)```/g, '<pre class="bg-[#1A1A1A] text-[#86868B] p-2 mt-2 rounded-[8px] overflow-x-auto border border-white/10 text-xs whitespace-pre-wrap break-words"><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-[#1A1A1A] text-white px-[4px] py-[2px] rounded-[4px] text-xs break-all">$1</code>');
    html = html.replace(/\n/g, '<br>');
    return html;
  };

  const addMessage = (text, sender) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex gap-2.5 sm:gap-3 items-end max-w-[92%] sm:max-w-[95%] fade-in-up ${sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`;
    const avatarHtml = sender === 'ai' 
      ? `<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-white/20 mt-auto shadow-md pb-[1px]"><i data-lucide="bot" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black"></i></div>`
      : `<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1A1A1A] flex-shrink-0 flex items-center justify-center border border-white/10 mt-auto shadow-md pb-[1px]"><i data-lucide="user" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"></i></div>`;
    const bubbleHtml = sender === 'ai'
      ? `<div class="bg-[#1A1A1A]/90 text-white text-[13px] sm:text-[13.5px] leading-relaxed py-3 px-4 rounded-2xl rounded-bl-sm border border-white/10 shadow-md break-words overflow-hidden">${formatText(text)}</div>`
      : `<div class="bg-white text-black text-[13px] sm:text-[13.5px] leading-relaxed py-3 px-4 rounded-2xl rounded-br-sm shadow-[0_4px_15px_rgba(255,255,255,0.15)] font-medium break-words overflow-hidden">${formatText(text)}</div>`;

    msgDiv.innerHTML = `${avatarHtml}${bubbleHtml}`;
    messagesContainer.appendChild(msgDiv);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => messagesContainer.scrollTop = messagesContainer.scrollHeight, 10);
  };

  const showTyping = () => {
    const typingId = 'typing-' + Date.now();
    const typingMsg = document.createElement('div');
    typingMsg.id = typingId;
    typingMsg.className = 'flex gap-2.5 sm:gap-3 items-end max-w-[90%] fade-in-up';
    typingMsg.innerHTML = `
      <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-white/20 mt-auto shadow-md pb-[1px]">
        <i data-lucide="bot" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black"></i>
      </div>
      <div class="bg-[#1A1A1A]/90 py-3.5 px-5 rounded-2xl rounded-bl-sm border border-white/10 shadow-md flex gap-1.5 items-center">
        <div class="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div class="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div class="w-1.5 h-1.5 bg-[#86868B] rounded-full animate-bounce"></div>
      </div>
    `;
    messagesContainer.appendChild(typingMsg);
    setTimeout(() => messagesContainer.scrollTop = messagesContainer.scrollHeight, 10);
    return typingId;
  };

  const removeTyping = (id) => {
    const el = document.getElementById(id);
    if(el) el.remove();
  };

  // Real LLM via OpenRouter (Cloud Backend)
  const chatHistory = [];

  const getCloudResponse = async (text) => {
    try {
        const res = await fetch(`${API_BASE}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                history: chatHistory
            })
        });
        
        const data = await res.json();
        if (!data.success) return "❌ " + data.message;
        
        // OpenRouter format history update
        chatHistory.push({ role: "user", content: text });
        chatHistory.push({ role: "assistant", content: data.reply });
        
        return data.reply;
        
    } catch (err) {
        return "⚠️ Sorry, there was an error connecting to the AI service. Ensure your backend server is running.";
    }
  };

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';
    
    if (isMobile()) setTimeout(() => chatInput.focus(), 50);

    const typingId = showTyping();
    const response = await getCloudResponse(text);
    
    removeTyping(typingId);
    addMessage(response, 'ai');
  });

})();
