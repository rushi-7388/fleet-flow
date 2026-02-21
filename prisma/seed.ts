import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@fleetflow.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@fleetflow.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'dispatcher@fleetflow.com' },
    update: {},
    create: {
      name: 'Dispatcher User',
      email: 'dispatcher@fleetflow.com',
      password: hashedPassword,
      role: 'DISPATCHER',
    },
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
