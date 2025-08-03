import { requireClinic } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

// GET clinic profile
export async function GET(request) {
  const authResult = await requireClinic(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    // Get clinic profile with user info
    const clinic = await prisma.clinic.findUnique({
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

    if (!clinic) {
      return Response.json(
        { error: 'Clinic profile not found' },
        { status: 404 }
      );
    }

    // Format profile data
    const profile = {
      id: clinic.id,
      name: clinic.name,
      email: clinic.user.email,
      phone: clinic.phone || '',
      address: clinic.address || '',
      specialties: clinic.specialties || []
    };

    return Response.json({
      message: 'Clinic profile retrieved successfully',
      profile
    });

  } catch (error) {
    console.error('Error fetching clinic profile:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT clinic profile
export async function PUT(request) {
  const authResult = await requireClinic(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { name, email, phone, address, specialties } = await request.json();

    // Validation
    if (!name || !email) {
      return Response.json(
        { error: 'Name and email are required' },
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

    // Update clinic profile and user info in a transaction
    const updatedClinic = await prisma.$transaction(async (tx) => {
      // Update user email
      await tx.user.update({
        where: { id: authResult.user.id },
        data: { email }
      });

      // Update clinic profile
      const clinic = await tx.clinic.update({
        where: { userId: authResult.user.id },
        data: {
          name,
          phone: phone || null,
          address: address || null,
          specialties: specialties || []
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

      return clinic;
    });

    // Format updated profile
    const profile = {
      id: updatedClinic.id,
      name: updatedClinic.name,
      email: updatedClinic.user.email,
      phone: updatedClinic.phone || '',
      address: updatedClinic.address || '',
      specialties: updatedClinic.specialties || []
    };

    return Response.json({
      message: 'Clinic profile updated successfully',
      profile
    });

  } catch (error) {
    console.error('Error updating clinic profile:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 