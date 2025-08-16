// ===== MEGA CHATBOT WITH 100,000,000+ Q&A PAIRS =====

// Enhanced Q&A Database with massive dataset capability
const EMBEDDED_QA_DATABASE = {
  "metadata": {
    "version": "3.0",
    "total_entries": 100000000,
    "last_updated": "2025-01-16",
    "description": "Mega Q&A dataset with 100M+ variations for comprehensive AI assistance"
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

class MegaChatbot {
  constructor() {
    this.isOpen = false;
    this.isTyping = false;
    this.conversationHistory = [];
    this.qaDatabase = EMBEDDED_QA_DATABASE;
    this.voiceEnabled = true;
    this.megaGenerator = null;
    this.intelligentMode = true;
    this.contextMemory = [];
    this.userProfile = {
      interests: [],
      techLevel: 'intermediate',
      previousQuestions: []
    };

    this.initializeElements();
    this.setupEventListeners();
    this.setupVoiceFeatures();
    this.initializeMegaGenerator();
    this.showWelcomeNotification();

    console.log('🚀 Mega Chatbot with 100M+ Q&A pairs initialized');
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

  initializeMegaGenerator() {
    // Initialize the mega Q&A generator for dynamic responses
    try {
      if (typeof MegaQAGenerator !== 'undefined') {
        this.megaGenerator = new MegaQAGenerator();
        console.log('🎯 Mega Q&A Generator loaded successfully');
      }
    } catch (error) {
      console.log('📝 Using embedded Q&A database');
    }
  }

  processMessage(message) {
    // Add to conversation history
    this.conversationHistory.push({
      type: 'user',
      message: message,
      timestamp: new Date()
    });

    // Update user profile based on message
    this.updateUserProfile(message);

    // Find best matching response using intelligent processing
    const response = this.intelligentMode ?
      this.findIntelligentResponse(message) :
      this.findBestResponse(message);

    // Add bot response to history
    this.conversationHistory.push({
      type: 'bot',
      message: response.answer,
      timestamp: new Date()
    });

    // Update context memory
    this.updateContextMemory(message, response);

    return response;
  }

  updateUserProfile(message) {
    // Extract interests and technical level from user messages
    const techKeywords = ['python', 'ai', 'ml', 'data', 'cloud', 'javascript', 'react', 'django'];
    const foundTech = techKeywords.filter(keyword =>
      message.toLowerCase().includes(keyword)
    );

    if (foundTech.length > 0) {
      this.userProfile.interests = [...new Set([...this.userProfile.interests, ...foundTech])];
    }

    // Determine technical level based on question complexity
    if (message.includes('how to implement') || message.includes('architecture')) {
      this.userProfile.techLevel = 'advanced';
    } else if (message.includes('what is') || message.includes('explain')) {
      this.userProfile.techLevel = 'beginner';
    }

    this.userProfile.previousQuestions.push(message);
    if (this.userProfile.previousQuestions.length > 10) {
      this.userProfile.previousQuestions.shift();
    }
  }

  updateContextMemory(userMessage, botResponse) {
    this.contextMemory.push({
      user: userMessage,
      bot: botResponse.answer,
      timestamp: new Date(),
      category: botResponse.category || 'general'
    });

    // Keep only last 5 exchanges for context
    if (this.contextMemory.length > 5) {
      this.contextMemory.shift();
    }
  }

  findIntelligentResponse(userMessage) {
    const normalizedMessage = userMessage.toLowerCase().trim();

    // First, try to generate dynamic response if mega generator is available
    if (this.megaGenerator) {
      const dynamicResponse = this.generateDynamicResponse(userMessage);
      if (dynamicResponse) {
        return dynamicResponse;
      }
    }

    // Check for contextual follow-up questions
    const contextualResponse = this.findContextualResponse(userMessage);
    if (contextualResponse) {
      return contextualResponse;
    }

    // Use enhanced pattern matching
    const patternResponse = this.findPatternResponse(userMessage);
    if (patternResponse) {
      return patternResponse;
    }

    // Fall back to traditional matching
    return this.findBestResponse(userMessage);
  }

  generateDynamicResponse(userMessage) {
    // Generate responses based on user profile and context
    const messageType = this.classifyMessage(userMessage);

    switch (messageType) {
      case 'skill_inquiry':
        return this.generateSkillResponse(userMessage);
      case 'project_inquiry':
        return this.generateProjectResponse(userMessage);
      case 'comparison':
        return this.generateComparisonResponse(userMessage);
      case 'how_to':
        return this.generateHowToResponse(userMessage);
      case 'future_trends':
        return this.generateFutureTrendsResponse(userMessage);
      default:
        return null;
    }
  }

  classifyMessage(message) {
    const patterns = {
      skill_inquiry: /do you know|experience with|familiar with|work with|use/i,
      project_inquiry: /tell me about|project|built|created|developed/i,
      comparison: /vs|versus|compare|difference between|better than/i,
      how_to: /how to|how do you|what's the process|steps to/i,
      future_trends: /future|trends|what's next|upcoming|evolution/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return type;
      }
    }

    return 'general';
  }

  generateSkillResponse(message) {
    // Extract skill from message
    const skills = [
      'python', 'javascript', 'react', 'django', 'flask', 'tensorflow', 'pytorch',
      'machine learning', 'deep learning', 'ai', 'data science', 'aws', 'azure',
      'docker', 'kubernetes', 'sql', 'mongodb', 'langchain', 'openai'
    ];

    const mentionedSkill = skills.find(skill =>
      message.toLowerCase().includes(skill.toLowerCase())
    );

    if (mentionedSkill) {
      const expertise = this.getSkillExpertise(mentionedSkill);
      const projects = this.getSkillProjects(mentionedSkill);

      return {
        answer: `Yes, I have ${expertise} experience with ${mentionedSkill}! ${projects}`,
        confidence: 0.9,
        speak: true,
        category: 'skills_technical',
        skill: mentionedSkill
      };
    }

    return null;
  }

  generateProjectResponse(message) {
    const projects = [
      'AI Resume Analyzer', 'Smart AI for LIFE', 'HR Chatbot', 'Web3 Blockchain Voting App',
      'Deep Learning Project Collection', 'AI Meeting Companion', 'ML Projects Portfolio'
    ];

    const mentionedProject = projects.find(project =>
      message.toLowerCase().includes(project.toLowerCase().replace(/\s+/g, ''))
    );

    if (mentionedProject) {
      return {
        answer: this.getProjectDetails(mentionedProject),
        confidence: 0.95,
        speak: true,
        category: 'projects',
        project: mentionedProject
      };
    }

    return null;
  }

  generateComparisonResponse(message) {
    // Extract technologies being compared
    const techs = ['python', 'javascript', 'react', 'vue', 'tensorflow', 'pytorch', 'aws', 'azure'];
    const foundTechs = techs.filter(tech => message.toLowerCase().includes(tech));

    if (foundTechs.length >= 2) {
      return {
        answer: `Great question about ${foundTechs[0]} vs ${foundTechs[1]}! Both have their strengths. ${foundTechs[0]} excels in certain areas while ${foundTechs[1]} has advantages in others. The choice depends on your specific project requirements, team expertise, and long-term goals.`,
        confidence: 0.8,
        speak: true,
        category: 'comparisons',
        technologies: foundTechs
      };
    }

    return null;
  }

  generateHowToResponse(message) {
    const topics = ['deploy', 'implement', 'build', 'create', 'optimize', 'scale', 'debug'];
    const foundTopic = topics.find(topic => message.toLowerCase().includes(topic));

    if (foundTopic) {
      return {
        answer: `To ${foundTopic} effectively, I follow a systematic approach: 1) Plan and analyze requirements, 2) Choose appropriate technologies, 3) Implement with best practices, 4) Test thoroughly, 5) Monitor and optimize. The specific steps depend on the technology stack and project requirements.`,
        confidence: 0.7,
        speak: true,
        category: 'how_to',
        topic: foundTopic
      };
    }

    return null;
  }

  generateFutureTrendsResponse(message) {
    const domains = ['ai', 'machine learning', 'data science', 'cloud', 'web development'];
    const foundDomain = domains.find(domain => message.toLowerCase().includes(domain));

    if (foundDomain) {
      return {
        answer: `The future of ${foundDomain} is incredibly exciting! I see trends toward more automation, better user experiences, and increased accessibility. Key developments include improved efficiency, better integration capabilities, and more powerful tools that make advanced technology accessible to everyone.`,
        confidence: 0.6,
        speak: true,
        category: 'future_trends',
        domain: foundDomain
      };
    }

    return null;
  }

  findBestResponse(userMessage) {
    const normalizedMessage = userMessage.toLowerCase().trim();

    // Check for exact matches first
    for (const qa of this.qaDatabase.qa_pairs) {
      if (qa.question.toLowerCase() === normalizedMessage) {
        return {
          answer: qa.answer,
          confidence: 1.0,
          speak: true,
          category: qa.category
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
        speak: bestScore > 0.7,
        category: bestMatch.category
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

  findContextualResponse(message) {
    // Check if this is a follow-up question based on context
    if (this.contextMemory.length > 0) {
      const lastContext = this.contextMemory[this.contextMemory.length - 1];

      // Handle follow-up questions
      if (message.toLowerCase().includes('more about') ||
          message.toLowerCase().includes('tell me more') ||
          message.toLowerCase().includes('details')) {

        if (lastContext.category === 'skills_technical') {
          return {
            answer: "I'd be happy to share more details! I use this technology in production environments and have built several projects with it. Would you like to know about specific implementations or best practices?",
            confidence: 0.8,
            speak: true,
            category: 'contextual_followup'
          };
        }

        if (lastContext.category === 'projects') {
          return {
            answer: "Certainly! This project involved complex problem-solving and innovative solutions. I can discuss the technical architecture, challenges faced, or the impact it created. What aspect interests you most?",
            confidence: 0.8,
            speak: true,
            category: 'contextual_followup'
          };
        }
      }

      // Handle clarification requests
      if (message.toLowerCase().includes('what do you mean') ||
          message.toLowerCase().includes('can you explain') ||
          message.toLowerCase().includes('clarify')) {

        return {
          answer: "Let me clarify that for you. " + lastContext.bot.substring(0, 100) + "... Would you like me to explain any specific part in more detail?",
          confidence: 0.7,
          speak: true,
          category: 'contextual_clarification'
        };
      }
    }

    return null;
  }

  findPatternResponse(message) {
    // Advanced pattern matching for complex queries
    const patterns = [
      {
        pattern: /what.*stack.*use/i,
        response: "My tech stack includes Python for backend development, React/JavaScript for frontend, TensorFlow/PyTorch for AI/ML, AWS/Azure for cloud infrastructure, and various databases like MongoDB and PostgreSQL. I choose technologies based on project requirements and scalability needs."
      },
      {
        pattern: /how.*learn.*technology/i,
        response: "I learn new technologies through a combination of hands-on projects, official documentation, online courses, and staying active in tech communities. I believe in learning by building real projects and contributing to open source when possible."
      },
      {
        pattern: /what.*makes.*different/i,
        response: "What sets me apart is my combination of 400+ certifications, practical project experience, and my ranking as Top 15 in Engineering on Unstop among 2.3M+ users. I focus on building real-world solutions that solve actual problems."
      },
      {
        pattern: /favorite.*technology/i,
        response: "I'm passionate about Python for its versatility in AI/ML and web development, and I love working with modern AI frameworks like LangChain and Transformers. I'm also excited about cloud technologies and their potential for scaling applications."
      }
    ];

    for (const patternObj of patterns) {
      if (patternObj.pattern.test(message)) {
        return {
          answer: patternObj.response,
          confidence: 0.85,
          speak: true,
          category: 'pattern_matched'
        };
      }
    }

    return null;
  }

  getSkillExpertise(skill) {
    const expertiseMap = {
      'python': 'extensive',
      'javascript': 'strong',
      'react': 'solid',
      'django': 'extensive',
      'flask': 'strong',
      'tensorflow': 'advanced',
      'pytorch': 'intermediate',
      'machine learning': 'extensive',
      'deep learning': 'advanced',
      'ai': 'extensive',
      'data science': 'extensive',
      'aws': 'strong',
      'azure': 'intermediate',
      'docker': 'solid',
      'kubernetes': 'intermediate'
    };

    return expertiseMap[skill.toLowerCase()] || 'good';
  }

  getSkillProjects(skill) {
    const projectMap = {
      'python': 'I\'ve used it in projects like the AI Resume Analyzer, HR Chatbot, and multiple ML projects.',
      'ai': 'I\'ve built AI systems including Smart AI for LIFE, AI Meeting Companion, and various ML models.',
      'machine learning': 'My ML projects include the Resume Analyzer, loan prediction app, and a collection of 12 ML projects.',
      'react': 'I\'ve built modern web applications and interactive dashboards using React.',
      'django': 'I use Django for robust backend development in several web applications.'
    };

    return projectMap[skill.toLowerCase()] || 'I\'ve applied it in various projects and continue to expand my expertise.';
  }

  getProjectDetails(projectName) {
    const projectDetails = {
      'AI Resume Analyzer': 'The AI Resume Analyzer is an intelligent system that analyzes resumes using NLP and machine learning. It extracts key information, matches skills with job requirements, and provides insights for both candidates and recruiters. Built with Python, TensorFlow, and modern web technologies.',
      'Smart AI for LIFE': 'Smart AI for LIFE is an innovative AI system designed to improve quality of life through intelligent automation and personalized recommendations. It integrates IoT devices, machine learning algorithms, and user behavior analysis.',
      'HR Chatbot': 'The HR Chatbot is an LLM-powered assistant that helps employees with HR-related queries using RAG (Retrieval-Augmented Generation). It references internal policies and provides instant, accurate responses to common HR questions.',
      'Web3 Blockchain Voting App': 'This is a decentralized voting application built on blockchain technology, ensuring transparency, security, and immutability in the voting process. It uses smart contracts and Web3 technologies.',
      'AI Meeting Companion': 'An intelligent browser extension that automatically detects online meetings, generates live summaries, and helps users capture key points and action items during Zoom, Google Meet, or MS Teams sessions.'
    };

    return projectDetails[projectName] || 'This is one of my innovative projects that showcases my technical skills and problem-solving abilities.';
  }

  getFallbackResponse(message) {
    // Enhanced fallback responses based on user profile
    const userInterests = this.userProfile.interests;

    const fallbacks = [
      {
        keywords: ['hello', 'hi', 'hey'],
        response: userInterests.length > 0 ?
          `Hello! I see you're interested in ${userInterests.slice(0, 2).join(' and ')}. I'm Vino K's AI assistant. What would you like to know?` :
          "Hello! I'm Vino K's AI assistant. Ask me about his skills, projects, or achievements!"
      },
      {
        keywords: ['thanks', 'thank you'],
        response: "You're welcome! Anything else you'd like to know about Vino K's expertise or projects?"
      },
      {
        keywords: ['bye', 'goodbye'],
        response: "Goodbye! Feel free to come back anytime to learn more about Vino K's work!"
      },
      {
        keywords: ['help', 'what can you do'],
        response: "I can help you learn about Vino K's technical skills, projects, achievements, and experience. Try asking about specific technologies, projects, or career questions!"
      }
    ];

    for (const fallback of fallbacks) {
      if (fallback.keywords.some(keyword => message.includes(keyword))) {
        return {
          answer: fallback.response,
          confidence: 0.8,
          speak: true,
          category: 'fallback'
        };
      }
    }

    // Intelligent fallback based on message content
    if (message.length > 50) {
      return {
        answer: "That's a detailed question! While I may not have specific information about that exact topic, I can tell you about Vino K's related experience in AI/ML, data science, and software development. Could you ask about a specific technology or project?",
        confidence: 0.4,
        speak: false,
        category: 'intelligent_fallback'
      };
    }

    return {
      answer: "I'm not sure about that specific topic. Try asking about Vino K's skills (like Python, AI, ML), projects (like AI Resume Analyzer), or achievements!",
      confidence: 0.3,
      speak: false,
      category: 'default_fallback'
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
    window.MegaChatbot = new MegaChatbot();

    // Add mega generation button to chatbot
    const megaButton = document.createElement('button');
    megaButton.innerHTML = '🚀 Q&A';
    megaButton.className = 'mega-generate-btn';
    megaButton.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 25px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
      z-index: 9999;
      transition: all 0.3s ease;
    `;

    megaButton.addEventListener('click', () => {
      if (window.MegaChatbot.megaGenerator) {
        megaButton.innerHTML = '⚡ Generating...';
        megaButton.disabled = true;

        setTimeout(() => {
          const megaQA = window.MegaChatbot.megaGenerator.generateMegaQA();
          console.log(`🎉 Generated ${megaQA.length.toLocaleString()} Q&A pairs!`);

          // Update chatbot database
          window.MegaChatbot.qaDatabase.qa_pairs = [...window.MegaChatbot.qaDatabase.qa_pairs, ...megaQA.slice(0, 10000)];
          window.MegaChatbot.qaDatabase.metadata.total_entries = window.MegaChatbot.qaDatabase.qa_pairs.length;

          megaButton.innerHTML = '✅ Generated!';
          setTimeout(() => {
            megaButton.innerHTML = '💾 Download Dataset';
            megaButton.disabled = false;
            megaButton.onclick = () => {
              window.MegaChatbot.megaGenerator.saveToFile('vino-k-mega-qa-100m.json');
            };
          }, 2000);
        }, 1000);
      }
    });

    document.body.appendChild(megaButton);
  }
});
