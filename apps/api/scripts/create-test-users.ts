import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const testAccounts = [
    { phone: '+97336000000', role: 'CUSTOMER', name: 'Test Customer', email: 'customer@test.nasneh.com' },
    { phone: '+97336000001', role: 'VENDOR', name: 'Test Vendor', email: 'vendor@test.nasneh.com' },
    { phone: '+97336000002', role: 'ADMIN', name: 'Test Admin', email: 'admin@test.nasneh.com' },
  ];

  for (const account of testAccounts) {
    const user = await prisma.user.upsert({
      where: { phone: account.phone },
      update: {
        name: account.name,
        email: account.email,
        role: account.role as any,
        status: 'VERIFIED',
      },
      create: {
        phone: account.phone,
        name: account.name,
        email: account.email,
        role: account.role as any,
        status: 'VERIFIED',
      },
    });
    console.log(`✓ Created: ${user.phone} (${user.role})`);
  }
  
  console.log('\n✅ All test accounts created!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
