const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedLabs() {
  try {
    console.log('Starting to seed database with test labs...');

    // Define test labs data
    const testLabs = [
      {
        email: 'premier.dental@example.com',
        password: 'password123',
        name: 'Premier Dental Lab',
        lab: {
          name: 'Premier Dental Laboratory',
          location: 'New York, NY',
          specialties: ['Crowns', 'Bridges', 'Implants', 'Veneers'],
          services: ['Crown & Bridge', 'Implant Restorations', 'Cosmetic Dentistry', 'Full Mouth Reconstruction'],
          turnaroundTime: 5,
          rating: 4.8
        }
      },
      {
        email: 'excellence.lab@example.com',
        password: 'password123',
        name: 'Excellence Dental Lab',
        lab: {
          name: 'Excellence Dental Laboratory',
          location: 'Los Angeles, CA',
          specialties: ['Orthodontics', 'Implants', 'Dentures', 'Cosmetic'],
          services: ['Orthodontic Appliances', 'Implant Solutions', 'Complete Dentures', 'Partial Dentures'],
          turnaroundTime: 7,
          rating: 4.6
        }
      },
      {
        email: 'precision.works@example.com',
        password: 'password123',
        name: 'Precision Dental Works',
        lab: {
          name: 'Precision Dental Works',
          location: 'Chicago, IL',
          specialties: ['Digital Dentistry', 'CAD/CAM', 'Implants', 'Crowns'],
          services: ['Digital Impressions', 'CAD/CAM Restorations', 'Zirconia Crowns', 'Titanium Implants'],
          turnaroundTime: 4,
          rating: 4.9
        }
      },
      {
        email: 'artisan.dental@example.com',
        password: 'password123',
        name: 'Artisan Dental Lab',
        lab: {
          name: 'Artisan Dental Laboratory',
          location: 'Miami, FL',
          specialties: ['Cosmetic', 'Veneers', 'Crowns', 'Bridges'],
          services: ['Porcelain Veneers', 'Aesthetic Restorations', 'Color Matching', 'Custom Shading'],
          turnaroundTime: 6,
          rating: 4.7
        }
      },
      {
        email: 'tech.dental@example.com',
        password: 'password123',
        name: 'TechDental Solutions',
        lab: {
          name: 'TechDental Solutions',
          location: 'Austin, TX',
          specialties: ['3D Printing', 'Digital Workflow', 'Implants', 'Surgical Guides'],
          services: ['3D Printed Models', 'Surgical Guides', 'Digital Planning', 'Virtual Setup'],
          turnaroundTime: 3,
          rating: 4.5
        }
      },
      {
        email: 'crown.bridge@example.com',
        password: 'password123',
        name: 'Crown & Bridge Specialists',
        lab: {
          name: 'Crown & Bridge Specialists',
          location: 'Denver, CO',
          specialties: ['Crowns', 'Bridges', 'Inlays', 'Onlays'],
          services: ['Single Crowns', 'Multi-Unit Bridges', 'Maryland Bridges', 'Inlay/Onlay'],
          turnaroundTime: 5,
          rating: 4.4
        }
      },
      {
        email: 'smile.design@example.com',
        password: 'password123',
        name: 'Smile Design Lab',
        lab: {
          name: 'Smile Design Laboratory',
          location: 'Seattle, WA',
          specialties: ['Cosmetic', 'Smile Makeover', 'Veneers', 'Whitening'],
          services: ['Smile Analysis', 'Digital Smile Design', 'Bleaching Trays', 'Night Guards'],
          turnaroundTime: 8,
          rating: 4.6
        }
      },
      {
        email: 'rapid.dental@example.com',
        password: 'password123',
        name: 'Rapid Dental Lab',
        lab: {
          name: 'Rapid Dental Laboratory',
          location: 'Phoenix, AZ',
          specialties: ['Same Day', 'Emergency', 'Repairs', 'Rush Orders'],
          services: ['24hr Turnaround', 'Emergency Repairs', 'Rush Processing', 'Weekend Service'],
          turnaroundTime: 1,
          rating: 4.3
        }
      },
      {
        email: 'prosthetic.pro@example.com',
        password: 'password123',
        name: 'Prosthetic Professionals',
        lab: {
          name: 'Prosthetic Professionals',
          location: 'Boston, MA',
          specialties: ['Dentures', 'Partials', 'Implant Overdentures', 'Relines'],
          services: ['Complete Dentures', 'Partial Dentures', 'Implant Retained', 'Soft Relines'],
          turnaroundTime: 10,
          rating: 4.2
        }
      },
      {
        email: 'digital.dental@example.com',
        password: 'password123',
        name: 'Digital Dental Solutions',
        lab: {
          name: 'Digital Dental Solutions',
          location: 'San Francisco, CA',
          specialties: ['Digital Workflow', 'Intraoral Scanning', 'CAD/CAM', '3D Printing'],
          services: ['Digital Impressions', 'Virtual Models', '3D Printing', 'Digital Delivery'],
          turnaroundTime: 4,
          rating: 4.8
        }
      }
    ];

    // Hash passwords and create lab users
    for (const labData of testLabs) {
      console.log(`Creating lab: ${labData.lab.name}...`);
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: labData.email }
      });

      if (existingUser) {
        console.log(`  ⚠️  User ${labData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(labData.password, 10);

      // Create user with lab profile
      const user = await prisma.user.create({
        data: {
          email: labData.email,
          password: hashedPassword,
          name: labData.name,
          role: 'LAB',
          lab: {
            create: {
              name: labData.lab.name,
              location: labData.lab.location,
              specialties: labData.lab.specialties,
              services: labData.lab.services,
              turnaroundTime: labData.lab.turnaroundTime,
              rating: labData.lab.rating
            }
          }
        },
        include: {
          lab: true
        }
      });

      console.log(`  ✅ Created lab: ${user.lab.name} (${user.email})`);
    }

    // Create some test reviews for labs
    console.log('\nCreating test reviews...');
    
    // Get some labs and clinics
    const labs = await prisma.user.findMany({
      where: { role: 'LAB' },
      include: { lab: true },
      take: 3
    });

    const clinics = await prisma.user.findMany({
      where: { role: 'CLINIC' },
      take: 2
    });

    // Create some delivered cases first
    if (labs.length > 0 && clinics.length > 0) {
      console.log('Creating test cases and reviews...');
      
      for (let i = 0; i < 5; i++) {
        const randomLab = labs[Math.floor(Math.random() * labs.length)];
        const randomClinic = clinics[Math.floor(Math.random() * clinics.length)];
        
        // Get clinic profile
        const clinicProfile = await prisma.clinic.findUnique({
          where: { userId: randomClinic.id }
        });

        if (clinicProfile) {
          // Create a delivered case
          const testCase = await prisma.case.create({
            data: {
              title: `Test Case ${i + 1}`,
              description: `Test case for review system`,
              clinicId: clinicProfile.id,
              labId: randomLab.lab.id, // This should be the Lab profile ID
              status: 'DELIVERED'
            }
          });

          // Create a review
          const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
          const comments = [
            'Excellent work! Very satisfied with the quality.',
            'Fast turnaround time and great communication.',
            'Professional service and attention to detail.',
            'High quality work, will definitely use again.',
            'Outstanding craftsmanship and perfect fit.'
          ];

          await prisma.review.create({
            data: {
              caseId: testCase.id,
              clinicId: randomClinic.id,
              labId: randomLab.id, // Use the user ID, not lab profile ID
              rating: rating,
              comment: comments[Math.floor(Math.random() * comments.length)]
            }
          });

          console.log(`  ✅ Created review for ${randomLab.lab.name}`);
        }
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nTest lab credentials (all use password: password123):');
    testLabs.forEach(lab => {
      console.log(`  - ${lab.email} (${lab.lab.name})`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedLabs();
