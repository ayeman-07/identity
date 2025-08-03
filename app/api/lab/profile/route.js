import { requireLab } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

// GET lab profile
export async function GET(request) {
  const authResult = await requireLab(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    // Get lab profile with user info
    const lab = await prisma.lab.findUnique({
      where: { userId: authResult.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!lab) {
      return Response.json(
        { error: 'Lab profile not found' },
        { status: 404 }
      );
    }

    // Format profile data
    const profile = {
      id: lab.id,
      name: lab.name,
      email: lab.user.email,
      services: lab.services || [],
      turnaroundTime: lab.turnaroundTime,
      location: lab.location || '',
      rating: lab.rating,
      logo: lab.logo || null
    };

    return Response.json({
      message: 'Lab profile retrieved successfully',
      profile
    });

  } catch (error) {
    console.error('Error fetching lab profile:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT lab profile
export async function PUT(request) {
  const authResult = await requireLab(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { name, email, services, turnaroundTime, location, logo } = await request.json();

    // Validation
    if (!name || !email) {
      return Response.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (turnaroundTime && (turnaroundTime < 1 || turnaroundTime > 30)) {
      return Response.json(
        { error: 'Turnaround time must be between 1 and 30 days' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: authResult.user.id }
      }
    });

    if (existingUser) {
      return Response.json(
        { error: 'Email is already taken' },
        { status: 409 }
      );
    }

    // Update lab profile and user info in a transaction
    const updatedLab = await prisma.$transaction(async (tx) => {
      // Update user email
      await tx.user.update({
        where: { id: authResult.user.id },
        data: { email }
      });

      // Update lab profile
      const lab = await tx.lab.update({
        where: { userId: authResult.user.id },
        data: {
          name,
          services: services || [],
          turnaroundTime: turnaroundTime || 7,
          location: location || '',
          logo: logo || null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return lab;
    });

    // Format updated profile
    const profile = {
      id: updatedLab.id,
      name: updatedLab.name,
      email: updatedLab.user.email,
      services: updatedLab.services || [],
      turnaroundTime: updatedLab.turnaroundTime,
      location: updatedLab.location || '',
      rating: updatedLab.rating,
      logo: updatedLab.logo || null
    };

    return Response.json({
      message: 'Lab profile updated successfully',
      profile
    });

  } catch (error) {
    console.error('Error updating lab profile:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 