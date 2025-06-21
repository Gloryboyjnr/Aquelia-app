const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Check if we can connect
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test 2: Count existing records
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();
    const otpCount = await prisma.otpCode.count();
    const paymentCount = await prisma.payment.count();
    
    console.log('📊 Current database records:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Companies: ${companyCount}`);
    console.log(`   OTP Codes: ${otpCount}`);
    console.log(`   Payments: ${paymentCount}`);
    
    // Test 3: Create a test user
    console.log('\n🧪 Creating test user...');
    const testUser = await prisma.user.create({
      data: {
        phoneNumber: '+233204204583',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'MANAGER',
        isVerified: false
      }
    });
    console.log('✅ Test user created:', testUser.id);
    
    // Test 4: Create a test OTP code
    console.log('\n🧪 Creating test OTP code...');
    const testOtp = await prisma.otpCode.create({
      data: {
        phoneNumber: '+233204204583',
        code: '1234',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        isUsed: false,
        userId: testUser.id
      }
    });
    console.log('✅ Test OTP created:', testOtp.id);
    
    // Test 5: Query the test data
    console.log('\n🔍 Querying test data...');
    const foundUser = await prisma.user.findFirst({
      where: { phoneNumber: '+233204204583' }
    });
    console.log('✅ Found user:', foundUser ? foundUser.fullName : 'Not found');
    
    const foundOtp = await prisma.otpCode.findFirst({
      where: { phoneNumber: '+233204204583', isUsed: false }
    });
    console.log('✅ Found OTP:', foundOtp ? foundOtp.code : 'Not found');
    
    // Test 6: Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await prisma.otpCode.deleteMany({
      where: { phoneNumber: '+233204204583' }
    });
    await prisma.user.deleteMany({
      where: { phoneNumber: '+233204204583' }
    });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 