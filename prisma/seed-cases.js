const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestCases() {
  console.log('Creating test cases...');

  try {
    // First, let's get or create a test clinic
    let testClinicUser = await prisma.user.findFirst({
      where: { 
        role: 'CLINIC',
        email: 'testclinic@example.com'
      }
    });

    if (!testClinicUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      testClinicUser = await prisma.user.create({
        data: {
          name: 'Test Dental Clinic',
          email: 'testclinic@example.com',
          password: hashedPassword,
          role: 'CLINIC'
        }
      });

      await prisma.clinic.create({
        data: {
          name: 'Test Dental Clinic',
          phone: '555-0123',
          address: '123 Main St, Test City',
          specialties: ['general', 'cosmetic'],
          userId: testClinicUser.id
        }
      });
    }

    const clinic = await prisma.clinic.findUnique({
      where: { userId: testClinicUser.id }
    });

    // Get the first lab for assigned cases
    const firstLab = await prisma.lab.findFirst();
    
    if (!firstLab) {
      console.log('No labs found. Please run the lab seed script first.');
      return;
    }

    // Create test cases
    const testCases = [
      {
        title: 'Crown Case #TEST001',
        description: 'Crown restoration for molar',
        caseNotes: 'Patient needs crown for tooth 14. Please use porcelain material.',
        toothNumber: '14',
        status: 'NEW',
        clinicId: clinic.id,
        labId: null // Unassigned - general pool
      },
      {
        title: 'Bridge Case #TEST002',
        description: 'Three-unit bridge restoration',
        caseNotes: 'Bridge from tooth 12-14. Patient prefers metal-ceramic.',
        toothNumber: '12-14',
        status: 'NEW',
        clinicId: clinic.id,
        labId: firstLab.id // Assigned to specific lab
      },
      {
        title: 'Aligners Case #TEST003',
        description: 'Clear aligner treatment',
        caseNotes: 'Full arch aligners for minor crowding correction.',
        toothNumber: 'Full arch',
        status: 'NEW',
        clinicId: clinic.id,
        labId: null // Unassigned - general pool
      },
      {
        title: 'Veneer Case #TEST004',
        description: 'Porcelain veneers for anterior teeth',
        caseNotes: 'Veneers for teeth 11-21. Patient wants Hollywood white shade.',
        toothNumber: '11-21',
        status: 'NEW',
        clinicId: clinic.id,
        labId: firstLab.id // Assigned to specific lab
      },
      {
        title: 'Denture Case #TEST005',
        description: 'Complete upper denture',
        caseNotes: 'Patient is edentulous. Needs conventional complete denture.',
        toothNumber: 'Full upper arch',
        status: 'NEW',
        clinicId: clinic.id,
        labId: null // Unassigned - general pool
      }
    ];

    for (const caseData of testCases) {
      await prisma.case.create({ data: caseData });
      console.log(`Created: ${caseData.title} ${caseData.labId ? '(assigned to lab)' : '(unassigned)'}`);
    }

    console.log('✅ Test cases created successfully!');
    
    // Print summary
    const totalCases = await prisma.case.count();
    const assignedCases = await prisma.case.count({ where: { labId: { not: null } } });
    const unassignedCases = await prisma.case.count({ where: { labId: null } });
    
    console.log(`\n📊 Database Summary:`);
    console.log(`- Total cases: ${totalCases}`);
    console.log(`- Assigned cases: ${assignedCases}`);
    console.log(`- Unassigned cases: ${unassignedCases}`);

  } catch (error) {
    console.error('❌ Error creating test cases:', error);
    throw error;
  }
}

seedTestCases()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
