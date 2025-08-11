const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test users and profiles for map demo...');

  const passwordPlain = 'Test123!';
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  const fixtures = [
    {
      role: 'CLINIC',
      email: 'mumbai.clinic@example.com',
      userName: 'Mumbai Clinic User',
      clinic: {
        name: 'Mumbai Dental Clinic',
        phone: null,
        address: 'Mumbai, India',
        latitude: 19.0760,
        longitude: 72.8777,
        specialties: [],
      },
    },
    {
      role: 'LAB',
      email: 'delhi.lab@example.com',
      userName: 'Delhi Lab User',
      lab: {
        name: 'Delhi Dental Lab',
        services: [],
        specialties: [],
        turnaroundTime: 7,
        location: 'Delhi, India',
        latitude: 28.6139,
        longitude: 77.2090,
        logo: null,
      },
    },
    {
      role: 'CLINIC',
      email: 'chennai.clinic@example.com',
      userName: 'Chennai Clinic User',
      clinic: {
        name: 'Chennai Dental Clinic',
        phone: null,
        address: 'Chennai, India',
        latitude: 13.0827,
        longitude: 80.2707,
        specialties: [],
      },
    },
  ];

  for (const item of fixtures) {
    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.userName,
        role: item.role,
        password: hashedPassword,
      },
      create: {
        name: item.userName,
        email: item.email,
        password: hashedPassword,
        role: item.role,
      },
    });

    if (item.role === 'CLINIC') {
      const c = item.clinic;
      await prisma.clinic.upsert({
        where: { userId: user.id },
        update: {
          name: c.name,
          phone: c.phone,
          address: c.address,
          latitude: c.latitude,
          longitude: c.longitude,
          specialties: c.specialties,
        },
        create: {
          name: c.name,
          phone: c.phone,
          address: c.address,
          latitude: c.latitude,
          longitude: c.longitude,
          specialties: c.specialties,
          userId: user.id,
        },
      });
    } else if (item.role === 'LAB') {
      const l = item.lab;
      await prisma.lab.upsert({
        where: { userId: user.id },
        update: {
          name: l.name,
          services: l.services,
          specialties: l.specialties,
          turnaroundTime: l.turnaroundTime,
          location: l.location,
          latitude: l.latitude,
          longitude: l.longitude,
          logo: l.logo,
        },
        create: {
          name: l.name,
          services: l.services,
          specialties: l.specialties,
          turnaroundTime: l.turnaroundTime,
          location: l.location,
          latitude: l.latitude,
          longitude: l.longitude,
          logo: l.logo,
          userId: user.id,
        },
      });
    }
  }

  console.log('\nSeed complete. You can log in with:');
  console.table([
    { email: 'mumbai.clinic@example.com', role: 'CLINIC', password: passwordPlain },
    { email: 'delhi.lab@example.com', role: 'LAB', password: passwordPlain },
    { email: 'chennai.clinic@example.com', role: 'CLINIC', password: passwordPlain },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
