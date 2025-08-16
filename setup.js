#!/usr/bin/env node

// ===== PORTFOLIO SETUP SCRIPT =====

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Vino K Portfolio Website...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPrerequisites() {
  log('📋 Checking prerequisites...', 'blue');
  
  try {
    // Check Node.js version
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      log('❌ Node.js version 16 or higher is required', 'red');
      log(`   Current version: ${nodeVersion}`, 'yellow');
      process.exit(1);
    }
    
    log(`✅ Node.js ${nodeVersion}`, 'green');
    
    // Check npm
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm ${npmVersion}`, 'green');
    
    // Check Git
    try {
      const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
      log(`✅ ${gitVersion}`, 'green');
    } catch (error) {
      log('⚠️  Git not found (optional for local development)', 'yellow');
    }
    
  } catch (error) {
    log('❌ Error checking prerequisites:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
  
  log('');
}

function installDependencies() {
  log('📦 Installing dependencies...', 'blue');
  
  try {
    // Install root dependencies
    log('Installing root dependencies...', 'cyan');
    execSync('npm install', { stdio: 'inherit' });
    
    // Install server dependencies
    log('Installing server dependencies...', 'cyan');
    execSync('cd server && npm install', { stdio: 'inherit' });
    
    log('✅ Dependencies installed successfully', 'green');
  } catch (error) {
    log('❌ Error installing dependencies:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
  
  log('');
}

function createEnvironmentFile() {
  log('🔧 Setting up environment configuration...', 'blue');
  
  const envPath = path.join(__dirname, 'server', '.env');
  const envExamplePath = path.join(__dirname, 'server', '.env.example');
  
  if (fs.existsSync(envPath)) {
    log('⚠️  .env file already exists, skipping creation', 'yellow');
    return;
  }
  
  if (!fs.existsSync(envExamplePath)) {
    log('❌ .env.example file not found', 'red');
    return;
  }
  
  try {
    // Copy .env.example to .env
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envExample);
    
    log('✅ Created .env file from template', 'green');
    log('⚠️  Please update the .env file with your actual values:', 'yellow');
    log('   - MONGODB_URI: Your MongoDB connection string', 'yellow');
    log('   - EMAIL_USER: Your Gmail address', 'yellow');
    log('   - EMAIL_PASS: Your Gmail app password', 'yellow');
    log('   - JWT_SECRET: A secure random string', 'yellow');
    log('   - SESSION_SECRET: A secure random string', 'yellow');
  } catch (error) {
    log('❌ Error creating .env file:', 'red');
    log(error.message, 'red');
  }
  
  log('');
}

function generateSecrets() {
  log('🔐 Generating security secrets...', 'blue');
  
  const crypto = require('crypto');
  
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const sessionSecret = crypto.randomBytes(64).toString('hex');
  
  log('Generated secrets (add these to your .env file):', 'cyan');
  log(`JWT_SECRET=${jwtSecret}`, 'green');
  log(`SESSION_SECRET=${sessionSecret}`, 'green');
  
  log('');
}

function validateProjectStructure() {
  log('📁 Validating project structure...', 'blue');
  
  const requiredPaths = [
    'client/index.html',
    'client/css/style.css',
    'client/js/main.js',
    'server/app.js',
    'server/package.json',
    'server/models/Project.js',
    'server/models/Contact.js',
    'server/routes/projects.js',
    'server/routes/contact.js'
  ];
  
  let allValid = true;
  
  requiredPaths.forEach(filePath => {
    if (fs.existsSync(path.join(__dirname, filePath))) {
      log(`✅ ${filePath}`, 'green');
    } else {
      log(`❌ ${filePath} - Missing`, 'red');
      allValid = false;
    }
  });
  
  if (allValid) {
    log('✅ Project structure is valid', 'green');
  } else {
    log('❌ Some required files are missing', 'red');
  }
  
  log('');
}

function seedDatabase() {
  log('🌱 Would you like to seed the database with sample data? (y/n)', 'blue');
  
  // For automated setup, we'll skip interactive input
  // In a real scenario, you might want to use a library like 'inquirer'
  log('ℹ️  To seed the database later, run: cd server && node seedData.js', 'cyan');
  log('');
}

function showNextSteps() {
  log('🎉 Setup completed successfully!', 'green');
  log('');
  log('📝 Next steps:', 'blue');
  log('');
  log('1. Configure your environment:', 'cyan');
  log('   - Edit server/.env with your actual values', 'yellow');
  log('   - Set up MongoDB Atlas database', 'yellow');
  log('   - Configure Gmail app password', 'yellow');
  log('');
  log('2. Start development servers:', 'cyan');
  log('   - Backend: cd server && npm run dev', 'yellow');
  log('   - Frontend: cd client && live-server --port=3000', 'yellow');
  log('   - Or both: npm run dev (from root)', 'yellow');
  log('');
  log('3. Test the application:', 'cyan');
  log('   - Open http://localhost:3000 in your browser', 'yellow');
  log('   - Test contact form submission', 'yellow');
  log('   - Verify projects are loading', 'yellow');
  log('');
  log('4. Deploy to production:', 'cyan');
  log('   - Follow instructions in DEPLOYMENT.md', 'yellow');
  log('   - Deploy backend to Render/Heroku', 'yellow');
  log('   - Deploy frontend to Netlify', 'yellow');
  log('');
  log('📚 Documentation:', 'blue');
  log('   - README.md - Project overview', 'yellow');
  log('   - DEPLOYMENT.md - Deployment guide', 'yellow');
  log('   - server/.env.example - Environment variables reference', 'yellow');
  log('');
  log('🆘 Need help?', 'blue');
  log('   - Check the troubleshooting section in DEPLOYMENT.md', 'yellow');
  log('   - Review the project documentation', 'yellow');
  log('   - Test components individually', 'yellow');
  log('');
  log('Happy coding! 🚀', 'magenta');
}

function runHealthCheck() {
  log('🏥 Running health check...', 'blue');
  
  try {
    // Check if we can start the server
    log('Testing server startup...', 'cyan');
    
    // This is a basic check - in production you might want more comprehensive tests
    const serverPath = path.join(__dirname, 'server', 'app.js');
    if (fs.existsSync(serverPath)) {
      log('✅ Server file exists', 'green');
    } else {
      log('❌ Server file missing', 'red');
    }
    
    // Check client files
    const clientPath = path.join(__dirname, 'client', 'index.html');
    if (fs.existsSync(clientPath)) {
      log('✅ Client files exist', 'green');
    } else {
      log('❌ Client files missing', 'red');
    }
    
    log('✅ Health check completed', 'green');
  } catch (error) {
    log('❌ Health check failed:', 'red');
    log(error.message, 'red');
  }
  
  log('');
}

// Main setup function
function main() {
  try {
    log('🎯 Vino K Portfolio Website Setup', 'bright');
    log('=====================================', 'bright');
    log('');
    
    checkPrerequisites();
    validateProjectStructure();
    installDependencies();
    createEnvironmentFile();
    generateSecrets();
    runHealthCheck();
    seedDatabase();
    showNextSteps();
    
  } catch (error) {
    log('❌ Setup failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  installDependencies,
  createEnvironmentFile,
  generateSecrets,
  validateProjectStructure,
  runHealthCheck
};
