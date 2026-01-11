import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('=== ENVIRONMENT ===');
  console.log('APP_ENVIRONMENT:', process.env.APP_ENVIRONMENT || 'NOT SET');
  console.log('ENVIRONMENT:', process.env.ENVIRONMENT || 'NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
  console.log('TEST_OTP:', process.env.TEST_OTP ? '***SET***' : 'NOT SET');
  
  console.log('\n=== DATABASE IDENTITY ===');
  const dbInfo = await prisma.$queryRaw`
    SELECT 
      current_database() as db,
      inet_server_addr() as host,
      current_user as "user"
  `;
  console.log('Database:', dbInfo[0].db);
  console.log('Host:', dbInfo[0].host);
  console.log('User:', dbInfo[0].user);
  
  console.log('\n=== QUERYING TEST USERS ===');
  const testPhones = ['+97336000000', '+97336000001', '+97336000002'];
  
  for (const phone of testPhones) {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, phone: true, role: true, status: true, createdAt: true }
    });
    
    if (user) {
      console.log(`✓ ${phone} → ${user.role} [ID: ${user.id.substring(0, 8)}...] [Status: ${user.status}]`);
    } else {
      console.log(`✗ ${phone} → NOT FOUND`);
    }
  }
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
