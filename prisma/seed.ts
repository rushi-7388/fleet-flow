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

  await prisma.user.upsert({
    where: { email: 'manager@fleetflow.com' },
    update: {},
    create: {
      name: 'Fleet Manager',
      email: 'manager@fleetflow.com',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@fleetflow.com' },
    update: {},
    create: {
      name: 'Financial Analyst',
      email: 'viewer@fleetflow.com',
      password: hashedPassword,
      role: 'VIEWER',
    },
  });

  // Seed vehicles (at least one Available for trips)
  const licensePlates = ['VAN-01', 'TRK-01', 'BIKE-01'];
  for (const plate of licensePlates) {
    await prisma.vehicle.upsert({
      where: { licensePlate: plate },
      update: {},
      create: {
        name: plate === 'VAN-01' ? 'Van-05' : plate === 'TRK-01' ? 'Truck-01' : 'Bike-01',
        model: plate === 'VAN-01' ? 'Cargo Van' : plate === 'TRK-01' ? 'Heavy Duty' : 'Delivery Bike',
        licensePlate: plate,
        type: plate.startsWith('VAN') ? 'Van' : plate.startsWith('TRK') ? 'Truck' : 'Bike',
        region: 'North',
        maxCapacity: plate === 'VAN-01' ? 500 : plate === 'TRK-01' ? 2000 : 50,
        odometer: 0,
        status: 'Available',
      },
    });
  }

  // Seed drivers (at least one OnDuty with valid license for trips)
  const driverCount = await prisma.driver.count();
  if (driverCount === 0) {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    await prisma.driver.createMany({
      data: [
        { name: 'Alex', licenseType: 'Van', licenseExpiry: futureDate, safetyScore: 100, status: 'OnDuty' },
        { name: 'Maria', licenseType: 'Truck', licenseExpiry: futureDate, safetyScore: 95, status: 'OffDuty' },
      ],
    });
  }

  console.log('Seed completed: users, vehicles, drivers.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
