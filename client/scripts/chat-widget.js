// AI Chat Widget Implementation
class ChatWidget {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isLoading = false;
    this.init();
  }

  init() {
    this.createChatBubble();
    this.createChatPanel();
    this.bindEvents();
    this.addWelcomeMessage();
  }

  createChatBubble() {
    this.bubble = document.createElement('div');
    this.bubble.className = 'chat-bubble';
    this.bubble.innerHTML = '💬 Ask Vino\'s AI';
    this.bubble.setAttribute('aria-label', 'Open AI chat assistant');
    this.bubble.setAttribute('role', 'button');
    this.bubble.setAttribute('tabindex', '0');
    document.body.appendChild(this.bubble);
  }

  createChatPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'chat-panel';
    this.panel.innerHTML = `
      <header>
        <span>Vino's AI Assistant</span>
        <button class="close-chat" aria-label="Close chat">×</button>
      </header>
      <main id="chatLog" role="log" aria-live="polite"></main>
      <footer>
        <input 
          id="chatInput" 
          type="text"
          placeholder="Ask about projects, skills, resume…"
          aria-label="Chat message input"
          maxlength="500"
        />
        <button id="chatSend" aria-label="Send message">Send</button>
      </footer>
    `;
    document.body.appendChild(this.panel);

    // Add close button styles
    const closeBtn = this.panel.querySelector('.close-chat');
    Object.assign(closeBtn.style, {
      background: 'none',
      border: 'none',
      color: 'var(--muted)',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '0',
      marginLeft: 'auto'
    });

    // Update header styles
    const header = this.panel.querySelector('header');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
  }

  bindEvents() {
    // Toggle chat on bubble click
    this.bubble.addEventListener('click', () => this.toggleChat());
    this.bubble.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleChat();
      }
    });

    // Close chat
    this.panel.querySelector('.close-chat').addEventListener('click', () => this.closeChat());

    // Send message on button click
    this.panel.querySelector('#chatSend').addEventListener('click', () => this.sendMessage());

    // Send message on Enter key
    this.panel.querySelector('#chatInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.panel.contains(e.target) && !this.bubble.contains(e.target)) {
        this.closeChat();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.isOpen = true;
    this.panel.classList.add('open');
    this.panel.querySelector('#chatInput').focus();
    this.bubble.setAttribute('aria-expanded', 'true');
  }

  closeChat() {
    this.isOpen = false;
    this.panel.classList.remove('open');
    this.bubble.setAttribute('aria-expanded', 'false');
    this.bubble.focus();
  }

  addWelcomeMessage() {
    const welcomeMsg = {
      role: 'assistant',
      content: 'Hi! I\'m Vino\'s AI assistant. I can help you learn about his projects, skills, experience, and more. What would you like to know?'
    };
    this.addMessageToChat(welcomeMsg);
  }

  async sendMessage() {
    const input = this.panel.querySelector('#chatInput');
    const message = input.value.trim();
    
    if (!message || this.isLoading) return;

    // Add user message
    this.addMessageToChat({ role: 'user', content: message });
    input.value = '';

    // Show loading state
    this.setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...this.messages, { role: 'user', content: message }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.reply) {
        this.addMessageToChat({ role: 'assistant', content: data.reply });
      } else {
        throw new Error('No reply received');
      }

    } catch (error) {
      console.error('Chat error:', error);
      this.addMessageToChat({ 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later or contact Vino directly at vk5571850@gmail.com.' 
      });
    } finally {
      this.setLoading(false);
    }
  }

  addMessageToChat(message) {
    this.messages.push(message);
    const chatLog = this.panel.querySelector('#chatLog');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${message.role}`;
    
    const isUser = message.role === 'user';
    const sender = isUser ? 'You' : 'AI';
    const senderColor = isUser ? 'var(--fg)' : 'var(--accent)';
    
    messageDiv.innerHTML = `
      <strong style="color: ${senderColor}">${sender}:</strong> 
      <span>${this.escapeHtml(message.content)}</span>
    `;
    
    messageDiv.style.marginBottom = '12px';
    messageDiv.style.lineHeight = '1.4';
    
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;

    // Keep only last 20 messages to prevent memory issues
    if (this.messages.length > 20) {
      this.messages = this.messages.slice(-20);
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    const sendBtn = this.panel.querySelector('#chatSend');
    const input = this.panel.querySelector('#chatInput');
    
    if (loading) {
      sendBtn.textContent = '...';
      sendBtn.disabled = true;
      input.disabled = true;
      
      // Add typing indicator
      const typingDiv = document.createElement('div');
      typingDiv.className = 'typing-indicator';
      typingDiv.innerHTML = '<strong style="color: var(--accent)">AI:</strong> <span style="color: var(--muted)">typing...</span>';
      typingDiv.style.marginBottom = '12px';
      this.panel.querySelector('#chatLog').appendChild(typingDiv);
      this.panel.querySelector('#chatLog').scrollTop = this.panel.querySelector('#chatLog').scrollHeight;
    } else {
      sendBtn.textContent = 'Send';
      sendBtn.disabled = false;
      input.disabled = false;
      
      // Remove typing indicator
      const typingIndicator = this.panel.querySelector('.typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
      
      input.focus();
    }
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if not on admin pages
  if (!window.location.pathname.startsWith('/admin')) {
    window.chatWidget = new ChatWidget();
  }
});

// Export for potential external use
window.ChatWidget = ChatWidget;
