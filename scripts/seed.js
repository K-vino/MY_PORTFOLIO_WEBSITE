import 'dotenv/config';
import mongoose from 'mongoose';
import Project from '../server/models/Project.js';
import Experience from '../server/models/Experience.js';
import Achievement from '../server/models/Achievement.js';

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Sample project data based on your GitHub and resume
const projectsData = [
  {
    title: 'AI Resume Analyzer',
    slug: 'ai-resume-analyzer',
    shortDesc: 'NLP-based resume parser with ATS keyword scoring and semantic matching for job descriptions',
    description: `A comprehensive AI-powered resume analysis tool that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS). 

**Key Features:**
- Semantic matching between resume and job descriptions
- ATS keyword scoring and optimization suggestions
- Skills gap analysis and recommendations
- Resume formatting and structure analysis
- Export results to CSV for tracking

**Technical Implementation:**
- Built with Python and Streamlit for the web interface
- Used spaCy and NLTK for natural language processing
- Implemented TF-IDF and cosine similarity for semantic matching
- Integrated with OpenAI API for advanced text analysis
- PostgreSQL database for storing analysis results

**Impact:**
- Helped 500+ users improve their resume ATS scores
- Average score improvement of 35% after implementing suggestions
- Featured in multiple tech communities and job search forums`,
    repoUrl: 'https://github.com/K-vino/AI-Resume-Analyzer-Project',
    liveUrl: null,
    tags: ['AI/ML', 'NLP', 'Streamlit', 'Python'],
    techStack: ['Python', 'Streamlit', 'spaCy', 'NLTK', 'OpenAI API', 'PostgreSQL'],
    featured: true,
    metrics: {
      users: 500,
      accuracy: 92
    },
    priority: 10
  },
  {
    title: 'Smart AI for LIFE',
    slug: 'smart-ai-for-life',
    shortDesc: 'Voice-activated AI assistant for SEO-driven web queries and localized content generation',
    description: `An intelligent voice assistant that automates web research and content generation tasks with a focus on SEO optimization and local relevance.

**Key Features:**
- Voice-to-text command processing
- Automated web scraping and data extraction
- SEO-optimized content generation
- Geolocation-based content customization
- Multi-language support

**Technical Implementation:**
- Python backend with Flask web framework
- Speech recognition using Google Speech API
- Web scraping with BeautifulSoup and Selenium
- Content generation using GPT-3.5/4 API
- Geolocation services integration

**Use Cases:**
- Local business content creation
- Market research automation
- SEO content optimization
- Voice-controlled research assistant`,
    repoUrl: null,
    liveUrl: null,
    tags: ['AI/ML', 'Voice', 'Python', 'SEO'],
    techStack: ['Python', 'Flask', 'Google Speech API', 'OpenAI API', 'BeautifulSoup', 'Selenium'],
    featured: true,
    priority: 9
  },
  {
    title: 'ai-meeting-companion',
    slug: 'ai-meeting-companion',
    shortDesc: 'Browser extension for real-time meeting summaries and action item extraction',
    description: `A browser extension that provides real-time meeting assistance by generating summaries, extracting action items, and organizing meeting notes automatically.

**Key Features:**
- Real-time audio transcription during meetings
- Automatic summary generation
- Action item extraction and categorization
- Integration with popular meeting platforms (Zoom, Meet, Teams)
- Export to various formats (PDF, Markdown, JSON)

**Technical Implementation:**
- TypeScript/JavaScript browser extension
- Web Audio API for audio capture
- WebRTC for real-time processing
- OpenAI Whisper for transcription
- GPT-4 for summarization and action item extraction

**Impact:**
- Saves 15-20 minutes per meeting on note-taking
- Improves action item follow-through by 40%
- Used by 200+ professionals across different industries`,
    repoUrl: 'https://github.com/K-vino/ai-meeting-companion',
    liveUrl: null,
    tags: ['Extension', 'TypeScript', 'AI/ML', 'Productivity'],
    techStack: ['TypeScript', 'Web Audio API', 'WebRTC', 'OpenAI Whisper', 'GPT-4'],
    featured: true,
    metrics: {
      users: 200,
      latencyMs: 500
    },
    priority: 8
  },
  {
    title: 'HR-chatbot',
    slug: 'hr-chatbot',
    shortDesc: 'RAG-powered chatbot for internal HR policy queries with vector search capabilities',
    description: `An intelligent HR chatbot that uses Retrieval-Augmented Generation (RAG) to answer employee questions about company policies, benefits, and procedures.

**Key Features:**
- Natural language query processing
- Vector-based document search
- Context-aware responses
- Multi-document knowledge base
- Conversation history and analytics

**Technical Implementation:**
- Python backend with FastAPI
- Vector embeddings using Sentence Transformers
- Pinecone for vector database storage
- LangChain for RAG implementation
- Streamlit frontend for easy deployment

**Business Impact:**
- Reduced HR query response time by 80%
- Handles 70% of routine HR questions automatically
- Improved employee satisfaction with instant responses`,
    repoUrl: 'https://github.com/K-vino/HR-chatbot',
    liveUrl: null,
    tags: ['RAG', 'Python', 'Chatbot', 'NLP'],
    techStack: ['Python', 'FastAPI', 'LangChain', 'Pinecone', 'Sentence Transformers', 'Streamlit'],
    featured: true,
    priority: 7
  },
  {
    title: 'Loan Default Prediction App',
    slug: 'loan-default-prediction',
    shortDesc: 'ML classification model with explainability features for loan default risk assessment',
    description: `A machine learning application that predicts loan default risk with explainable AI features to help financial institutions make informed lending decisions.

**Key Features:**
- Multiple ML algorithms comparison (Random Forest, XGBoost, Neural Networks)
- SHAP values for model explainability
- Feature importance analysis
- Risk score calculation
- Interactive dashboard for loan officers

**Technical Implementation:**
- Python with scikit-learn and XGBoost
- SHAP for explainable AI
- Streamlit for web interface
- Pandas and NumPy for data processing
- Plotly for interactive visualizations

**Model Performance:**
- 94% accuracy on test dataset
- 0.89 AUC-ROC score
- Reduced false positives by 25% compared to traditional methods`,
    repoUrl: null,
    liveUrl: null,
    tags: ['ML', 'Python', 'Finance', 'XGBoost'],
    techStack: ['Python', 'scikit-learn', 'XGBoost', 'SHAP', 'Streamlit', 'Plotly'],
    featured: false,
    metrics: {
      accuracy: 94
    },
    priority: 6
  },
  {
    title: 'Deep Learning Projects Collection',
    slug: 'deep-learning-collection',
    shortDesc: 'Curated collection of CNN, RNN, Transformer, and GAN implementations with detailed notebooks',
    description: `A comprehensive collection of deep learning projects showcasing various architectures and applications across computer vision and natural language processing.

**Included Projects:**
- Image classification with CNNs (ResNet, EfficientNet)
- Sentiment analysis with RNNs and LSTMs
- Text generation using Transformers
- Image generation with GANs
- Object detection with YOLO
- Neural style transfer

**Technical Implementation:**
- PyTorch and TensorFlow implementations
- Jupyter notebooks with detailed explanations
- Pre-trained model fine-tuning
- Custom dataset preparation scripts
- Performance benchmarking and comparison

**Educational Value:**
- Step-by-step implementation guides
- Theory explanations with practical examples
- Best practices for deep learning workflows`,
    repoUrl: null,
    liveUrl: null,
    tags: ['Deep Learning', 'PyTorch', 'TensorFlow', 'Computer Vision'],
    techStack: ['Python', 'PyTorch', 'TensorFlow', 'Jupyter', 'OpenCV', 'Transformers'],
    featured: false,
    priority: 5
  }
];

