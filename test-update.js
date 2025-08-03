import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testCaseUpdate() {
  try {
    console.log('Testing case update...');
    
    const caseId = 'ed6801af-b453-40dc-9c8d-50f71ef90351';
    
    // First, let's see the current case data
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        lab: true,
        clinic: true
      }
    });
    
    console.log('Current case data:', JSON.stringify(existingCase, null, 2));
    
    if (!existingCase) {
      console.log('Case not found!');
      return;
    }
    
    // Test updating just the status
    console.log('Attempting to update status...');
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: { 
        status: 'DESIGNING'
      }
    });
    
    console.log('Updated case status:', updatedCase.status);
    
    // Now test updating with statusHistory
    console.log('Testing with statusHistory...');
    const historyEntry = {
      status: 'DESIGNING',
      timestamp: new Date().toISOString(),
      updatedBy: 'Test User'
    };
    
    const caseWithHistory = await prisma.case.update({
      where: { id: caseId },
      data: { 
        statusHistory: [historyEntry]
      }
    });
    
    console.log('Updated with history:', caseWithHistory.statusHistory);
    
  } catch (error) {
    console.error('Error in test:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

testCaseUpdate();
