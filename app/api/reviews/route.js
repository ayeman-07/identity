import { requireClinic } from '../../../lib/auth.js';
import { prisma } from '../../../lib/prisma.js';

export async function POST(request) {
  try {
    const authResult = await requireClinic(request);
    
    if (authResult.error) {
      return Response.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { caseId, rating, comment } = await request.json();

    // Validation
    if (!caseId || !rating) {
      return Response.json(
        { error: 'Case ID and rating are required' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return Response.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Get case details
    const caseDetails = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        clinic: { select: { userId: true } },
        lab: { select: { id: true, userId: true } },
        review: true // Check if review already exists
      }
    });

    if (!caseDetails) {
      return Response.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Verify the clinic owns this case
    if (caseDetails.clinic.userId !== authResult.user.id) {
      return Response.json(
        { error: 'You can only review cases that belong to your clinic' },
        { status: 403 }
      );
    }

    // Check if case is delivered
    if (caseDetails.status !== 'DELIVERED') {
      return Response.json(
        { error: 'Reviews can only be submitted for delivered cases' },
        { status: 400 }
      );
    }

    // Check if case has an assigned lab
    if (!caseDetails.lab) {
      return Response.json(
        { error: 'Cannot review a case that was not assigned to a lab' },
        { status: 400 }
      );
    }

    // Check if review already exists
    if (caseDetails.review) {
      return Response.json(
        { error: 'A review has already been submitted for this case' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        caseId: caseId,
        clinicId: authResult.user.id,
        labId: caseDetails.lab.userId,
        rating: rating,
        comment: comment || null
      },
      include: {
        clinic: {
          select: { id: true, name: true }
        },
        lab: {
          select: { id: true, name: true }
        },
        case: {
          select: { id: true, title: true }
        }
      }
    });

    // Update lab's average rating
    const labReviews = await prisma.review.findMany({
      where: { labId: caseDetails.lab.userId },
      select: { rating: true }
    });

    const averageRating = labReviews.reduce((sum, r) => sum + r.rating, 0) / labReviews.length;

    await prisma.lab.update({
      where: { userId: caseDetails.lab.userId },
      data: { rating: averageRating }
    });

    return Response.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        timestamp: review.timestamp,
        case: review.case,
        clinic: review.clinic,
        lab: review.lab
      }
    });

  } catch (error) {
    console.error('Review submission error:', error);
    return Response.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// GET method to fetch reviews for the authenticated clinic
export async function GET(request) {
  try {
    const authResult = await requireClinic(request);
    
    if (authResult.error) {
      return Response.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { clinicId: authResult.user.id },
      include: {
        case: {
          select: { id: true, title: true }
        },
        lab: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      timestamp: review.timestamp,
      case: review.case,
      lab: {
        id: review.lab.id,
        name: review.lab.user.name
      }
    }));

    return Response.json({
      success: true,
      reviews: transformedReviews
    });

  } catch (error) {
    console.error('Fetch reviews error:', error);
    return Response.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
