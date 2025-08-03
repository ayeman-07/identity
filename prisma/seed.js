const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const labData = [
  {
    name: "Precision Dental Lab",
    services: ["crowns", "bridges", "implants", "veneers"],
    specialties: ["crowns", "implants"],
    turnaroundTime: 5,
    location: "New York, NY",
    latitude: 40.7128,
    longitude: -74.0060,
    rating: 4.8,
    logo: null,
    email: "contact@precisiondental.com",
    password: "password123"
  },
  {
    name: "Elite Prosthetics Studio",
    services: ["dentures", "partials", "relines", "repairs"],
    specialties: ["dentures", "partials"],
    turnaroundTime: 7,
    location: "Los Angeles, CA",
    latitude: 34.0522,
    longitude: -118.2437,
    rating: 4.6,
    logo: null,
    email: "info@eliteprosthetics.com",
    password: "password123"
  },
  {
    name: "Digital Smile Solutions",
    services: ["aligners", "retainers", "night guards", "whitening trays"],
    specialties: ["aligners", "orthodontics"],
    turnaroundTime: 3,
    location: "Austin, TX",
    latitude: 30.2672,
    longitude: -97.7431,
    rating: 4.9,
    logo: null,
    email: "hello@digitalsmile.com",
    password: "password123"
  },
  {
    name: "Crown Masters Lab",
    services: ["crowns", "bridges", "inlays", "onlays"],
    specialties: ["crowns", "bridges"],
    turnaroundTime: 4,
    location: "Chicago, IL",
    latitude: 41.8781,
    longitude: -87.6298,
    rating: 4.7,
    logo: null,
    email: "orders@crownmasters.com",
    password: "password123"
  },
  {
    name: "Artisan Dental Crafters",
    services: ["veneers", "crowns", "bridges", "implants"],
    specialties: ["veneers", "cosmetic"],
    turnaroundTime: 6,
    location: "Miami, FL",
    latitude: 25.7617,
    longitude: -80.1918,
    rating: 4.5,
    logo: null,
    email: "craft@artisandental.com",
    password: "password123"
  },
  {
    name: "Premier Orthodontic Lab",
    services: ["aligners", "retainers", "expanders", "appliances"],
    specialties: ["orthodontics", "aligners"],
    turnaroundTime: 2,
    location: "Seattle, WA",
    latitude: 47.6062,
    longitude: -122.3321,
    rating: 4.8,
    logo: null,
    email: "lab@premierortho.com",
    password: "password123"
  },
  {
    name: "Titanium Implant Works",
    services: ["implants", "abutments", "surgical guides", "crowns"],
    specialties: ["implants", "surgery"],
    turnaroundTime: 8,
    location: "Denver, CO",
    latitude: 39.7392,
    longitude: -104.9903,
    rating: 4.4,
    logo: null,
    email: "implants@titaniumworks.com",
    password: "password123"
  },
  {
    name: "Swift Dental Express",
    services: ["crowns", "bridges", "repairs", "adjustments"],
    specialties: ["emergency", "repairs"],
    turnaroundTime: 1,
    location: "Phoenix, AZ",
    latitude: 33.4484,
    longitude: -112.0740,
    rating: 4.3,
    logo: null,
    email: "rush@swiftdental.com",
    password: "password123"
  },
  {
    name: "Golden Gate Prosthetics",
    services: ["dentures", "partials", "implant retained dentures", "relines"],
    specialties: ["dentures", "implants"],
    turnaroundTime: 9,
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    rating: 4.6,
    logo: null,
    email: "lab@goldengateprox.com",
    password: "password123"
  },
  {
    name: "Perfect Smile Ceramics",
    services: ["veneers", "crowns", "bridges", "inlays"],
    specialties: ["cosmetic", "ceramics"],
    turnaroundTime: 5,
    location: "Atlanta, GA",
    latitude: 33.7490,
    longitude: -84.3880,
    rating: 4.7,
    logo: null,
    email: "ceramics@perfectsmile.com",
    password: "password123"
  },
  {
    name: "Metro Dental Laboratory",
    services: ["crowns", "bridges", "dentures", "repairs"],
    specialties: ["general", "repairs"],
    turnaroundTime: 6,
    location: "Boston, MA",
    latitude: 42.3601,
    longitude: -71.0589,
    rating: 4.2,
    logo: null,
    email: "metro@metrodental.com",
    password: "password123"
  },
  {
    name: "Advanced CAD/CAM Solutions",
    services: ["crowns", "bridges", "surgical guides", "models"],
    specialties: ["CAD/CAM", "digital"],
    turnaroundTime: 3,
    location: "Portland, OR",
    latitude: 45.5152,
    longitude: -122.6784,
    rating: 4.9,
    logo: null,
    email: "digital@advancedcadcam.com",
    password: "password123"
  },
  {
    name: "Sunshine State Dental Lab",
    services: ["crowns", "bridges", "veneers", "whitening trays"],
    specialties: ["cosmetic", "general"],
    turnaroundTime: 7,
    location: "Tampa, FL",
    latitude: 27.9506,
    longitude: -82.4572,
    rating: 4.4,
    logo: null,
    email: "sunshine@ssdental.com",
    password: "password123"
  },
  {
    name: "Rocky Mountain Prosthetics",
    services: ["dentures", "partials", "implant prosthetics", "repairs"],
    specialties: ["dentures", "implants"],
    turnaroundTime: 8,
    location: "Salt Lake City, UT",
    latitude: 40.7608,
    longitude: -111.8910,
    rating: 4.5,
    logo: null,
    email: "lab@rockymountainpros.com",
    password: "password123"
  },
  {
    name: "Lone Star Dental Works",
    services: ["crowns", "bridges", "night guards", "sports guards"],
    specialties: ["guards", "general"],
    turnaroundTime: 4,
    location: "Dallas, TX",
    latitude: 32.7767,
    longitude: -96.7970,
    rating: 4.3,
    logo: null,
    email: "texas@lonestarworks.com",
    password: "password123"
  },
  {
    name: "Capital Dental Laboratory",
    services: ["crowns", "bridges", "veneers", "implants"],
    specialties: ["crowns", "implants"],
    turnaroundTime: 5,
    location: "Washington, DC",
    latitude: 38.9072,
    longitude: -77.0369,
    rating: 4.6,
    logo: null,
    email: "capital@capitaldental.com",
    password: "password123"
  },
  {
    name: "Midwest Orthodontic Services",
    services: ["aligners", "retainers", "appliances", "repairs"],
    specialties: ["orthodontics", "appliances"],
    turnaroundTime: 6,
    location: "Minneapolis, MN",
    latitude: 44.9778,
    longitude: -93.2650,
    rating: 4.7,
    logo: null,
    email: "ortho@midwestortho.com",
    password: "password123"
  },
  {
    name: "Ocean View Dental Lab",
    services: ["crowns", "bridges", "veneers", "repairs"],
    specialties: ["cosmetic", "repairs"],
    turnaroundTime: 7,
    location: "San Diego, CA",
    latitude: 32.7157,
    longitude: -117.1611,
    rating: 4.4,
    logo: null,
    email: "ocean@oceanviewdental.com",
    password: "password123"
  },
  {
    name: "Lightning Fast Dental",
    services: ["crowns", "emergency repairs", "adjustments", "relines"],
    specialties: ["emergency", "same-day"],
    turnaroundTime: 1,
    location: "Las Vegas, NV",
    latitude: 36.1699,
    longitude: -115.1398,
    rating: 4.1,
    logo: null,
    email: "fast@lightningdental.com",
    password: "password123"
  },
  {
    name: "Heritage Dental Artisans",
    services: ["crowns", "bridges", "veneers", "inlays", "onlays"],
    specialties: ["cosmetic", "traditional"],
    turnaroundTime: 9,
    location: "Philadelphia, PA",
    latitude: 39.9526,
    longitude: -75.1652,
    rating: 4.8,
    logo: null,
    email: "heritage@heritageartisans.com",
    password: "password123"
  }
];