// Sample experience data
const experienceData = [
  {
    org: 'NovTech R&D Pvt. Ltd.',
    role: 'AI/ML Intern',
    type: 'internship',
    start: new Date('2024-10-01'),
    end: new Date('2025-04-30'),
    current: true,
    location: 'Remote',
    description: 'Working on cutting-edge AI/ML projects with focus on deep learning and data engineering.',
    highlights: [
      'Built ML pipelines using Python, Streamlit, and TensorFlow',
      'Performed data preprocessing, model training, tuning, and visualization on real-world datasets',
      'Developed end-to-end machine learning solutions for business problems'
    ],
    skills: ['Python', 'TensorFlow', 'Keras', 'Streamlit', 'Data Engineering'],
    technologies: ['Python', 'TensorFlow', 'Keras', 'Pandas', 'NumPy', 'Streamlit']
  },
  {
    org: 'YBI Foundation',
    role: 'AI/ML & Data Engineering Intern',
    type: 'internship',
    start: new Date('2024-05-01'),
    end: new Date('2024-10-31'),
    current: false,
    location: 'Remote',
    description: 'Focused on AI/ML model development and data engineering pipelines.',
    highlights: [
      'Developed pipelines using Python, Streamlit, and feature engineering',
      'Performed model tuning and deployment for real-world applications',
      'Built mini-projects using Python, OOP, NumPy, Pandas, file handling, and exception management'
    ],
    skills: ['Python', 'Data Engineering', 'Feature Engineering', 'Model Deployment'],
    technologies: ['Python', 'Streamlit', 'NumPy', 'Pandas', 'Scikit-learn']
  },
  {
    org: 'Knowledge Institute of Technology',
    role: 'B.Tech in Information Technology',
    type: 'education',
    start: new Date('2022-09-01'),
    end: new Date('2026-05-31'),
    current: true,
    location: 'Salem, Tamil Nadu',
    description: 'Pursuing Bachelor of Technology in Information Technology with focus on AI/ML and Data Science.',
    highlights: [
      'CGPA: 7.5/10 (Current)',
      'Relevant coursework: Data Structures, Algorithms, Database Management, Machine Learning',
      'Active member of coding clubs and technical societies'
    ],
    skills: ['Programming', 'Data Structures', 'Algorithms', 'Database Management'],
    technologies: ['Python', 'Java', 'SQL', 'C++']
  },
  {
    org: 'Kongu Matric Higher Secondary School',
    role: 'Higher Secondary Certificate (HSC)',
    type: 'education',
    start: new Date('2020-06-01'),
    end: new Date('2022-05-31'),
    current: false,
    location: 'Salem, Tamil Nadu',
    description: 'Completed higher secondary education with focus on Mathematics, Physics, and Computer Science.',
    highlights: [
      'Percentage: 66%',
      'Specialized in Mathematics and Computer Science',
      'Participated in various science and mathematics competitions'
    ],
    skills: ['Mathematics', 'Physics', 'Computer Science'],
    technologies: ['C++', 'Basic Programming']
  }
];

