import { prisma } from '../../../../../lib/prisma.js';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Get lab details
    const lab = await prisma.lab.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    if (!lab) {
      return Response.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }

    // Fetch all reviews for this lab
    const reviews = await prisma.review.findMany({
      where: { labId: lab.userId },
      include: {
        clinic: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        case: {
          select: { id: true, title: true }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    const ratingBreakdown = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      timestamp: review.timestamp,
      case: review.case,
      clinic: {
        id: review.clinic.id,
        name: review.clinic.user.name
      }
    }));

    return Response.json({
      success: true,
      lab: {
        id: lab.id,
        name: lab.user.name,
        rating: averageRating,
        totalReviews
      },
      reviews: transformedReviews,
      statistics: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews,
        ratingBreakdown
      }
    });

  } catch (error) {
    console.error('Fetch lab reviews error:', error);
    return Response.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
