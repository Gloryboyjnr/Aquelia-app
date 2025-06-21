#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Aquelia Production Setup');
console.log('============================\n');

// Check if .env.production exists
const envPath = path.join(__dirname, '.env.production');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.production file...');
  
  const envContent = `# Production Environment Variables

# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# SMS Service - Hubtel Production
HUBTEL_CLIENT_ID="[YOUR-HUBTEL-CLIENT-ID]"
HUBTEL_CLIENT_SECRET="[YOUR-HUBTEL-CLIENT-SECRET]"
HUBTEL_SENDER_ID="[YOUR-SENDER-ID]"
SMS_PROVIDER="hubtel"

# Backend Configuration
NODE_ENV="production"
PORT=4000

# Frontend Configuration
EXPO_PUBLIC_API_URL="https://your-backend-domain.com"
EXPO_PUBLIC_APP_NAME="Aquelia"

# Security
JWT_SECRET="[YOUR-JWT-SECRET]"
ENCRYPTION_KEY="[YOUR-ENCRYPTION-KEY]"
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.production file');
  console.log('⚠️  Please update the values in .env.production with your actual credentials\n');
} else {
  console.log('✅ .env.production file already exists\n');
}

console.log('📋 Production Setup Checklist:');
console.log('==============================');
console.log('');
console.log('1. 🔗 Supabase Setup:');
console.log('   - Go to your Supabase project dashboard');
console.log('   - Copy your database connection string');
console.log('   - Update DATABASE_URL in .env.production');
console.log('');
console.log('2. 📱 Hubtel Setup:');
console.log('   - Get your production Hubtel credentials');
console.log('   - Update HUBTEL_* variables in .env.production');
console.log('');
console.log('3. 🚀 Backend Deployment:');
console.log('   - Install Vercel CLI: npm i -g vercel');
console.log('   - Deploy: cd backend && vercel --prod');
console.log('');
console.log('4. 📲 Frontend Deployment:');
console.log('   - Install EAS CLI: npm install -g @expo/eas-cli');
console.log('   - Build: eas build --platform all --profile production');
console.log('');
console.log('5. 🧪 Testing:');
console.log('   - Test OTP API with production backend');
console.log('   - Test app on real devices');
console.log('   - Verify database connections');
console.log('');
console.log('⏱️  Estimated Time: 2.5 hours');
console.log('🎯 Ready to launch today!');
console.log('');
console.log('Need help? Check PRODUCTION-SETUP.md for detailed instructions.'); 