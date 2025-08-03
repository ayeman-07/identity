import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUserAndCase() {
  try {
    // Check the lab user
    const labUser = await prisma.user.findUnique({
      where: { id: 'e30f4bd2-ba47-4fdc-b88b-afdcab0306f5' },
      include: {
        lab: true
      }
    });
    
    console.log('Lab user:', JSON.stringify(labUser, null, 2));
    
    // Check case and lab relationship
    const caseData = await prisma.case.findUnique({
      where: { id: 'ed6801af-b453-40dc-9c8d-50f71ef90351' },
      include: {
        lab: {
          select: {
            id: true,
            userId: true,
            name: true
          }
        }
      }
    });
    
    console.log('Case with lab data:', JSON.stringify(caseData, null, 2));
    
    // Check authorization logic
    const isAuthorized = caseData.labId && caseData.lab.userId === labUser.id;
    console.log('Authorization check:', {
      hasLabId: !!caseData.labId,
      caseLabUserId: caseData.lab?.userId,
      requestUserId: labUser.id,
      isAuthorized
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserAndCase();
