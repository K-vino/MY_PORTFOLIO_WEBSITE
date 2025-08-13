import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://vino-k.dev', 'https://www.vino-k.dev']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('⚠️  MONGODB_URI not set - running without database');
      return false;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Running without database - some features will be limited');
    return false;
  }
};

// Connect to database
const dbConnected = await connectDB();

// Import models
import Project from './models/Project.js';
import Message from './models/Message.js';
import Experience from './models/Experience.js';
import Achievement from './models/Achievement.js';

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 chat requests per minute
  message: {
    error: 'Too many chat requests, please slow down.'
  }
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);
app.use('/api/chat', chatLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes

// Get all projects with optional filtering
app.get('/api/projects', async (req, res) => {
  try {
    if (!dbConnected) {
      // Return sample data when database is not connected
      const sampleProjects = [
        {
          _id: '1',
          title: 'AI Resume Analyzer',
          slug: 'ai-resume-analyzer',
          shortDesc: 'NLP-based resume parser with ATS keyword scoring and semantic matching',
          tags: ['AI/ML', 'NLP', 'Streamlit', 'Python'],
          repoUrl: 'https://github.com/K-vino/AI-Resume-Analyzer-Project',
          featured: true
        },
        {
          _id: '2',
          title: 'Smart AI for LIFE',
          slug: 'smart-ai-for-life',
          shortDesc: 'Voice-activated AI assistant for SEO-driven web queries',
          tags: ['AI/ML', 'Voice', 'Python', 'SEO'],
          featured: true
        },
        {
          _id: '3',
          title: 'ai-meeting-companion',
          slug: 'ai-meeting-companion',
          shortDesc: 'Browser extension for real-time meeting summaries',
          tags: ['Extension', 'TypeScript', 'AI/ML'],
          repoUrl: 'https://github.com/K-vino/ai-meeting-companion',
          featured: true
        }
      ];

      let filteredProjects = sampleProjects;

      if (req.query.featured !== undefined) {
        filteredProjects = filteredProjects.filter(p => p.featured === (req.query.featured === 'true'));
      }

      if (req.query.tag) {
        filteredProjects = filteredProjects.filter(p => p.tags.includes(req.query.tag));
      }

      return res.json(filteredProjects);
    }

    const query = {};

    // Filter by featured status
    if (req.query.featured !== undefined) {
      query.featured = req.query.featured === 'true';
    }

    // Filter by tag
    if (req.query.tag) {
      query.tags = { $in: [req.query.tag] };
    }

    // Filter by tech stack
    if (req.query.tech) {
      query.techStack = { $in: [req.query.tech] };
    }

    const projects = await Project.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project by slug
app.get('/api/projects/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug }).lean();
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Get experiences
app.get('/api/experiences', async (req, res) => {
  try {
    const experiences = await Experience.find()
      .sort({ start: -1 })
      .lean();
    
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// Get achievements
app.get('/api/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.find()
      .sort({ date: -1 })
      .lean();
    
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, subject, honeypot } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Honeypot spam protection
    if (honeypot) {
      return res.status(400).json({ error: 'Spam detected' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Message length validation
    if (message.length < 10 || message.length > 2000) {
      return res.status(400).json({ error: 'Message must be between 10 and 2000 characters' });
    }

    // Save message to database
    const newMessage = new Message({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      source: req.headers.referer || req.headers.origin || 'direct'
    });

    await newMessage.save();

    // Send email notification if configured
    try {
      await sendEmailNotification({
        name: name.trim(),
        email: email.trim(),
        subject: subject?.trim() || 'New Portfolio Contact',
        message: message.trim()
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError.message);
      // Don't fail the request if email fails
    }

    console.log('New contact message:', {
      name,
      email,
      subject: subject || 'No subject',
      message: message.substring(0, 50) + '...'
    });

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error handling contact form:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Email notification function
async function sendEmailNotification({ name, email, subject, message }) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const receiveEmail = process.env.RECEIVE_EMAIL || emailUser;

  if (!emailUser || !emailPass) {
    console.log('Email not configured - skipping notification');
    return;
  }

  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.default.createTransporter({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  const mailOptions = {
    from: emailUser,
    to: receiveEmail,
    subject: `Portfolio Contact: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Sent from your portfolio website contact form
      </p>
    `,
    text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from your portfolio website contact form
    `
  };

  await transporter.sendMail(mailOptions);
  console.log('Email notification sent successfully');
}

// AI chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [] } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(503).json({
        error: 'AI service temporarily unavailable',
        reply: 'The AI chat is currently unavailable. Please contact Vino directly at vk5571850@gmail.com or connect via LinkedIn: linkedin.com/in/vino-k'
      });
    }

    // Load portfolio context
    const portfolioContext = await loadPortfolioContext();

    // Add system message with comprehensive context about Vino
    const systemMessage = {
      role: 'system',
      content: `You are Vino K's AI portfolio assistant. You represent Vino K and can answer questions about his background, skills, projects, experience, and achievements.

IMPORTANT GUIDELINES:
- Always respond as if you are representing Vino K professionally
- Be helpful, knowledgeable, and enthusiastic about his work
- Provide specific details when asked about projects or skills
- If asked about contact information, provide his email: vk5571850@gmail.com
- Keep responses concise but informative (max 200 words)
- If you don't know something specific, suggest contacting Vino directly

VINO'S INFORMATION:
${portfolioContext}

Answer questions about Vino's projects, skills, experience, education, achievements, and how to contact him. Be professional and showcase his expertise in AI/ML and Data Engineering.`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages.slice(-8)], // Keep last 8 messages for context
        max_tokens: 400,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'AI service error',
      reply: 'Sorry, I\'m having trouble connecting right now. Please try again later or contact Vino directly at vk5571850@gmail.com.'
    });
  }
});

// Load portfolio context for AI chat
async function loadPortfolioContext() {
  try {
    const fs = await import('fs');
    const path = await import('path');

    const contextPath = path.default.join(__dirname, 'data', 'portfolio-context.json');
    const contextData = JSON.parse(fs.default.readFileSync(contextPath, 'utf8'));

    // Format the context for the AI
    return `
NAME: ${contextData.personal.name}
TITLE: ${contextData.personal.title}
CONTACT: ${contextData.personal.email} | ${contextData.personal.phone}
LOCATION: ${contextData.personal.location}
LINKEDIN: ${contextData.personal.linkedin}
GITHUB: ${contextData.personal.github}

SUMMARY: ${contextData.summary}

SKILLS:
- Programming: ${contextData.skills.programming.join(', ')}
- AI/ML: ${contextData.skills.aiml.join(', ')}
- Data: ${contextData.skills.data.join(', ')}
- Web: ${contextData.skills.web.join(', ')}
- Cloud: ${contextData.skills.cloud.join(', ')}

CURRENT EXPERIENCE:
${contextData.experience.map(exp => `
- ${exp.role} at ${exp.company} (${exp.duration})
  ${exp.achievements.join('; ')}
`).join('')}

EDUCATION:
${contextData.education.map(edu => `
- ${edu.degree} from ${edu.institution} (${edu.duration})
`).join('')}

KEY PROJECTS:
${contextData.projects.map(project => `
- ${project.name}: ${project.description}
  Technologies: ${project.technologies.join(', ')}
  ${project.impact || ''}
`).join('')}

ACHIEVEMENTS:
${contextData.achievements.map(achievement => `
- ${achievement.title} (${achievement.organization}): ${achievement.description}
`).join('')}

AVAILABILITY: ${contextData.availability}
    `.trim();
  } catch (error) {
    console.error('Error loading portfolio context:', error);
    return 'Vino K is an AI/ML & Data Engineer with expertise in Python, TensorFlow, and data engineering. Contact: vk5571850@gmail.com';
  }
}

// Serve React/static files for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
});