const reviewsData = [
  { rating: 5, message: "Excellent quality work, always on time!" },
  { rating: 5, message: "Outstanding craftsmanship and attention to detail." },
  { rating: 4, message: "Great service, minor delivery delay but excellent results." },
  { rating: 5, message: "Best lab we've worked with. Highly recommended!" },
  { rating: 4, message: "Good quality, competitive pricing." },
  { rating: 5, message: "Exceptional customer service and beautiful work." },
  { rating: 4, message: "Reliable and consistent quality." },
  { rating: 5, message: "Perfect fit every time, great communication." },
  { rating: 4, message: "Professional service, quick turnaround." },
  { rating: 5, message: "Top-notch laboratory with skilled technicians." },
  { rating: 4, message: "Very satisfied with the results." },
  { rating: 5, message: "Impressive digital workflow and precision." },
  { rating: 4, message: "Good value for money, reliable service." },
  { rating: 5, message: "Exceeded our expectations in every way." },
  { rating: 4, message: "Solid choice for routine cases." },
  { rating: 5, message: "Innovative techniques and excellent results." },
  { rating: 4, message: "Professional and timely service." },
  { rating: 5, message: "Beautiful esthetics and perfect margins." },
  { rating: 4, message: "Consistent quality across all cases." },
  { rating: 5, message: "Outstanding emergency service when needed." }
];

async function main() {
  console.log('Starting database seed...');

  try {
    // Create lab users and labs
    for (let i = 0; i < labData.length; i++) {
      const lab = labData[i];
      
      console.log(`Creating lab ${i + 1}: ${lab.name}`);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(lab.password, 10);
      
      // Create user for lab
      const user = await prisma.user.create({
        data: {
          name: lab.name,
          email: lab.email,
          password: hashedPassword,
          role: 'LAB'
        }
      });

      // Create lab
      const createdLab = await prisma.lab.create({
        data: {
          name: lab.name,
          services: lab.services,
          specialties: lab.specialties,
          turnaroundTime: lab.turnaroundTime,
          location: lab.location,
          latitude: lab.latitude,
          longitude: lab.longitude,
          rating: lab.rating,
          logo: lab.logo,
          userId: user.id
        }
      });

      // Add 2-5 reviews for each lab
      const numReviews = Math.floor(Math.random() * 4) + 2; // 2-5 reviews
      for (let j = 0; j < numReviews; j++) {
        const randomReview = reviewsData[Math.floor(Math.random() * reviewsData.length)];
        await prisma.review.create({
          data: {
            rating: randomReview.rating,
            message: randomReview.message,
            labId: createdLab.id
          }
        });
      }

      // Recalculate rating based on reviews
      const reviews = await prisma.review.findMany({
        where: { labId: createdLab.id }
      });
      
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await prisma.lab.update({
        where: { id: createdLab.id },
        data: { rating: Math.round(avgRating * 10) / 10 } // Round to 1 decimal place
      });
    }

    console.log('✅ Successfully seeded 20 labs with reviews!');
    
    // Print summary
    const totalLabs = await prisma.lab.count();
    const totalReviews = await prisma.review.count();
    const totalUsers = await prisma.user.count();
    
    console.log(`\n📊 Seed Summary:`);
    console.log(`- Labs created: ${totalLabs}`);
    console.log(`- Reviews created: ${totalReviews}`);
    console.log(`- Total users: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
