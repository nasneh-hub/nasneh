import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function proveDbEnv() {
  console.log('=== ENVIRONMENT ===');
  console.log('APP_ENVIRONMENT:', process.env.APP_ENVIRONMENT || 'NOT SET');
  console.log('ENVIRONMENT:', process.env.ENVIRONMENT || 'NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
  console.log('TEST_OTP:', process.env.TEST_OTP ? '***SET***' : 'NOT SET');
  
  console.log('\n=== DATABASE IDENTITY ===');
  const result = await prisma.$queryRaw`
    SELECT 
      current_database() as db,
      inet_server_addr() as host,
      current_user as user
  `;
  console.log('Database:', result[0].db);
  console.log('Host:', result[0].host);
  console.log('User:', result[0].user);
  
  await prisma.$disconnect();
}

proveDbEnv().catch(console.error);
