const fs = require('fs');
const path = require('path');

// Check if .env.local exists
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envLocalPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envLocalPath);
    console.log('✅ Created .env.local from .env.example');
    console.log('📝 Please edit .env.local and add your GitHub token:');
    console.log('   1. Go to: https://github.com/settings/tokens');
    console.log('   2. Generate a new token with "public_repo" permission');
    console.log('   3. Copy the token and replace "your_github_token_here" in .env.local');
  } else {
    console.log('❌ .env.example not found');
  }
} else {
  console.log('✅ .env.local already exists');
  
  // Check if it contains a placeholder token
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  if (envContent.includes('your_github_token_here')) {
    console.log('⚠️  Please update your GitHub token in .env.local');
    console.log('   Current value is still the placeholder');
  }
}

console.log('\n🚀 Multi-Repository Documentation Setup Complete!');
console.log('\nNext steps:');
console.log('1. Update repositories in lib/repo-config.ts');
console.log('2. Set your GitHub token in .env.local');
console.log('3. Run: pnpm dev');
