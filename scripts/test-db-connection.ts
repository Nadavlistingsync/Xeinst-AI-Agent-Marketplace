import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    // Test the connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 