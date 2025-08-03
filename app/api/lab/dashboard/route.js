import { requireLab } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  try {
    const authResult = await requireLab(request);
    
    if (authResult.error) {
      return Response.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Check if user has a lab profile
    if (!authResult.user.lab) {
      return Response.json(
        { error: 'Lab profile not found. Please complete your profile first.' },
        { status: 404 }
      );
    }

    const labId = authResult.user.lab.id;

    // Fetch all cases assigned to this lab
    const cases = await prisma.case.findMany({
      where: { labId },
      include: {
        clinic: {
          select: { id: true, name: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Fetch incoming cases (not yet assigned to any lab)
    const incomingCases = await prisma.case.findMany({
      where: { 
        labId: null,
        status: 'NEW'
      },
      include: {
        clinic: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate statistics
    const totalJobs = cases.length;
    const pendingJobs = incomingCases.length;
    const inProgressJobs = cases.filter(c => 
      ['ACCEPTED', 'IN_PROGRESS'].includes(c.status)
    ).length;
    const completedJobs = cases.filter(c => c.status === 'DELIVERED').length;

    // Status breakdown
    const statusBreakdown = {
      NEW: incomingCases.length,
      ACCEPTED: cases.filter(c => c.status === 'ACCEPTED').length,
      IN_PROGRESS: cases.filter(c => c.status === 'IN_PROGRESS').length,
      READY: cases.filter(c => c.status === 'READY').length,
      DISPATCHED: cases.filter(c => c.status === 'DISPATCHED').length,
      DELIVERED: cases.filter(c => c.status === 'DELIVERED').length,
      CANCELLED: cases.filter(c => c.status === 'CANCELLED').length,
      REJECTED: cases.filter(c => c.status === 'REJECTED').length
    };

    // Calculate earnings (estimated values based on case types)
    const priceEstimates = {
      'crown': 150,
      'bridge': 350,
      'implant': 400,
      'denture': 250,
      'default': 200
    };

    const completedCases = cases.filter(c => c.status === 'DELIVERED');
    const totalEarnings = completedCases.reduce((sum, c) => {
      // Estimate price based on case title/description
      const caseType = Object.keys(priceEstimates).find(type => 
        c.title.toLowerCase().includes(type) ||
        c.description?.toLowerCase().includes(type)
      );
      return sum + (priceEstimates[caseType] || priceEstimates.default);
    }, 0);

    const recentEarnings = completedCases.slice(0, 5).map(c => {
      const caseType = Object.keys(priceEstimates).find(type => 
        c.title.toLowerCase().includes(type) ||
        c.description?.toLowerCase().includes(type)
      );
      return {
        caseId: c.id,
        caseTitle: c.title,
        clinicName: c.clinic.name,
        estimatedEarning: priceEstimates[caseType] || priceEstimates.default,
        completedAt: c.updatedAt
      };
    });

    // Get lab rating from reviews
    const reviews = await prisma.review.findMany({
      where: { labId },
      orderBy: { timestamp: 'desc' }
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : authResult.user.lab.rating || 0;

    // Calculate average turnaround time
    const deliveredCases = cases.filter(c => c.status === 'DELIVERED');
    let averageTurnaroundDays = 0;
    if (deliveredCases.length > 0) {
      const totalDays = deliveredCases.reduce((sum, c) => {
        const createdDate = new Date(c.createdAt);
        const deliveredDate = new Date(c.updatedAt);
        const daysDiff = Math.ceil((deliveredDate - createdDate) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }, 0);
      averageTurnaroundDays = Math.round(totalDays / deliveredCases.length);
    }

    // Get recent active jobs
    const activeJobs = cases.filter(c => 
      ['ACCEPTED', 'IN_PROGRESS', 'READY'].includes(c.status)
    ).slice(0, 5);

    // Get recent messages from clinics
    const recentMessages = await prisma.message.findMany({
      where: {
        case: { labId },
        sender: { role: 'CLINIC' } // Only messages from clinics
      },
      include: {
        case: {
          select: { id: true, title: true }
        },
        sender: {
          select: { name: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    return Response.json({
      success: true,
      data: {
        lab: {
          id: authResult.user.lab.id,
          name: authResult.user.lab.name,
          rating: averageRating
        },
        stats: {
          totalJobs,
          pendingJobs,
          inProgressJobs,
          completedJobs,
          statusBreakdown,
          totalEarnings,
          averageTurnaroundDays,
          totalReviews: reviews.length
        },
        activeJobs: activeJobs.map(c => ({
          id: c.id,
          title: c.title,
          status: c.status,
          clinicName: c.clinic.name,
          updatedAt: c.updatedAt,
          messageCount: c._count.messages
        })),
        incomingCases: incomingCases.map(c => ({
          id: c.id,
          title: c.title,
          clinicName: c.clinic.name,
          createdAt: c.createdAt
        })),
        recentEarnings,
        recentReviews: reviews.slice(0, 3).map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment?.substring(0, 100) + (r.comment?.length > 100 ? '...' : ''),
          timestamp: r.timestamp
        })),
        recentMessages: recentMessages.map(m => ({
          id: m.id,
          content: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : ''),
          timestamp: m.timestamp,
          caseId: m.case.id,
          caseTitle: m.case.title,
          senderName: m.sender.name
        }))
      }
    });
  } catch (error) {
    console.error('Lab dashboard error:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 