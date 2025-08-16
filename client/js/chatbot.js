// ===== PERSONAL CHATBOT FOR VINO K =====

class PersonalChatbot {
  constructor() {
    this.isOpen = false;
    this.isTyping = false;
    this.conversationHistory = [];
    this.qaDatabase = null;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    
    this.initializeElements();
    this.loadQADatabase();
    this.setupEventListeners();
    this.setupVoiceRecognition();
    this.showWelcomeMessage();
    
    console.log('🤖 Personal Chatbot initialized');
  }

  initializeElements() {
    this.container = document.getElementById('chatbot-container');
    this.toggle = document.getElementById('chatbot-toggle');
    this.window = document.getElementById('chatbot-window');
    this.closeBtn = document.getElementById('chatbot-close');
    this.messages = document.getElementById('chatbot-messages');
    this.input = document.getElementById('chatbot-input');
    this.sendBtn = document.getElementById('send-btn');
    this.voiceBtn = document.getElementById('voice-btn');
    this.quickActions = document.getElementById('quick-actions');
    this.notification = document.getElementById('chatbot-notification');
    this.icon = document.getElementById('chatbot-icon');
  }

  async loadQADatabase() {
    try {
      const response = await fetch('./data/qa.json');
      this.qaDatabase = await response.json();
      console.log(`Loaded ${this.qaDatabase.qa_pairs.length} Q&A pairs`);
    } catch (error) {
      console.error('Failed to load Q&A database:', error);
      this.qaDatabase = { qa_pairs: [] };
    }
  }

