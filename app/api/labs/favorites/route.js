import { authenticateToken } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function POST(request) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error || authResult.user.role !== 'CLINIC') {
    return Response.json(
      { error: 'Access denied. Clinic access required.' },
      { status: 403 }
    );
  }

  try {
    const { labId } = await request.json();

    if (!labId) {
      return Response.json(
        { error: 'Lab ID is required' },
        { status: 400 }
      );
    }

    // Get clinic
    const clinic = await prisma.clinic.findUnique({
      where: { userId: authResult.user.id }
    });

    if (!clinic) {
      return Response.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Check if lab exists
    const lab = await prisma.lab.findUnique({
      where: { id: labId }
    });

    if (!lab) {
      return Response.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteLab.findUnique({
      where: {
        clinicId_labId: {
          clinicId: clinic.id,
          labId: labId
        }
      }
    });

    if (existingFavorite) {
      return Response.json(
        { error: 'Lab is already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    const favorite = await prisma.favoriteLab.create({
      data: {
        clinicId: clinic.id,
        labId: labId
      },
      include: {
        lab: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return Response.json({
      message: 'Lab added to favorites',
      favorite
    });

  } catch (error) {
    console.error('Error adding lab to favorites:', error);
    return Response.json(
      { error: 'Failed to add lab to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error || authResult.user.role !== 'CLINIC') {
    return Response.json(
      { error: 'Access denied. Clinic access required.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const labId = searchParams.get('labId');

    if (!labId) {
      return Response.json(
        { error: 'Lab ID is required' },
        { status: 400 }
      );
    }

    // Get clinic
    const clinic = await prisma.clinic.findUnique({
      where: { userId: authResult.user.id }
    });

    if (!clinic) {
      return Response.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Remove from favorites
    const deletedFavorite = await prisma.favoriteLab.deleteMany({
      where: {
        clinicId: clinic.id,
        labId: labId
      }
    });

    if (deletedFavorite.count === 0) {
      return Response.json(
        { error: 'Lab not found in favorites' },
        { status: 404 }
      );
    }

    return Response.json({
      message: 'Lab removed from favorites'
    });

  } catch (error) {
    console.error('Error removing lab from favorites:', error);
    return Response.json(
      { error: 'Failed to remove lab from favorites' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error || authResult.user.role !== 'CLINIC') {
    return Response.json(
      { error: 'Access denied. Clinic access required.' },
      { status: 403 }
    );
  }

  try {
    // Get clinic
    const clinic = await prisma.clinic.findUnique({
      where: { userId: authResult.user.id }
    });

    if (!clinic) {
      return Response.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Get favorite labs
    const favorites = await prisma.favoriteLab.findMany({
      where: {
        clinicId: clinic.id
      },
      include: {
        lab: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                cases: true,
                reviews: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return Response.json({
      favorites: favorites.map(fav => ({
        id: fav.id,
        createdAt: fav.createdAt,
        lab: fav.lab
      }))
    });

  } catch (error) {
    console.error('Error fetching favorite labs:', error);
    return Response.json(
      { error: 'Failed to fetch favorite labs' },
      { status: 500 }
    );
  }
}