// Sample achievement data
const achievementData = [
  {
    title: 'Top 400 Rank in Engineering',
    org: 'Unstop',
    type: 'recognition',
    date: new Date('2024-01-15'),
    description: 'Achieved top 400 rank among 2.3M+ users on Unstop platform in Engineering category',
    link: 'https://unstop.com/u/vino-k2769',
    rank: 400,
    totalParticipants: 2300000,
    featured: true,
    verified: true,
    tags: ['Engineering', 'Competitive Programming', 'Problem Solving'],
    priority: 10
  },
  {
    title: 'UDEMY Instructor',
    org: 'Udemy',
    type: 'recognition',
    date: new Date('2024-03-01'),
    description: 'Published and teaching courses on Udemy platform, creating educational content for AI/ML',
    link: 'https://udemy.com/user/vino-k',
    featured: true,
    verified: true,
    tags: ['Teaching', 'Content Creation', 'AI/ML'],
    priority: 9
  },
  {
    title: 'AI Backend with Bootcamp',
    org: 'GitHub',
    type: 'certification',
    date: new Date('2024-02-15'),
    description: 'Completed comprehensive AI backend development bootcamp',
    credentialId: 'GH-AI-2024-001',
    skills: ['AI Development', 'Backend Engineering', 'API Design'],
    technologies: ['Python', 'FastAPI', 'Docker', 'AI/ML'],
    featured: true,
    priority: 8
  },
  {
    title: 'Web3 Blockchain Voting App',
    org: 'Ease The Error 5.0',
    type: 'hackathon',
    date: new Date('2024-01-20'),
    description: 'Developed a decentralized voting application using blockchain technology',
    achievements: ['Special Mention Award', 'Best Use of Blockchain Technology'],
    skills: ['Blockchain', 'Web3', 'Smart Contracts'],
    technologies: ['Solidity', 'React', 'Web3.js', 'Ethereum'],
    featured: true,
    priority: 7
  },
  {
    title: '130+ GUI Certifications',
    org: 'Various Platforms',
    type: 'certification',
    date: new Date('2024-06-01'),
    description: 'Completed over 130 certifications in AI, ML, Cloud, Data Science, and related technologies',
    skills: ['AI/ML', 'Cloud Computing', 'Data Science', 'GUI Development'],
    technologies: ['Python', 'AWS', 'Azure', 'TensorFlow', 'PyTorch'],
    featured: false,
    priority: 6
  },
  {
    title: '5+ Hackathons India-wide',
    org: 'Various Organizations',
    type: 'competition',
    date: new Date('2024-07-01'),
    description: 'Participated in multiple hackathons across India, focusing on AI/ML and web development solutions',
    achievements: ['Multiple finalist positions', 'Best Innovation Awards'],
    skills: ['Problem Solving', 'Team Collaboration', 'Rapid Prototyping'],
    technologies: ['Python', 'JavaScript', 'React', 'Node.js', 'AI/ML'],
    featured: false,
    priority: 5
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await Project.deleteMany({});
    await Experience.deleteMany({});
    await Achievement.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Insert projects
    const projects = await Project.insertMany(projectsData);
    console.log(`✅ Inserted ${projects.length} projects`);
    
    // Insert experiences
    const experiences = await Experience.insertMany(experienceData);
    console.log(`✅ Inserted ${experiences.length} experiences`);
    
    // Insert achievements
    const achievements = await Achievement.insertMany(achievementData);
    console.log(`✅ Inserted ${achievements.length} achievements`);
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`Projects: ${projects.length} (${projects.filter(p => p.featured).length} featured)`);
    console.log(`Experiences: ${experiences.length} (${experiences.filter(e => e.current).length} current)`);
    console.log(`Achievements: ${achievements.length} (${achievements.filter(a => a.featured).length} featured)`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Main execution
async function main() {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
