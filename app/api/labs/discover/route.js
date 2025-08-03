import { authenticateToken } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error || authResult.user.role !== 'CLINIC') {
    return Response.json(
      { error: 'Access denied. Clinic access required.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query parameters
    const specialties = searchParams.get('specialties')?.split(',').filter(Boolean) || [];
    const maxTurnaroundTime = searchParams.get('maxTurnaroundTime') ? parseInt(searchParams.get('maxTurnaroundTime')) : null;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')) : null;
    const location = searchParams.get('location') || '';
    const search = searchParams.get('search') || '';

    // Build filter conditions for the lab table
    const labWhereConditions = {};

    if (specialties.length > 0) {
      labWhereConditions.specialties = {
        hasSome: specialties
      };
    }

    if (maxTurnaroundTime) {
      labWhereConditions.turnaroundTime = {
        lte: maxTurnaroundTime
      };
    }

    if (minRating) {
      labWhereConditions.rating = {
        gte: minRating
      };
    }

    if (location) {
      labWhereConditions.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (search) {
      labWhereConditions.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          location: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Fetch lab users with their lab profiles
    const labUsers = await prisma.user.findMany({
      where: {
        role: 'LAB',
        lab: Object.keys(labWhereConditions).length > 0 ? labWhereConditions : undefined
      },
      include: {
        lab: {
          include: {
            _count: {
              select: {
                cases: true,
                favorites: true
              }
            }
          }
        }
      }
    });

    // Filter out users without lab profiles and get reviews for each lab
    const labsWithStats = await Promise.all(
      labUsers
        .filter(user => user.lab) // Only include users with lab profiles
        .map(async (user) => {
          const reviews = await prisma.review.findMany({
            where: { labId: user.lab.id },
            select: {
              rating: true,
              comment: true,
              timestamp: true
            },
            orderBy: { timestamp: 'desc' },
            take: 5
          });

          const averageRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : user.lab.rating;

          return {
            id: user.lab.id,
            userId: user.id,
            name: user.lab.name || user.name,
            email: user.email,
            location: user.lab.location,
            specialties: user.lab.specialties || [],
            services: user.lab.services || [],
            turnaroundTime: user.lab.turnaroundTime,
            rating: user.lab.rating,
            website: user.lab.website,
            phone: user.lab.phone,
            averageRating,
            totalReviews: reviews.length,
            totalCases: user.lab._count.cases,
            favoriteCount: user.lab._count.favorites,
            reviews: reviews.map(r => ({
              rating: r.rating,
              comment: r.comment,
              timestamp: r.timestamp
            }))
          };
        })
    );

    // Sort the results
    labsWithStats.sort((a, b) => {
      // Sort by rating first, then by name
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return a.name.localeCompare(b.name);
    });

    return Response.json({
      labs: labsWithStats,
      total: labsWithStats.length
    });

  } catch (error) {
    console.error('Error fetching labs:', error);
    return Response.json(
      { error: 'Failed to fetch labs' },
      { status: 500 }
    );
  }
}
