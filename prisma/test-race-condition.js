const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRaceCondition() {
  console.log('Testing race condition protection...');

  try {
    // Get the first clinic for creating test cases
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) {
      console.log('No clinic found. Please run the seed script first.');
      return;
    }

    // Create some unassigned test cases (general pool)
    const testCase1 = await prisma.case.create({
      data: {
        title: 'Race Test Case #001',
        description: 'Test case for race condition',
        caseNotes: 'This case should only be accepted by one lab',
        toothNumber: '15',
        status: 'NEW',
        clinicId: clinic.id,
        labId: null // Unassigned - general pool
      }
    });

    const testCase2 = await prisma.case.create({
      data: {
        title: 'Race Test Case #002',
        description: 'Another test case for race condition',
        caseNotes: 'This case should also only be accepted by one lab',
        toothNumber: '16',
        status: 'NEW',
        clinicId: clinic.id,
        labId: null // Unassigned - general pool
      }
    });

    console.log(`✅ Created test cases:`);
    console.log(`- ${testCase1.title} (ID: ${testCase1.id})`);
    console.log(`- ${testCase2.title} (ID: ${testCase2.id})`);

    // Get all labs
    const labs = await prisma.lab.findMany();
    console.log(`\n📋 Available labs: ${labs.length}`);
    labs.forEach((lab, index) => {
      console.log(`  ${index + 1}. ${lab.name} (ID: ${lab.id})`);
    });

    // Show cases available in general pool
    const unassignedCases = await prisma.case.findMany({
      where: {
        status: 'NEW',
        labId: null
      },
      include: {
        clinic: {
          select: { name: true }
        }
      }
    });

    console.log(`\n🎯 Unassigned cases available (general pool): ${unassignedCases.length}`);
    unassignedCases.forEach(caseItem => {
      console.log(`  - ${caseItem.title} (Status: ${caseItem.status}, Lab: ${caseItem.labId || 'None'})`);
    });

    console.log('\n💡 Test Instructions:');
    console.log('1. Open multiple browser tabs/windows');
    console.log('2. Login as different labs');
    console.log('3. Go to /lab/incoming in each tab');
    console.log('4. Try to accept the same case simultaneously');
    console.log('5. Only one lab should succeed, others should get "already accepted" error');
    console.log('6. The case should disappear from all other labs\' incoming lists');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRaceCondition()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