  setupEventListeners() {
    // Toggle chatbot
    this.toggle.addEventListener('click', () => this.toggleChatbot());
    this.closeBtn.addEventListener('click', () => this.closeChatbot());

    // Send message
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Voice input
    this.voiceBtn.addEventListener('click', () => this.toggleVoiceInput());

    // Quick actions
    this.quickActions.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-action')) {
        const question = e.target.dataset.question;
        this.input.value = question;
        this.sendMessage();
      }
    });

    // Auto-resize input
    this.input.addEventListener('input', () => {
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
    });
  }

  setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.voiceBtn.classList.add('recording');
        this.voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.input.value = transcript;
        this.sendMessage();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.voiceBtn.classList.remove('recording');
        this.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        this.voiceBtn.classList.remove('recording');
        this.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      };
    } else {
      this.voiceBtn.style.display = 'none';
    }
  }

  toggleChatbot() {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.window.classList.add('active');
      this.toggle.classList.add('active');
      this.icon.className = 'fas fa-times';
      this.input.focus();
      this.hideNotification();
    } else {
      this.closeChatbot();
    }
  }

  closeChatbot() {
    this.isOpen = false;
    this.window.classList.remove('active');
    this.toggle.classList.remove('active');
    this.icon.className = 'fas fa-comments';
  }

  toggleVoiceInput() {
    if (!this.recognition) return;

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }

  async sendMessage() {
    const message = this.input.value.trim();
    if (!message || this.isTyping) return;

    // Add user message
    this.addMessage(message, 'user');
    this.input.value = '';
    this.input.style.height = 'auto';

    // Show typing indicator
    this.showTypingIndicator();

    // Process message and get response
    const response = await this.processMessage(message);
    
    // Remove typing indicator and add bot response
    setTimeout(() => {
      this.hideTypingIndicator();
      this.addMessage(response.answer, 'bot');
      
      // Speak response if synthesis is available
      if (response.speak) {
        this.speakMessage(response.answer);
      }
    }, 1000 + Math.random() * 1000); // Realistic typing delay
  }

  async processMessage(message) {
    // Add to conversation history
    this.conversationHistory.push({
      type: 'user',
      message: message,
      timestamp: new Date()
    });

    // Keep only last 10 exchanges
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    // Find best matching response
    const response = this.findBestResponse(message);
    
    // Add bot response to history
    this.conversationHistory.push({
      type: 'bot',
      message: response.answer,
      timestamp: new Date()
    });

    return response;
  }

  findBestResponse(userMessage) {
    if (!this.qaDatabase || !this.qaDatabase.qa_pairs) {
      return {
        answer: "I'm still learning! Please try asking about Vino K's skills, projects, or experience.",
        confidence: 0.5,
        speak: false
      };
    }

    const normalizedMessage = userMessage.toLowerCase().trim();
    
    // Check for exact matches first
    for (const qa of this.qaDatabase.qa_pairs) {
      if (qa.question.toLowerCase() === normalizedMessage) {
        return {
          answer: qa.answer,
          confidence: 1.0,
          speak: true
        };
      }
    }

    // Fuzzy matching with keywords
    let bestMatch = null;
    let bestScore = 0;

    for (const qa of this.qaDatabase.qa_pairs) {
      const score = this.calculateSimilarity(normalizedMessage, qa);
      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestMatch = qa;
      }
    }

    if (bestMatch) {
      return {
        answer: bestMatch.answer,
        confidence: bestScore,
        speak: bestScore > 0.7
      };
    }

    // Fallback responses
    return this.getFallbackResponse(normalizedMessage);
  }

  calculateSimilarity(userMessage, qa) {
    let score = 0;
    const userWords = userMessage.split(' ').filter(word => word.length > 2);
    
    // Check question similarity
    const questionWords = qa.question.toLowerCase().split(' ');
    const questionMatches = userWords.filter(word => 
      questionWords.some(qWord => qWord.includes(word) || word.includes(qWord))
    );
    score += (questionMatches.length / userWords.length) * 0.4;

    // Check keyword matches
    if (qa.keywords) {
      const keywordMatches = userWords.filter(word =>
        qa.keywords.some(keyword => keyword.includes(word) || word.includes(keyword))
      );
      score += (keywordMatches.length / userWords.length) * 0.6;
    }

    return Math.min(score, 1.0);
  }

  getFallbackResponse(message) {
    const fallbacks = [
      {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        response: "Hello! I'm Vino K's AI assistant. I can tell you about his skills, projects, achievements, and experience. What would you like to know?"
      },
      {
        keywords: ['thanks', 'thank you', 'appreciate'],
        response: "You're welcome! Is there anything else you'd like to know about Vino K?"
      },
      {
        keywords: ['bye', 'goodbye', 'see you'],
        response: "Goodbye! Feel free to come back anytime if you have more questions about Vino K!"
      },
      {
        keywords: ['help', 'what can you do'],
        response: "I can answer questions about Vino K's technical skills, projects, achievements, education, and experience. Try asking about his Python skills, AI projects, or certifications!"
      }
    ];

    for (const fallback of fallbacks) {
      if (fallback.keywords.some(keyword => message.includes(keyword))) {
        return {
          answer: fallback.response,
          confidence: 0.8,
          speak: true
        };
      }
    }

    return {
      answer: "I'm not sure about that. Try asking about Vino K's skills, projects, achievements, or experience. You can also use the quick action buttons below!",
      confidence: 0.3,
      speak: false
    };
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'bot' ? 'VK' : 'U';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    this.messages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    this.isTyping = true;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-message';
    typingDiv.innerHTML = `
      <div class="message-avatar">VK</div>
      <div class="typing-indicator">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    
    this.messages.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;
    const typingMessage = this.messages.querySelector('.typing-message');
    if (typingMessage) {
      typingMessage.remove();
    }
  }

  speakMessage(text) {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    this.synthesis.speak(utterance);
  }

  scrollToBottom() {
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  showNotification() {
    this.notification.style.display = 'flex';
  }

  hideNotification() {
    this.notification.style.display = 'none';
  }

  showWelcomeMessage() {
    // Show notification after 3 seconds if chatbot is closed
    setTimeout(() => {
      if (!this.isOpen) {
        this.showNotification();
      }
    }, 3000);
  }

  // Export chat history
  exportChatHistory() {
    const history = this.conversationHistory
      .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.type.toUpperCase()}: ${entry.message}`)
      .join('\n');

    const blob = new Blob([history], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vino-k-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Add context menu for additional features
  addContextMenu() {
    const contextMenu = document.createElement('div');
    contextMenu.className = 'chatbot-context-menu';
    contextMenu.innerHTML = `
      <button class="context-btn" id="export-chat">
        <i class="fas fa-download"></i> Export Chat
      </button>
      <button class="context-btn" id="clear-chat">
        <i class="fas fa-trash"></i> Clear Chat
      </button>
      <button class="context-btn" id="toggle-voice">
        <i class="fas fa-volume-up"></i> Toggle Voice
      </button>
    `;

    this.window.appendChild(contextMenu);

    // Add event listeners
    document.getElementById('export-chat').addEventListener('click', () => {
      this.exportChatHistory();
      this.hideContextMenu();
    });

    document.getElementById('clear-chat').addEventListener('click', () => {
      this.clearChat();
      this.hideContextMenu();
    });

    document.getElementById('toggle-voice').addEventListener('click', () => {
      this.toggleVoiceOutput();
      this.hideContextMenu();
    });
  }

  clearChat() {
    this.messages.innerHTML = `
      <div class="message bot">
        <div class="message-avatar">VK</div>
        <div class="message-content">
          👋 Hi! I'm Vino K's AI assistant. Ask me anything about my skills, projects, experience, or achievements!
        </div>
      </div>
    `;
    this.conversationHistory = [];
  }

  toggleVoiceOutput() {
    this.voiceEnabled = !this.voiceEnabled;
    const btn = document.getElementById('toggle-voice');
    if (this.voiceEnabled) {
      btn.innerHTML = '<i class="fas fa-volume-up"></i> Voice On';
    } else {
      btn.innerHTML = '<i class="fas fa-volume-mute"></i> Voice Off';
    }
  }

  hideContextMenu() {
    const menu = document.querySelector('.chatbot-context-menu');
    if (menu) {
      menu.style.display = 'none';
    }
  }

  // Enhanced message processing with context awareness
  processMessageWithContext(message) {
    const context = this.getConversationContext();

    // Check if this is a follow-up question
    if (this.isFollowUpQuestion(message, context)) {
      return this.handleFollowUpQuestion(message, context);
    }

    return this.findBestResponse(message);
  }

  getConversationContext() {
    return this.conversationHistory
      .slice(-6) // Last 3 exchanges
      .filter(entry => entry.type === 'bot')
      .map(entry => entry.message)
      .join(' ');
  }

  isFollowUpQuestion(message, context) {
    const followUpIndicators = [
      'tell me more', 'more details', 'elaborate', 'explain further',
      'what about', 'how about', 'can you', 'what else'
    ];

    return followUpIndicators.some(indicator =>
      message.toLowerCase().includes(indicator)
    );
  }

  handleFollowUpQuestion(message, context) {
    // Enhanced responses based on context
    if (context.includes('projects')) {
      return {
        answer: "I'd be happy to share more details about my projects! Each one demonstrates different technical skills - from AI/ML in the Resume Analyzer to blockchain technology in the Voting App. Which specific project interests you most?",
        confidence: 0.9,
        speak: true
      };
    }

    if (context.includes('skills')) {
      return {
        answer: "My technical skills span across multiple domains. In AI/ML, I work with TensorFlow and Keras for deep learning. For web development, I use Django and Flask. For cloud computing, I'm experienced with AWS and Azure. What specific area would you like to know more about?",
        confidence: 0.9,
        speak: true
      };
    }

    return this.findBestResponse(message);
  }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PersonalChatbot();
});

export default PersonalChatbot;
