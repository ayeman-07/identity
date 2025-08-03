const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Simulate the clinic dashboard API call
async function testClinicDashboard() {
  const prisma = new PrismaClient();
  
  try {
    // Get the clinic user
    const clinicUser = await prisma.user.findFirst({
      where: { role: 'CLINIC' },
      include: { clinic: true }
    });
    
    if (!clinicUser || !clinicUser.clinic) {
      console.log('No clinic user found');
      return;
    }
    
    console.log('Testing dashboard for clinic:', clinicUser.clinic.name);
    
    const clinicId = clinicUser.clinic.id;

    // Fetch cases
    const cases = await prisma.case.findMany({
      where: { clinicId },
      include: {
        lab: {
          select: { id: true, name: true, rating: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    console.log('Cases found:', cases.length);

    // Get favorite labs
    const favoriteLabs = await prisma.favoriteLab.findMany({
      where: { clinicId },
      include: {
        lab: {
          select: {
            id: true,
            name: true,
            rating: true,
            specialties: true,
            location: true,
            turnaroundTime: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Favorite labs found:', favoriteLabs.length);

    // Get recommended labs (from seeded data and high-rated labs)
    const favoriteLabIds = favoriteLabs.map(fl => fl.lab.id);
    
    const recommendedLabs = await prisma.lab.findMany({
      where: {
        id: { notIn: favoriteLabIds }
      },
      select: {
        id: true,
        name: true,
        rating: true,
        specialties: true,
        location: true,
        turnaroundTime: true,
        user: {
          select: {
            id: true
          }
        }
      },
      orderBy: { rating: 'desc' },
      take: 5
    });
    
    console.log('Recommended labs found:', recommendedLabs.length);
    console.log('Recommended labs:', recommendedLabs.map(lab => ({ name: lab.name, rating: lab.rating })));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testClinicDashboard();
