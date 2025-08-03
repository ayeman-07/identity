import { authenticateToken } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    // Get full user data with profiles
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            specialties: true
          }
        },
        lab: {
          select: {
            id: true,
            name: true,
            services: true,
            turnaroundTime: true,
            location: true,
            rating: true,
            logo: true
          }
        }
      }
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({
      message: 'User data retrieved successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinic: user.clinic,
        lab: user.lab,
        hasClinic: !!user.clinic,
        hasLab: !!user.lab
      }
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 