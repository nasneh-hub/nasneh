import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      phone: {
        in: ['+97336000000', '+97336000001', '+97336000002']
      }
    },
    select: {
      id: true,
      phone: true,
      name: true,
      role: true,
      status: true
    }
  });
  
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
