import 'dotenv/config';
import mongoose from 'mongoose';

// Test configuration
const TEST_CONFIG = {
  serverUrl: process.env.TEST_URL || 'http://localhost:3000',
  timeout: 10000
};

console.log('🧪 Testing Portfolio Setup...\n');

// Test 1: Database Connection
async function testDatabase() {
  console.log('1. Testing Database Connection...');
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not set in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✅ Database connection successful');
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const expectedCollections = ['projects', 'messages', 'experiences', 'achievements'];
    const missingCollections = expectedCollections.filter(name => !collectionNames.includes(name));
    
    if (missingCollections.length > 0) {
      console.log(`   ⚠️  Missing collections: ${missingCollections.join(', ')}`);
      console.log('   💡 Run "npm run seed" to create sample data');
    } else {
      console.log('   ✅ All required collections exist');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.log(`   ❌ Database test failed: ${error.message}`);
    return false;
  }
  return true;
}

// Test 2: Server Health
async function testServer() {
  console.log('\n2. Testing Server Health...');
  try {
    const response = await fetch(`${TEST_CONFIG.serverUrl}/health`, {
      timeout: TEST_CONFIG.timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Server is running');
      console.log(`   📊 Status: ${data.status}`);
      console.log(`   🌍 Environment: ${data.environment}`);
      return true;
    } else {
      throw new Error(`Server returned ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Server test failed: ${error.message}`);
    console.log('   💡 Make sure server is running with "npm run dev"');
    return false;
  }
}

// Test 3: API Endpoints
async function testAPI() {
  console.log('\n3. Testing API Endpoints...');
  
  const endpoints = [
    { path: '/api/projects', name: 'Projects API' },
    { path: '/api/experiences', name: 'Experiences API' },
    { path: '/api/achievements', name: 'Achievements API' }
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${TEST_CONFIG.serverUrl}${endpoint.path}`, {
        timeout: TEST_CONFIG.timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ ${endpoint.name}: ${data.length} items`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name} failed: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test 4: Static Files
async function testStaticFiles() {
  console.log('\n4. Testing Static Files...');
  
  const staticFiles = [
    { path: '/', name: 'Homepage' },
    { path: '/contact.html', name: 'Contact Page' },
    { path: '/resume.html', name: 'Resume Page' },
    { path: '/styles/styles.css', name: 'CSS File' },
    { path: '/scripts/app.js', name: 'Main JS File' }
  ];
  
  let allPassed = true;
  
  for (const file of staticFiles) {
    try {
      const response = await fetch(`${TEST_CONFIG.serverUrl}${file.path}`, {
        timeout: TEST_CONFIG.timeout
      });
      
      if (response.ok) {
        console.log(`   ✅ ${file.name} loads correctly`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${file.name} failed: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test 5: Environment Variables
function testEnvironment() {
  console.log('\n5. Testing Environment Variables...');
  
  const requiredVars = ['MONGODB_URI'];
  const optionalVars = ['OPENAI_API_KEY', 'EMAIL_USER', 'EMAIL_PASS'];
  
  let allRequired = true;
  
  // Check required variables
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is missing (required)`);
      allRequired = false;
    }
  }
  
  // Check optional variables
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ⚠️  ${varName} is not set (optional)`);
    }
  }
  
  return allRequired;
}

// Test 6: AI Chat (if configured)
async function testAIChat() {
  console.log('\n6. Testing AI Chat...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('   ⚠️  OPENAI_API_KEY not set - skipping AI chat test');
    return true;
  }
  
  try {
    const response = await fetch(`${TEST_CONFIG.serverUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello, can you tell me about Vino?' }]
      }),
      timeout: TEST_CONFIG.timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.reply) {
        console.log('   ✅ AI Chat is working');
        console.log(`   💬 Sample response: "${data.reply.substring(0, 50)}..."`);
        return true;
      } else {
        throw new Error('No reply in response');
      }
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ AI Chat test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  const startTime = Date.now();
  
  const results = {
    database: await testDatabase(),
    environment: testEnvironment(),
    server: await testServer(),
    api: await testAPI(),
    staticFiles: await testStaticFiles(),
    aiChat: await testAIChat()
  };
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.padEnd(15)}: ${status}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 ${passedTests}/${totalTests} tests passed in ${duration}s`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Your portfolio is ready for deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above before deploying.');
  }
  
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test runner crashed:', error);
  process.exit(1);
});
