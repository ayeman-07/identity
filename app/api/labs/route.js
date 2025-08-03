import { authenticateToken } from '../../../lib/auth.js';
import { prisma } from '../../../lib/prisma.js';

export async function GET(request) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    // Get all labs with basic info from User table with LAB role
    const labUsers = await prisma.user.findMany({
      where: {
        role: 'LAB'
      },
      select: {
        id: true,
        email: true,
        name: true,
        lab: {
          select: {
            id: true,
            name: true,
            services: true,
            turnaroundTime: true,
            location: true,
            rating: true,
            specialties: true,
            website: true,
            phone: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to match expected format
    const labs = labUsers
      .filter(user => user.lab) // Only include users with lab profiles
      .map(user => ({
        id: user.lab.id,
        userId: user.id,
        name: user.lab.name || user.name,
        services: user.lab.services || [],
        turnaroundTime: user.lab.turnaroundTime,
        location: user.lab.location,
        rating: user.lab.rating,
        specialties: user.lab.specialties || [],
        website: user.lab.website,
        phone: user.lab.phone,
        email: user.email
      }));

    return Response.json({
      labs
    });

  } catch (error) {
    console.error('Error fetching labs:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
