const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClinics() {
  try {
    const clinicUsers = await prisma.user.findMany({
      where: { role: 'CLINIC' },
      include: { clinic: true }
    });
    
    console.log('Clinic users found:', clinicUsers.length);
    clinicUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Clinic: ${user.clinic?.name || 'No clinic profile'}`);
    });
    
    // Check labs
    const labs = await prisma.lab.findMany();
    console.log('\nLabs found:', labs.length);
    labs.forEach(lab => {
      console.log(`- ${lab.name} (Rating: ${lab.rating})`);
    });
    
    // Also check favorite labs
    const favorites = await prisma.favoriteLab.findMany({
      include: {
        clinic: true,
        lab: true
      }
    });
    console.log('\nFavorite labs found:', favorites.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClinics();
