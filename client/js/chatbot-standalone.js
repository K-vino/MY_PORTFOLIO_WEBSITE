// ===== STANDALONE CHATBOT (No ES6 Modules, Works with file://) =====

// Embedded Q&A Database (for standalone operation)
const EMBEDDED_QA_DATABASE = {
  "metadata": {
    "version": "1.0",
    "total_entries": 40,
    "last_updated": "2025-01-16"
  },
  "qa_pairs": [
    {
      "id": 1,
      "category": "personal_info",
      "question": "What is your name?",
      "answer": "My name is Vino K. I'm an AIML Developer, Data Scientist, and Cloud Engineer based in Salem, Tamil Nadu, India.",
      "keywords": ["name", "vino", "k", "who are you"],
      "confidence": 1.0
    },
    {
      "id": 2,
      "category": "personal_info",
      "question": "Who are you?",
      "answer": "I'm Vino K, a passionate AIML Developer, Data Scientist, and Cloud Engineer. I specialize in transforming data into insights and building intelligent solutions using Python, AI/ML, and cloud technologies.",
      "keywords": ["who", "about", "introduction", "yourself"],
      "confidence": 1.0
    },
    {
      "id": 3,
      "category": "contact_info",
      "question": "How can I contact you?",
      "answer": "You can reach me at vinokoffical@gmail.com. You can also connect with me on LinkedIn at https://linkedin.com/in/vino-k or check out my projects on GitHub at https://github.com/K-vino.",
      "keywords": ["contact", "email", "reach", "linkedin", "github"],
      "confidence": 1.0
    },
    {
      "id": 4,
      "category": "skills_technical",
      "question": "What are your technical skills?",
      "answer": "My technical skills include Python, SQL, Java, PySpark, NumPy, Pandas, TensorFlow, Keras, Django, Flask, Streamlit, MongoDB, MySQL, AWS, Azure, Git, Power BI, and Data Visualization. I specialize in AI/ML, data science, and cloud engineering.",
      "keywords": ["skills", "technical", "technologies", "expertise"],
      "confidence": 1.0
    },
    {
      "id": 5,
      "category": "skills_technical",
      "question": "Do you know Python?",
      "answer": "Yes, Python is my primary programming language! I use it extensively for AI/ML development, data science, web development with Django and Flask, and automation. I'm proficient with libraries like NumPy, Pandas, TensorFlow, and Keras.",
      "keywords": ["python", "programming", "language"],
      "confidence": 1.0
    },
    {
      "id": 6,
      "category": "projects",
      "question": "What projects have you worked on?",
      "answer": "I've worked on several exciting projects including an AI Resume Analyzer, Smart AI for LIFE, Expense Tracker, Web3 Blockchain Voting App, HR Chatbot, and a Deep Learning Project Collection. Each project showcases different aspects of my AI/ML and development skills.",
      "keywords": ["projects", "work", "portfolio", "built"],
      "confidence": 1.0
    },
    {
      "id": 7,
      "category": "achievements",
      "question": "What are your achievements?",
      "answer": "I have 400+ certifications in various technologies, ranked Top 15 in Engineering on Unstop among 2.3M+ users, and have won multiple hackathons. These achievements reflect my continuous learning mindset and technical expertise.",
      "keywords": ["achievements", "certifications", "unstop", "hackathons", "awards"],
      "confidence": 1.0
    },
    {
      "id": 8,
      "category": "small_talk",
      "question": "Hello",
      "answer": "Hello! I'm Vino K, nice to meet you! I'm an AIML Developer and Data Scientist. How can I help you today? Feel free to ask me about my projects, skills, or experience.",
      "keywords": ["hello", "hi", "hey", "greetings"],
      "confidence": 1.0
    }
  ]
};

class StandaloneChatbot {
  constructor() {
    this.isOpen = false;
    this.isTyping = false;
    this.conversationHistory = [];
    this.qaDatabase = EMBEDDED_QA_DATABASE;
    this.voiceEnabled = true;
    
    this.initializeElements();
    this.setupEventListeners();
    this.setupVoiceFeatures();
    this.showWelcomeNotification();
    
    console.log('🤖 Standalone Chatbot initialized');
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
    if (this.voiceBtn) {
      this.voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
    }

    // Quick actions
    this.quickActions.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-action')) {
        const question = e.target.dataset.question;
        this.input.value = question;
        this.sendMessage();
      }
    });
  }

  setupVoiceFeatures() {
    // Speech Recognition
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
    } else {
      if (this.voiceBtn) {
        this.voiceBtn.style.display = 'none';
      }
    }

    // Speech Synthesis
    this.synthesis = window.speechSynthesis;
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

  sendMessage() {
    const message = this.input.value.trim();
    if (!message || this.isTyping) return;

    // Add user message
    this.addMessage(message, 'user');
    this.input.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    // Process message and get response
    setTimeout(() => {
      const response = this.processMessage(message);
      this.hideTypingIndicator();
      this.addMessage(response.answer, 'bot');
      
      // Speak response if enabled
      if (response.speak && this.voiceEnabled) {
        this.speakMessage(response.answer);
      }
    }, 1000 + Math.random() * 1000);
  }

  processMessage(message) {
    // Add to conversation history
    this.conversationHistory.push({
      type: 'user',
      message: message,
      timestamp: new Date()
    });

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
        keywords: ['hello', 'hi', 'hey'],
        response: "Hello! I'm Vino K's AI assistant. Ask me about his skills, projects, or achievements!"
      },
      {
        keywords: ['thanks', 'thank you'],
        response: "You're welcome! Anything else you'd like to know about Vino K?"
      },
      {
        keywords: ['bye', 'goodbye'],
        response: "Goodbye! Feel free to come back anytime!"
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
      answer: "I'm not sure about that. Try asking about Vino K's skills, projects, or achievements!",
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

  showWelcomeNotification() {
    setTimeout(() => {
      if (!this.isOpen) {
        this.notification.style.display = 'flex';
      }
    }, 3000);
  }

  hideNotification() {
    this.notification.style.display = 'none';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if chatbot container exists
  if (document.getElementById('chatbot-container')) {
    window.StandaloneChatbot = new StandaloneChatbot();
  }
});
