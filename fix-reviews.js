const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestMessages() {
  try {
    console.log('Creating test messages...');
    
    // Find a case with lab assignment and get the clinic user
    const caseWithLab = await prisma.case.findFirst({
      where: { labId: { not: null } },
      include: {
        clinic: true,
        lab: true
      }
    });
    
    if (!caseWithLab) {
      console.log('No cases with lab assignments found');
      return;
    }
    
    console.log(`Found case: ${caseWithLab.title}`);
    console.log(`Clinic: ${caseWithLab.clinic.name}`);
    console.log(`Lab: ${caseWithLab.lab.name}`);
    
    // Find the clinic user (not the clinic profile)
    const clinicUser = await prisma.user.findFirst({
      where: { 
        role: 'CLINIC',
        clinic: { id: caseWithLab.clinicId }
      }
    });
    
    if (!clinicUser) {
      console.log('No clinic user found for this case');
      return;
    }
    
    console.log(`Found clinic user: ${clinicUser.email}`);
    
    // Create some test messages from clinic user to lab
    const testMessages = [
      "Hi, I wanted to check on the progress of this case. When can we expect it to be ready?",
      "The patient is asking for an update. Could you please provide an estimated completion time?",
      "Thank you for accepting this case. Please let me know if you need any additional information."
    ];
    
    for (let i = 0; i < testMessages.length; i++) {
      const message = await prisma.message.create({
        data: {
          caseId: caseWithLab.id,
          senderId: clinicUser.id, // Use the clinic user ID
          content: testMessages[i],
          timestamp: new Date(Date.now() - (i * 3600000)) // Each message 1 hour apart
        }
      });
      console.log(`Created message ${i + 1}: ${message.id}`);
    }
    
    console.log(`Created ${testMessages.length} test messages from clinic to lab`);
    
    // Verify the messages were created
    const messagesForLab = await prisma.message.findMany({
      where: {
        case: { labId: caseWithLab.labId },
        sender: { role: 'CLINIC' }
      },
      include: {
        case: { select: { id: true, title: true } },
        sender: { select: { name: true } }
      },
      orderBy: { timestamp: 'desc' }
    });
    
    console.log('Total messages for lab after creation:', messagesForLab.length);
    messagesForLab.forEach((msg, index) => {
      console.log(`  ${index + 1}. ${msg.sender.name}: "${msg.content.substring(0, 50)}..."`);
    });
    
  } catch (error) {
    console.error('Error creating test messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestMessages();
