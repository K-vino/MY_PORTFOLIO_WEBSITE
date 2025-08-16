// ===== DATABASE SEEDER =====

const mongoose = require('mongoose');
const Project = require('./models/Project');
require('dotenv').config();

// Sample project data based on your profile
const sampleProjects = [
  {
    title: 'AI Resume Analyzer',
    description: 'NLP-based resume parser with ATS keyword matching using Python and Streamlit. Helps job seekers optimize their resumes for better ATS compatibility.',
    longDescription: 'A comprehensive AI-powered resume analysis tool that uses Natural Language Processing to parse resumes and match them against job descriptions. The system provides detailed feedback on keyword optimization, formatting suggestions, and ATS compatibility scores. Built with Python, Streamlit for the frontend, and various NLP libraries for text processing.',
    technologies: ['Python', 'NLP', 'Streamlit', 'Machine Learning', 'Pandas', 'NLTK', 'Scikit-learn'],
    category: 'AI/ML',
    status: 'Completed',
    priority: 9,
    featured: true,
    githubUrl: 'https://github.com/K-vino/ai-resume-analyzer',
    liveUrl: 'https://ai-resume-analyzer.streamlit.app',
    icon: 'brain',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-03-20'),
    duration: '2 months',
    teamSize: 1,
    myRole: 'Full Stack Developer',
    challenges: [
      'Parsing different resume formats (PDF, DOCX, TXT)',
      'Implementing accurate keyword matching algorithms',
      'Creating an intuitive user interface for complex analysis'
    ],
    solutions: [
      'Used multiple parsing libraries for different file formats',
      'Implemented TF-IDF and cosine similarity for keyword matching',
      'Designed a clean Streamlit interface with progress indicators'
    ],
    learnings: [
      'Advanced NLP techniques for text processing',
      'Streamlit framework for rapid prototyping',
      'Resume parsing and ATS optimization strategies'
    ],
    features: [
      'Multi-format resume parsing',
      'ATS compatibility scoring',
      'Keyword optimization suggestions',
      'Skills gap analysis',
      'Industry-specific recommendations'
    ],
    tags: ['nlp', 'resume', 'ats', 'job-search', 'python'],
    metrics: {
      views: 1250,
      likes: 89,
      stars: 45
    }
  },
  {
    title: 'Smart AI for LIFE',
    description: 'AI assistant automating tasks with Python and voice commands. Integrates multiple APIs to provide intelligent automation for daily tasks.',
    longDescription: 'An intelligent personal assistant that combines voice recognition, natural language processing, and API integrations to automate daily tasks. The system can handle calendar management, email automation, weather updates, news briefings, and smart home control through voice commands.',
    technologies: ['Python', 'AI', 'Voice Recognition', 'Automation', 'APIs', 'Speech-to-Text', 'TensorFlow'],
    category: 'AI/ML',
    status: 'Completed',
    priority: 8,
    featured: true,
    githubUrl: 'https://github.com/K-vino/smart-ai-life',
    icon: 'robot',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-06-15'),
    duration: '2.5 months',
    teamSize: 1,
    myRole: 'AI Developer',
    challenges: [
      'Accurate voice recognition in noisy environments',
      'Integrating multiple third-party APIs',
      'Creating natural conversation flows'
    ],
    solutions: [
      'Implemented noise reduction algorithms',
      'Built a unified API gateway for service integration',
      'Used context-aware dialogue management'
    ],
    learnings: [
      'Voice recognition and speech processing',
      'API integration and management',
      'Conversational AI design patterns'
    ],
    features: [
      'Voice command recognition',
      'Task automation',
      'Calendar integration',
      'Weather and news updates',
      'Smart home control'
    ],
    tags: ['ai', 'voice-assistant', 'automation', 'python', 'smart-home'],
    metrics: {
      views: 980,
      likes: 67,
      stars: 32
    }
  },
  {
    title: 'Expense Tracker',
    description: 'Full-stack budgeting app with Node.js, Express, MongoDB, and REST API. Features real-time expense tracking and budget management.',
    longDescription: 'A comprehensive expense tracking application built with modern web technologies. Users can track expenses, set budgets, categorize transactions, and view detailed analytics. The app features real-time updates, data visualization, and export capabilities.',
    technologies: ['Node.js', 'Express', 'MongoDB', 'REST API', 'JavaScript', 'Chart.js', 'Bootstrap'],
    category: 'Web Development',
    status: 'Completed',
    priority: 7,
    featured: true,
    githubUrl: 'https://github.com/K-vino/expense-tracker',
    liveUrl: 'https://expense-tracker-vino.herokuapp.com',
    icon: 'chart-line',
    startDate: new Date('2024-02-10'),
    endDate: new Date('2024-04-05'),
    duration: '2 months',
    teamSize: 1,
    myRole: 'Full Stack Developer',
    challenges: [
      'Real-time data synchronization',
      'Complex budget calculations',
      'Data visualization for financial insights'
    ],
    solutions: [
      'Implemented WebSocket for real-time updates',
      'Created efficient aggregation pipelines in MongoDB',
      'Used Chart.js for interactive data visualization'
    ],
    learnings: [
      'Full-stack JavaScript development',
      'MongoDB aggregation framework',
      'Financial data modeling and analysis'
    ],
    features: [
      'Expense categorization',
      'Budget setting and tracking',
      'Real-time analytics',
      'Data export functionality',
      'Multi-currency support'
    ],
    tags: ['nodejs', 'mongodb', 'expense-tracking', 'budgeting', 'finance'],
    metrics: {
      views: 756,
      likes: 54,
      stars: 28
    }
  },
  {
    title: 'Web3 Blockchain Voting App',
    description: 'Decentralized voting application built with blockchain technology. Ensures transparent and secure voting with smart contracts.',
    longDescription: 'A decentralized voting platform leveraging blockchain technology to ensure transparent, secure, and tamper-proof elections. The application uses smart contracts for vote management and provides a user-friendly interface for voters and administrators.',
    technologies: ['Blockchain', 'Web3', 'Smart Contracts', 'JavaScript', 'Solidity', 'Ethereum', 'React'],
    category: 'Blockchain',
    status: 'Completed',
    priority: 8,
    featured: true,
    githubUrl: 'https://github.com/K-vino/blockchain-voting',
    demoUrl: 'https://blockchain-voting-demo.netlify.app',
    icon: 'vote-yea',
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-07-20'),
    duration: '3 months',
    teamSize: 2,
    myRole: 'Blockchain Developer',
    challenges: [
      'Smart contract security and optimization',
      'Gas fee optimization',
      'User experience for non-crypto users'
    ],
    solutions: [
      'Implemented comprehensive security audits',
      'Optimized contract code for lower gas costs',
      'Created intuitive UI with Web3 wallet integration'
    ],
    learnings: [
      'Blockchain development and smart contracts',
      'Web3 integration and wallet connectivity',
      'Decentralized application architecture'
    ],
    features: [
      'Secure blockchain voting',
      'Smart contract automation',
      'Real-time vote counting',
      'Transparent audit trail',
      'Multi-candidate support'
    ],
    tags: ['blockchain', 'web3', 'voting', 'smart-contracts', 'ethereum'],
    metrics: {
      views: 1100,
      likes: 78,
      stars: 41
    }
  },
  {
    title: 'Data Science Portfolio Dashboard',
    description: 'Interactive dashboard showcasing data science projects with Python, Pandas, and visualization libraries.',
    longDescription: 'A comprehensive dashboard that showcases various data science projects and analyses. Features interactive visualizations, machine learning model demonstrations, and real-time data processing capabilities.',
    technologies: ['Python', 'Pandas', 'Matplotlib', 'Seaborn', 'Plotly', 'Streamlit', 'Scikit-learn'],
    category: 'Data Science',
    status: 'In Progress',
    priority: 6,
    featured: false,
    githubUrl: 'https://github.com/K-vino/data-science-dashboard',
    icon: 'chart-bar',
    startDate: new Date('2024-08-01'),
    duration: '3 months',
    teamSize: 1,
    myRole: 'Data Scientist',
    challenges: [
      'Handling large datasets efficiently',
      'Creating interactive visualizations',
      'Real-time data processing'
    ],
    features: [
      'Interactive data visualizations',
      'Machine learning model demos',
      'Real-time analytics',
      'Data export capabilities'
    ],
    tags: ['data-science', 'visualization', 'python', 'analytics', 'dashboard'],
    metrics: {
      views: 420,
      likes: 31,
      stars: 18
    }
  },
  {
    title: 'Cloud Infrastructure Automation',
    description: 'AWS and Azure infrastructure automation using Terraform and Python scripts for scalable cloud deployments.',
    longDescription: 'A comprehensive infrastructure-as-code solution for automating cloud deployments across AWS and Azure. Includes monitoring, scaling, and cost optimization features.',
    technologies: ['AWS', 'Azure', 'Terraform', 'Python', 'Docker', 'Kubernetes', 'CI/CD'],
    category: 'Cloud Computing',
    status: 'Completed',
    priority: 7,
    featured: false,
    githubUrl: 'https://github.com/K-vino/cloud-automation',
    icon: 'cloud',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-05-30'),
    duration: '2.5 months',
    teamSize: 1,
    myRole: 'Cloud Engineer',
    challenges: [
      'Multi-cloud compatibility',
      'Cost optimization',
      'Security compliance'
    ],
    features: [
      'Multi-cloud deployment',
      'Automated scaling',
      'Cost monitoring',
      'Security compliance checks'
    ],
    tags: ['aws', 'azure', 'terraform', 'cloud', 'automation'],
    metrics: {
      views: 680,
      likes: 45,
      stars: 25
    }
  }
];

// Connect to database and seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vino_portfolio');
    console.log('✅ Connected to MongoDB');

    // Clear existing projects
    await Project.deleteMany({});
    console.log('🗑️  Cleared existing projects');

    // Insert sample projects
    const insertedProjects = await Project.insertMany(sampleProjects);
    console.log(`✅ Inserted ${insertedProjects.length} sample projects`);

    // Display inserted projects
    console.log('\n📊 Inserted Projects:');
    insertedProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title} (${project.category})`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeder if called directly
if (require.main === module) {
  console.log('🌱 Starting database seeding...');
  seedDatabase();
}

module.exports = { sampleProjects, seedDatabase };
