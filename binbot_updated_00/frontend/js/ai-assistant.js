(function initAIAssistant() {
  if (document.getElementById('ai-chat-window')) return; // Avoid double initialization

  // HTML Structure - Mobile-first optimized
  const aiWidgetHtml = `
    <!-- AI Chat Toggle Button -->
    <button id="ai-chat-toggle" aria-label="Toggle AI Assistant" class="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 hover:-translate-y-1 transition-all duration-300 ring-1 ring-white/10 group">
      <div class="relative w-full h-full flex items-center justify-center">
        <i data-lucide="bot" class="w-6 h-6 text-black transition-transform duration-300 group-hover:rotate-6"></i>
        <!-- Ping Badge -->
        <span class="absolute top-0 right-0 -mt-1 -mr-1 flex h-3.5 w-3.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.8)] border-2 border-black"></span>
        </span>
      </div>
    </button>

    <!-- AI Chat Window - Full screen on mobile, floating on desktop -->
    <div id="ai-chat-window" class="fixed z-[9999] bg-black/95 sm:bg-black/80 backdrop-blur-2xl border-0 sm:border sm:border-white/10 sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-300 transform scale-95 opacity-0 origin-bottom-right hidden
      inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[380px] sm:h-[550px] sm:max-h-[calc(100vh-160px)]">
      
      <!-- Premium Glassmorphism Header -->
      <div class="relative px-4 sm:px-5 py-3.5 sm:py-4 border-b border-white/10 bg-[#1A1A1A]/80 flex items-center justify-between shrink-0 safe-area-top">
        <!-- Ambient Header Glow -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent blur-xl pointer-events-none"></div>
        
        <div class="relative flex items-center gap-3 z-10">
          <div class="relative h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg">
            <i data-lucide="sparkles" class="w-4 h-4 sm:w-5 sm:h-5 text-black"></i>
          </div>
          <div>
            <h3 class="text-white font-bold text-sm tracking-wide flex items-center gap-2">
              Wasti AI
              <button id="ai-chat-settings" class="text-[#86868B] hover:text-white transition-colors p-1" title="Configure AI API Key">
                <i data-lucide="settings" class="w-3.5 h-3.5"></i>
              </button>
            </h3>
            <p class="text-[10px] text-[#86868B] uppercase tracking-wider font-bold flex items-center gap-1.5 mt-0.5" id="ai-status">
              <span class="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.6)] animate-pulse"></span> Virtual Assistant
            </p>
          </div>
        </div>
        <button id="ai-chat-close" class="relative z-10 text-[#86868B] hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10 border border-transparent shadow-sm -mr-1">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Settings Panel (Hidden by default) -->
      <div id="ai-settings-panel" class="absolute inset-x-0 top-[65px] sm:top-[73px] bottom-0 bg-black/95 backdrop-blur-xl z-40 p-5 flex flex-col gap-4 border-b border-white/10 transition-all duration-300 transform translate-x-full opacity-0 hidden">
        <h4 class="text-white font-bold text-sm mb-1 flex items-center gap-2"><i data-lucide="key" class="w-4 h-4 text-white"></i> AI Configuration</h4>
        <p class="text-[13px] text-[#86868B] mb-2 leading-relaxed">Enter a Gemini API Key to enable full conversational AI over any topic.</p>
        <div class="space-y-1.5 flex-1">
           <label class="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">API Key</label>
           <input type="password" id="ai-api-key-input" placeholder="Paste your Gemini API Key here..." class="w-full bg-[#1A1A1A] text-white text-sm placeholder-[#86868B]/50 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors">
        </div>
        <div class="flex items-center gap-3 w-full mt-auto pt-4 pb-2 border-t border-white/10 safe-area-bottom">
          <button type="button" id="ai-settings-cancel" class="flex-1 py-3 text-xs text-center font-semibold text-[#86868B] hover:text-white bg-[#1A1A1A] hover:bg-white/10 rounded-xl border border-white/10 transition-all">Cancel</button>
          <button type="button" id="ai-settings-save" class="flex-1 py-3 text-xs text-center font-bold text-black bg-white hover:bg-gray-200 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">Save Key</button>
        </div>
      </div>

      <!-- Messages Area -->
      <div id="ai-chat-messages" class="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col gap-4 scroll-smooth bg-transparent scrollbar-hide overscroll-contain">
        <!-- Initial Greetings -->
        <div class="flex gap-3 items-end max-w-[90%] fade-in-up">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-white/20 mt-auto shadow-md relative pb-[1px]">
             <i data-lucide="bot" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black"></i>
          </div>
          <div class="bg-[#1A1A1A]/90 text-white text-[13px] sm:text-[13.5px] leading-relaxed py-3 px-4 rounded-2xl rounded-bl-sm border border-white/10 shadow-md transform-gpu">
            Hi! I'm <strong>Wasti AI</strong>. I can answer <em>any</em> questions you have. 🤖<br><br>You can ask me anything—whether it's about recycling, writing code, solving math, or analyzing text! How can I assist you today?
          </div>
        </div>
      </div>

      <!-- Input Area - Safe area aware for mobile -->
      <div class="p-3 border-t border-white/10 bg-black/80 backdrop-blur-md shrink-0 safe-area-bottom">
        <form id="ai-chat-form" class="relative flex items-center gap-2">
          <input type="text" id="ai-chat-input" placeholder="Ask me anything..." class="flex-1 bg-[#1A1A1A] text-white text-sm placeholder-[#86868B] font-medium rounded-xl pl-4 pr-4 py-3.5 border border-white/10 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all shadow-inner" autocomplete="off" enterkeyhint="send" />
          <button type="submit" class="bg-white text-black p-3 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 shrink-0 shadow-md">
            <i data-lucide="send" class="w-4 h-4"></i>
          </button>
        </form>
      </div>
    </div>

    <!-- Inline CSS for chat optimizations -->
    <style>
      #ai-chat-messages::-webkit-scrollbar { width: 3px; }
      #ai-chat-messages::-webkit-scrollbar-track { background: transparent; }
      #ai-chat-messages::-webkit-scrollbar-thumb { background: #333333; border-radius: 4px; }
      #ai-chat-messages::-webkit-scrollbar-thumb:hover { background: #555555; }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
      
      /* Safe area padding for notched phones */
      .safe-area-top { padding-top: max(0.875rem, env(safe-area-inset-top)); }
      .safe-area-bottom { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }
      
      /* Full-screen mobile: hide toggle when chat is open */
      @media (max-width: 639px) {
        #ai-chat-window:not(.hidden) ~ #ai-chat-toggle,
        body.ai-chat-open #ai-chat-toggle {
          display: none !important;
        }
        /* Prevent body scroll when chat is open on mobile */
        body.ai-chat-open {
          overflow: hidden !important;
          position: fixed;
          width: 100%;
        }
      }
    </style>
  `;

//api base url depending on url (localhost , production)
  const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://binbot-apis.onrender.com';
  // Inject into body
  const container = document.createElement('div');
  container.className = "font-sans";
  container.innerHTML = aiWidgetHtml;
  document.body.appendChild(container);

  // Initialize Icons if Lucide is available
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // DOM Elements
  const toggleBtn = document.getElementById('ai-chat-toggle');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('ai-chat-close');
  const settingsBtn = document.getElementById('ai-chat-settings');
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-input');
  const messagesContainer = document.getElementById('ai-chat-messages');
  const statusEl = document.getElementById('ai-status');

  const settingsPanel = document.getElementById('ai-settings-panel');
  const apiKeyInput = document.getElementById('ai-api-key-input');
  const settingsCancel = document.getElementById('ai-settings-cancel');
  const settingsSave = document.getElementById('ai-settings-save');

  let isOpen = false;
  let savedScrollY = 0;

  const updateStatus = () => {
    const hasKey = localStorage.getItem('gemini_api_key');
    if (hasKey) {
      statusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-[#FF0000] shadow-[0_0_8px_rgba(0,113,227,0.6)] animate-pulse"></span> Advance AI Mode';
    } else {
      statusEl.innerHTML = '<span class="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.6)] animate-pulse"></span> Basic AI Mode';
    }
  };
  
  updateStatus();

  const toggleSettings = () => {
    const isHidden = settingsPanel.classList.contains('hidden');
    if (isHidden) {
      apiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
      settingsPanel.classList.remove('hidden');
      setTimeout(() => {
        settingsPanel.classList.remove('translate-x-full', 'opacity-0');
        settingsPanel.classList.add('translate-x-0', 'opacity-100');
        apiKeyInput.focus();
      }, 10);
    } else {
      settingsPanel.classList.remove('translate-x-0', 'opacity-100');
      settingsPanel.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        settingsPanel.classList.add('hidden');
      }, 300);
    }
  };

  settingsBtn.addEventListener('click', toggleSettings);
  settingsCancel.addEventListener('click', toggleSettings);
  
  settingsSave.addEventListener('click', () => {
    const newKey = apiKeyInput.value.trim();
    if (newKey === '') {
      localStorage.removeItem('gemini_api_key');
      addMessage("Reverted to Basic AI Mode.", 'ai');
    } else {
      localStorage.setItem('gemini_api_key', newKey);
      addMessage("Gemini API Key saved! I am now powered by real AI.", 'ai');
    }
    updateStatus();
    toggleSettings();
  });

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
        // Small delay for mobile keyboard readiness
        setTimeout(() => chatInput.focus(), isMobile() ? 300 : 50);
      }, 10);
      
      // Notify user about Gemini if no key is set yet
      if (!localStorage.getItem('gemini_api_key') && !localStorage.getItem('ai_notified')) {
        setTimeout(() => {
          addMessage("💡 *Tip: Click the Settings gear ⚙️ next to my name to add a Gemini API Key and unlock my full conversational intelligence!*", 'ai');
          localStorage.setItem('ai_notified', 'true');
        }, 1500);
      }
    } else {
      chatWindow.classList.remove('scale-100', 'opacity-100');
      chatWindow.classList.add('scale-95', 'opacity-0');
      
      unlockBodyScroll();
      
      setTimeout(() => {
        chatWindow.classList.add('hidden');
      }, 300);
    }
  };

  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  
  // Close on back button / Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      toggleChat();
    }
  });

  // Handle mobile viewport resize (keyboard open/close)
  if ('visualViewport' in window) {
    window.visualViewport.addEventListener('resize', () => {
      if (isOpen && isMobile()) {
        const vh = window.visualViewport.height;
        chatWindow.style.height = `${vh}px`;
      } else {
        chatWindow.style.height = '';
      }
    });
    window.visualViewport.addEventListener('scroll', () => {
      if (isOpen && isMobile()) {
        chatWindow.style.top = `${window.visualViewport.offsetTop}px`;
      } else {
        chatWindow.style.top = '';
      }
    });
  }

  window.addEventListener('resize', () => {
    if (!isMobile()) {
      unlockBodyScroll();
      chatWindow.style.height = '';
      chatWindow.style.top = '';
    }
  }, { passive: true });

  window.addEventListener('pagehide', unlockBodyScroll, { passive: true });

  // Convert markdown to simple HTML including code blocks and newlines
  const formatText = (text) => {
    // Escape standard HTML first, but ALLOW the span for our offline styling
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/&lt;span class="text-xs text-\[#86868B\] block border-t border-white\/10 pt-2 mt-2"&gt;/g, '<span class="text-xs text-[#86868B] block border-t border-white/10 pt-2 mt-2">');
    html = html.replace(/&lt;\/span&gt;/g, '</span>');
    
    // Bold and Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([^]+?)```/g, '<pre class="bg-[#1A1A1A] text-[#86868B] p-2 mt-2 rounded-[8px] overflow-x-auto border border-white/10 text-xs whitespace-pre-wrap break-words"><code>$1</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-[#1A1A1A] text-white px-[4px] py-[2px] rounded-[4px] text-xs break-all">$1</code>');
    
    // Newlines
    html = html.replace(/\n/g, '<br>');
    return html;
  };

  const addMessage = (text, sender) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex gap-2.5 sm:gap-3 items-end max-w-[92%] sm:max-w-[95%] fade-in-up ${sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`;

    const avatarHtml = sender === 'ai' 
      ? `<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-white/20 mt-auto shadow-md pb-[1px]">
           <i data-lucide="bot" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black"></i>
         </div>`
      : `<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1A1A1A] flex-shrink-0 flex items-center justify-center border border-white/10 mt-auto shadow-md pb-[1px]">
           <i data-lucide="user" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"></i>
         </div>`;

    const bubbleHtml = sender === 'ai'
      ? `<div class="bg-[#1A1A1A]/90 text-white text-[13px] sm:text-[13.5px] leading-relaxed py-3 px-4 rounded-2xl rounded-bl-sm border border-white/10 shadow-md break-words overflow-hidden">
           ${formatText(text)}
         </div>`
      : `<div class="bg-white text-black text-[13px] sm:text-[13.5px] leading-relaxed py-3 px-4 rounded-2xl rounded-br-sm shadow-[0_4px_15px_rgba(255,255,255,0.15)] font-medium break-words overflow-hidden">
           ${formatText(text)}
         </div>`;

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

  // Mock Fallback Logic for offline fallback
  const basicRules = [
    { keywords: ['plastic', 'bottle', 'container', ' jug', 'can', 'metal', 'glass', 'aluminum', 'foil'], bin: 'Blue Bin (Recycling) 🔵', desc: 'Ensure it is empty and rinsed if possible. Caps can usually be left on.' },
    { keywords: ['paper', 'cardboard', 'newspaper', 'magazine', 'box', 'envelope', 'flyer', 'mail'], bin: 'Blue Bin (Recycling) 🔵', desc: 'Keep it dry and flatten all cardboard boxes to save space.' },
    { keywords: ['food', 'apple', 'banana', 'peel', 'core', 'scrap', 'meat', 'bone', 'coffee', 'tea', 'egg', 'vegetable', 'fruit', 'bread', 'pizza'], bin: 'Green Bin (Compost) 🟢', desc: 'Remove any produce stickers or packaging. Use certified compostable bags if lining your bin.' },
    { keywords: ['wrapper', 'chip', 'candy', 'snack', 'pouch', 'styrofoam', 'diaper', 'wipe', 'plastic bag', 'bag', 'wrap', 'broken glass'], bin: 'Black Bin (Landfill) ⚫', desc: 'These items are not recyclable or compostable in most municipal systems.' },
    { keywords: ['battery', 'bulb', 'lightbulb', 'electronics', 'phone', 'laptop', 'paint', 'chemical', 'oil', 'toxic', 'aerosol'], bin: 'Special Drop-off (Hazmat/E-Waste) 🔴', desc: 'Do not put this in standard bins. Check your local electronic or hazardous waste disposal center.' },
  ];

  const getBasicAIResponse = (input) => {
    const lowerInput = input.toLowerCase();
    let bestMatch = null;
    let matchCount = 0;

    for (const rule of basicRules) {
      const matchedKeywords = rule.keywords.filter(kw => lowerInput.includes(kw));
      if (matchedKeywords.length > matchCount) {
        matchCount = matchedKeywords.length;
        bestMatch = rule;
      }
    }

    if (bestMatch) {
      return `I recommend putting that in the **${bestMatch.bin}**.\n\n<span class="text-xs text-[#86868B] block border-t border-white/10 pt-2 mt-2">${bestMatch.desc}</span>`;
    }

    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
        return "Hello there! I am in **offline mode**, so I can only answer simple waste sorting queries right now. Please add your Gemini key for general knowledge questions.";
    }

    return "I'm not exactly sure about that item. I am in simple **offline mode**. To activate my intelligence for any questions (from coding to general info), set up your **Gemini API key** via the gear settings icon!";
  };

  // Real LLM via Gemini (Unrestricted AI)
  const chatHistory = [];
  const systemInstruction = "You are Wasti AI, a highly intelligent, unrestricted, and helpful virtual assistant. You are capable of answering *any* question the user asks accurately across all topics (science, math, general knowledge, coding, writing, real-world advice, waste, etc.). You must answer all questions thoroughly, warmly, and concisely using markdown. Use emojis where appropriate. Do not restrict yourself to waste segregation alone.";

  const getGeminiResponse = async (text) => {
    const userKey = localStorage.getItem('gemini_api_key');
    
    try {
        const res = await fetch(`${API_BASE}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                history: chatHistory,
                api_key: userKey || null  // user ki key bhejo
            })
        });
        
        const data = await res.json();
        if (!data.success) return "❌ " + data.message;
        
        chatHistory.push({ role: "user", parts: [{ text }] });
        chatHistory.push({ role: "model", parts: [{ text: data.reply }] });
        
        return data.reply;
        
    } catch (err) {
        return "⚠️ Sorry, there was an error connecting to the AI service. Please check your API key and network connection.";
    }
};

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Send User Message
    addMessage(text, 'user');
    chatInput.value = '';
    
    // Re-focus input on mobile (keyboard stays open)
    if (isMobile()) {
      setTimeout(() => chatInput.focus(), 50);
    }

    const typingId = showTyping();

    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) {
      // Use Real AI Unrestricted
      const response = await getGeminiResponse(text, apiKey);
      removeTyping(typingId);
      addMessage(response, 'ai');
    } else {
      // Use Basic Mock Logic
      setTimeout(() => {
        removeTyping(typingId);
        const response = getBasicAIResponse(text);
        addMessage(response, 'ai');
      }, 600 + Math.random() * 600);
    }
  });

})();
