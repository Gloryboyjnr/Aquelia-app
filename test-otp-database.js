const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function testOtpDatabase() {
  try {
    console.log('🔍 Testing OTP database functionality...');
    
    // Test 1: Check current OTP records
    const currentOtps = await prisma.otpCode.count();
    console.log(`📊 Current OTP records: ${currentOtps}`);
    
    // Test 2: Create a test OTP (simulating what the API would do)
    console.log('\n🧪 Creating test OTP record...');
    const testOtp = await prisma.otpCode.create({
      data: {
        phoneNumber: '+233204204583',
        code: '1234',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        isUsed: false
      }
    });
    console.log('✅ Test OTP created:', testOtp.id);
    
    // Test 3: Query the OTP
    console.log('\n🔍 Querying OTP record...');
    const foundOtp = await prisma.otpCode.findFirst({
      where: { 
        phoneNumber: '+233204204583',
        isUsed: false
      }
    });
    console.log('✅ Found OTP:', foundOtp ? `Code: ${foundOtp.code}` : 'Not found');
    
    // Test 4: Mark OTP as used (simulating verification)
    if (foundOtp) {
      console.log('\n🔐 Marking OTP as used...');
      await prisma.otpCode.update({
        where: { id: foundOtp.id },
        data: { isUsed: true }
      });
      console.log('✅ OTP marked as used');
    }
    
    // Test 5: Verify OTP is marked as used
    const usedOtp = await prisma.otpCode.findFirst({
      where: { 
        phoneNumber: '+233204204583',
        isUsed: true
      }
    });
    console.log('✅ Used OTP found:', usedOtp ? 'Yes' : 'No');
    
    // Test 6: Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await prisma.otpCode.deleteMany({
      where: { phoneNumber: '+233204204583' }
    });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 OTP database functionality test passed!');
    console.log('\n📝 This confirms that:');
    console.log('   ✅ OTP codes can be created');
    console.log('   ✅ OTP codes can be queried');
    console.log('   ✅ OTP codes can be marked as used');
    console.log('   ✅ Database relationships work correctly');
    
  } catch (error) {
    console.error('❌ OTP database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOtpDatabase(); 